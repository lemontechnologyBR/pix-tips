import {
  COMMISSION_FIXED_FEE,
  COMMISSION_RATE,
  computePayoutFee,
  formatCommissionLabel,
  MIN_WITHDRAW_AMOUNT,
} from "@/lib/finance";
import { resolveCpfProvider } from "@/lib/kyc/cpf-provider";
import { isDiditConfigured } from "@/lib/didit";
import { isEmailConfigured } from "@/lib/email/email-client";
import { isMercadoPagoConfigured } from "@/lib/payments/mercadopago";

export interface AdminPlatformStatus {
  appUrl: string;
  email: {
    configured: boolean;
    provider: "smtp" | "resend" | "none";
    from: string;
    smtpHost: string | null;
    smtpUser: string | null;
  };
  fees: {
    commissionLabel: string;
    commissionRate: number;
    commissionFixedFee: number;
    payoutFee: number;
    minWithdraw: number;
  };
  integrations: {
    mercadoPago: boolean;
    didit: boolean;
    cpfProvider: string;
  };
}

export function getAdminPlatformStatus(): AdminPlatformStatus {
  const smtpHost = process.env.SMTP_HOST?.trim() || null;
  const smtpUser = process.env.SMTP_USER?.trim() || null;
  const hasSmtp = Boolean(smtpHost && smtpUser && process.env.SMTP_PASS?.trim());
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());

  return {
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "https://pix.tips",
    email: {
      configured: isEmailConfigured(),
      provider: hasSmtp ? "smtp" : hasResend ? "resend" : "none",
      from: process.env.EMAIL_FROM ?? "noreply@pix.tips",
      smtpHost,
      smtpUser,
    },
    fees: {
      commissionLabel: formatCommissionLabel(),
      commissionRate: COMMISSION_RATE,
      commissionFixedFee: COMMISSION_FIXED_FEE,
      payoutFee: computePayoutFee(),
      minWithdraw: MIN_WITHDRAW_AMOUNT,
    },
    integrations: {
      mercadoPago: isMercadoPagoConfigured(),
      didit: isDiditConfigured(),
      cpfProvider: resolveCpfProvider(),
    },
  };
}
