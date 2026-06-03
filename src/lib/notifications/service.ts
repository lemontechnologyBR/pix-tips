import { prisma } from "@/lib/db";

export type NotificationType = "donation" | "system" | "promo";

export type NotificationFilter = "all" | NotificationType;

export interface NotificationRecord {
  id: string;
  creatorId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
}

const PAGE_SIZE = 10;

function mapNotification(row: {
  id: string;
  creatorId: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}): NotificationRecord {
  return {
    id: row.id,
    creatorId: row.creatorId,
    type: row.type as NotificationType,
    title: row.title,
    body: row.body,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createNotification(
  creatorId: string,
  input: CreateNotificationInput,
): Promise<NotificationRecord> {
  const row = await prisma.notification.create({
    data: {
      creatorId,
      type: input.type,
      title: input.title,
      body: input.body,
    },
  });
  return mapNotification(row);
}

export async function listNotifications(
  creatorId: string,
  options: { filter?: NotificationFilter; page?: number; limit?: number } = {},
): Promise<{
  items: NotificationRecord[];
  total: number;
  page: number;
  totalPages: number;
  unreadCount: number;
}> {
  const filter = options.filter ?? "all";
  const page = Math.max(1, options.page ?? 1);
  const limit = options.limit ?? PAGE_SIZE;

  const where = {
    creatorId,
    ...(filter !== "all" ? { type: filter } : {}),
  };

  const [rows, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { creatorId, read: false } }),
  ]);

  return {
    items: rows.map(mapNotification),
    total,
    page,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    unreadCount,
  };
}

export async function markRead(
  creatorId: string,
  id: string,
): Promise<NotificationRecord | null> {
  const existing = await prisma.notification.findFirst({
    where: { id, creatorId },
  });
  if (!existing) return null;

  const row = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  return mapNotification(row);
}

export async function markAllRead(creatorId: string): Promise<number> {
  const result = await prisma.notification.updateMany({
    where: { creatorId, read: false },
    data: { read: true },
  });
  return result.count;
}

export async function deleteRead(creatorId: string): Promise<number> {
  const result = await prisma.notification.deleteMany({
    where: { creatorId, read: true },
  });
  return result.count;
}

export async function getUnreadCount(creatorId: string): Promise<number> {
  return prisma.notification.count({
    where: { creatorId, read: false },
  });
}
