import { prisma } from "@/lib/db";

export async function createUser(input: {
  id?: string;
  email: string;
  passwordHash: string;
  name: string;
  role?: string;
  emailVerified?: boolean;
}) {
  return prisma.user.create({
    data: {
      id: input.id,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      name: input.name,
      role: input.role ?? "user",
      emailVerified: input.emailVerified ?? false,
    },
  });
}

export async function findByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateResetToken(
  userId: string,
  resetToken: string,
  resetTokenExpiry: Date,
) {
  return prisma.user.update({
    where: { id: userId },
    data: { resetToken, resetTokenExpiry },
  });
}

export async function updateUserRole(userId: string, role: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export async function clearResetToken(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { resetToken: null, resetTokenExpiry: null },
  });
}
