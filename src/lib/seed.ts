import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import {
  defaultAlertSettings,
  defaultTipPageSettings,
} from "@/lib/repositories/json-fields";
import {
  DEMO_CREATOR_ID,
  DEMO_EMAIL,
  DEMO_USERNAME,
  DEMO_WIDGET_TOKEN,
} from "@/lib/demo";
import * as creatorRepo from "@/lib/repositories/creator-repository";
import {
  seedDemoPayouts,
  syncCreatorBalance,
} from "@/lib/repositories/finance-repository";
import { seedDemoTransactions } from "@/lib/repositories/transaction-repository";
import * as userRepo from "@/lib/repositories/user-repository";
import { prisma } from "@/lib/db";

const DEMO_USER_ID = "user-demo-001";

function demoTipPageSettings() {
  return {
    ...defaultTipPageSettings(),
    thankYouMessage: "Obrigado pelo apoio! Esta é uma página de demonstração.",
    tipTtsEnabled: true,
    tipTtsVoices: [
      "helena-ia",
      "rafael-ia",
      "aurora-ia",
      "ricardo-br",
      "vitoria-br",
    ],
  };
}

async function seedDemoNotifications(creatorId: string): Promise<void> {
  const existing = await prisma.notification.count({ where: { creatorId } });
  if (existing > 0) return;

  const samples = [
    {
      type: "donation",
      title: "Nova doação!",
      body: "João doou R$ 15,00",
      read: false,
    },
    {
      type: "donation",
      title: "Nova doação!",
      body: "Maria doou R$ 25,00",
      read: false,
    },
    {
      type: "system",
      title: "Novos templates disponíveis",
      body: "Confira os novos templates de alerta no painel.",
      read: true,
    },
    {
      type: "promo",
      title: "Plano Pro com 20% off",
      body: "Upgrade para o Pro e desbloqueie todos os recursos.",
      read: false,
    },
  ];

  await prisma.notification.createMany({
    data: samples.map((sample) => ({ creatorId, ...sample })),
  });
}

async function seedDemoKyc(creatorId: string): Promise<void> {
  await prisma.kycVerification.upsert({
    where: { creatorId },
    create: {
      creatorId,
      status: "approved",
      legalName: "Streamer Demo",
      cpf: "52998224725",
      birthDate: new Date("1995-06-15T12:00:00.000Z"),
      documentType: "rg",
      documentFrontKey: `${creatorId}/kyc/demo-front.jpg`,
      documentBackKey: `${creatorId}/kyc/demo-back.jpg`,
      selfieKey: `${creatorId}/kyc/demo-selfie.jpg`,
      submittedAt: new Date(),
      reviewedAt: new Date(),
    },
    update: {
      status: "approved",
      reviewedAt: new Date(),
    },
  });
}


export async function ensureDemoSeeded(): Promise<void> {
  const existing = await creatorRepo.getByUsername(DEMO_USERNAME);
  if (existing) {
    await creatorRepo.update(existing.id, {
      onboardingCompleted: true,
      bio: "Página de demonstração do pix.tips. Teste uma doação simulada — nenhum Pix real é cobrado.",
      themeColor: "#06b6d4",
      tipPageSettings: demoTipPageSettings(),
      notifyEmailDonation: false,
      notifyPanelDonation: false,
    });
    await seedDemoTransactions(existing.id);
    await seedDemoPayouts(existing.id);
    await syncCreatorBalance(existing.id);
    await seedDemoNotifications(existing.id);
    await seedDemoKyc(existing.id);
    return;
  }

  let user = await userRepo.findByEmail(DEMO_EMAIL);
  if (!user) {
    const randomPassword = randomBytes(16).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);
    user = await userRepo.createUser({
      id: DEMO_USER_ID,
      email: DEMO_EMAIL,
      passwordHash,
      name: "Streamer Demo",
      role: "user",
      emailVerified: true,
    });
  }

  const alertSettings = defaultAlertSettings();
  const tipPageSettings = demoTipPageSettings();

  await creatorRepo.create({
    id: DEMO_CREATOR_ID,
    userId: user.id,
    username: DEMO_USERNAME,
    displayName: "Streamer Demo",
    bio: "Página de demonstração do pix.tips. Teste uma doação simulada — nenhum Pix real é cobrado.",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=demo",
    goal: 500,
    themeColor: "#06b6d4",
    plan: "free",
    widgetToken: DEMO_WIDGET_TOKEN,
    paymentMethods: JSON.stringify(["pix"]),
    alertSettings: JSON.stringify(alertSettings),
    tipPageSettings: JSON.stringify(tipPageSettings),
  });

  const creator = await creatorRepo.getById(DEMO_CREATOR_ID);
  if (creator) {
    await creatorRepo.update(DEMO_CREATOR_ID, {
      raised: 127.5,
      onboardingCompleted: true,
      notifyEmailDonation: false,
      notifyPanelDonation: false,
    });
    await seedDemoTransactions(DEMO_CREATOR_ID);
    await seedDemoPayouts(DEMO_CREATOR_ID);
    await syncCreatorBalance(DEMO_CREATOR_ID);
    await seedDemoNotifications(DEMO_CREATOR_ID);
    await seedDemoKyc(DEMO_CREATOR_ID);
  }
}

async function main() {
  await ensureDemoSeeded();
  console.log("Seed concluído: usuário demo@pix.tips / criador @demo");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { prisma } = await import("@/lib/db");
    await prisma.$disconnect();
  });
