import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/socket-server";
import { getCreatorById } from "./src/lib/store";
import { startTwitchChatBot } from "./src/lib/chat-bot/twitch-bot";
import { getPrisma } from "./src/lib/db";

const dev = process.env.NODE_ENV !== "production";
const hostname =
  process.env.HOSTNAME ??
  (process.env.NODE_ENV === "production" ? "0.0.0.0" : "localhost");
const port = parseInt(process.env.PORT ?? "3000", 10);
const dir = path.dirname(fileURLToPath(import.meta.url));

const REQUIRED_ENV = ["AUTH_SECRET", "DATABASE_URL", "NEXT_PUBLIC_APP_URL"];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[boot] Missing required env var: ${key}`);
    if (!dev) process.exit(1);
  }
}

const app = next({ dev, hostname, port, dir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const allowedOrigins = [
    process.env.NEXT_PUBLIC_APP_URL,
    ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
  ].filter(Boolean) as string[];

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  setIO(io);

  const alertsNs = io.of("/alerts");

  alertsNs.on("connection", async (socket) => {
    const userId = socket.handshake.auth.userId as string | undefined;
    const token = socket.handshake.auth.token as string | undefined;
    const transactionId = socket.handshake.auth.transactionId as
      | string
      | undefined;

    if (transactionId) {
      try {
        const db = getPrisma();
        const tx = await db.transaction.findUnique({
          where: { id: transactionId },
          select: { id: true },
        });
        if (!tx) {
          socket.disconnect();
          return;
        }
        socket.join(`tx:${transactionId}`);
      } catch (err) {
        console.error("[socket] Erro ao validar transactionId:", err);
        socket.disconnect();
      }
      return;
    }

    if (!userId || !token) {
      socket.disconnect();
      return;
    }

    const creator = await getCreatorById(userId);
    if (!creator || creator.widgetToken !== token) {
      socket.disconnect();
      return;
    }

    socket.join(userId);
  });

  httpServer.listen(port, () => {
    console.log(`> pix.tips rodando em http://${hostname}:${port}`);
    if (dev) {
      console.log(`> pix.tips demo: http://${hostname}:${port}/demo`);
      console.log(
        `> Widget alertas OBS: http://${hostname}:${port}/widget/alert/creator-demo-001?token=demo-widget-token-abc123`,
      );
      console.log(
        `> Widget QR Code OBS: http://${hostname}:${port}/widget/qrcode/creator-demo-001?token=demo-widget-token-abc123`,
      );
      console.log(
        `> Widget metas OBS: http://${hostname}:${port}/widget/goal/creator-demo-001?token=demo-widget-token-abc123`,
      );
    }
    void startTwitchChatBot();
  });
});
