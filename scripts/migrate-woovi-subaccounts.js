/**
 * One-shot: cria subcontas pixtips_* (exceto demo), liquida saldo legado via Pix Out Woovi,
 * zera ledger e grava vínculo no Postgres.
 *
 * Roda DENTRO do container app (tem WOOVI_AUTH_TOKEN).
 */
const https = require("https");
const { Client } = require("pg");

const WOOVI_HOST = "api.woovi.com";
const EXCLUDE = new Set(["demo"]);

function req(method, path, body) {
  return new Promise((resolve) => {
    const token = process.env.WOOVI_AUTH_TOKEN || "";
    const data = body ? JSON.stringify(body) : null;
    const r = https.request(
      {
        hostname: WOOVI_HOST,
        path,
        method,
        headers: {
          Authorization: token,
          Accept: "application/json",
          ...(data
            ? {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(data),
              }
            : {}),
        },
        timeout: 30000,
      },
      (res) => {
        let d = "";
        res.on("data", (c) => (d += c));
        res.on("end", () => resolve({ status: res.statusCode, body: d }));
      },
    );
    r.on("error", (e) => resolve({ status: 0, body: String(e) }));
    r.on("timeout", () => {
      r.destroy();
      resolve({ status: 0, body: "timeout" });
    });
    if (data) r.write(data);
    r.end();
  });
}

function buildName(username) {
  const slug = String(username || "creator")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return `pixtips_${slug || "creator"}`.slice(0, 100);
}

function normalizePix(key, type) {
  let k = String(key || "").trim();
  if (!k) return "";
  if (type === "cpf" || type === "phone" || /^\d[\d.\-\s]+$/.test(k)) {
    k = k.replace(/\D/g, "");
  }
  return k;
}

async function listSubs() {
  const all = [];
  let skip = 0;
  for (;;) {
    const r = await req("GET", `/api/v1/subaccount?skip=${skip}&limit=100`);
    if (r.status !== 200) throw new Error(`list subaccounts ${r.status} ${r.body}`);
    const j = JSON.parse(r.body);
    const batch = j.subAccounts || [];
    all.push(...batch);
    if (batch.length < 100) break;
    skip += 100;
  }
  return all;
}

async function ensureSub(name, pixKey) {
  const all = await listSubs();
  const existing = all.find((s) => s.pixKey === pixKey);
  if (existing) return { name: existing.name, pixKey: existing.pixKey, created: false };

  const r = await req("POST", "/api/v1/subaccount", { name, pixKey });
  if (r.status >= 200 && r.status < 300) {
    const j = JSON.parse(r.body);
    return {
      name: j.subAccount?.name || name,
      pixKey: j.subAccount?.pixKey || pixKey,
      created: true,
    };
  }
  // race / already exists
  const again = (await listSubs()).find((s) => s.pixKey === pixKey);
  if (again) return { name: again.name, pixKey: again.pixKey, created: false };
  throw new Error(`create sub failed ${r.status} ${r.body}`);
}

async function payLegacy(correlationID, valueCents, destinationAlias, comment) {
  if (valueCents < 1) return { skipped: true };
  const create = await req("POST", "/api/v1/payment", {
    correlationID,
    value: valueCents,
    destinationAlias,
    comment: comment.slice(0, 140),
  });
  if (create.status !== 200) {
    throw new Error(`payment create ${create.status} ${create.body}`);
  }
  const approve = await req("POST", "/api/v1/payment/approve", { correlationID });
  if (approve.status !== 200) {
    throw new Error(`payment approve ${approve.status} ${approve.body}`);
  }
  return { skipped: false, correlationID };
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL missing");
  if (!process.env.WOOVI_AUTH_TOKEN) throw new Error("WOOVI_AUTH_TOKEN missing");

  const pg = new Client({ connectionString: databaseUrl });
  await pg.connect();

  const { rows } = await pg.query(`
    SELECT id, username, "pixKey", "pixKeyType", "pixHolderName",
           "availableBalance", "wooviSubaccountName", "wooviPixKey"
    FROM "Creator"
    WHERE "pixKey" IS NOT NULL AND btrim("pixKey") <> ''
    ORDER BY username
  `);

  console.log(`candidates=${rows.length} (excluding demo)`);

  for (const row of rows) {
    if (EXCLUDE.has(String(row.username).toLowerCase())) {
      console.log(`SKIP demo ${row.username}`);
      continue;
    }

    const pixKey = normalizePix(row.pixKey, row.pixKeyType);
    if (!pixKey) {
      console.log(`SKIP empty pix ${row.username}`);
      continue;
    }

    const desiredName = buildName(row.username);
    try {
      const sub = await ensureSub(desiredName, pixKey);
      console.log(
        `SUB ${row.username} -> ${sub.name} (${sub.created ? "created" : "existing"}) pix=${pixKey}`,
      );

      await pg.query(
        `UPDATE "Creator"
         SET "wooviSubaccountName" = $1,
             "wooviPixKey" = $2,
             "wooviPixKeyType" = COALESCE("pixKeyType", "wooviPixKeyType")
         WHERE id = $3`,
        [sub.name, sub.pixKey, row.id],
      );

      const bal = Number(row.availableBalance || 0);
      if (bal > 0.01) {
        const cents = Math.round(bal * 100);
        const corr = `migrate_${row.username}_${Date.now()}`;
        console.log(`PAY ${row.username} R$ ${bal.toFixed(2)} (${cents} cents) -> ${pixKey}`);
        await payLegacy(
          corr,
          cents,
          pixKey,
          `Migração saldo legado pix.tips @${row.username}`,
        );

        await pg.query(
          `INSERT INTO "Payout" (id, "creatorId", amount, fee, status, "pixKey", "createdAt", "completedAt")
           VALUES ($1, $2, $3, 0, 'completed', $4, NOW(), NOW())`,
          [
            `mig_${row.username}_${Date.now()}`.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 25),
            row.id,
            bal,
            row.pixKey,
          ],
        );

        await pg.query(
          `UPDATE "Creator"
           SET "availableBalance" = 0,
               "totalWithdrawn" = COALESCE("totalWithdrawn",0) + $1
           WHERE id = $2`,
          [bal, row.id],
        );
        console.log(`LEDGER ZEROED ${row.username}`);
      } else {
        console.log(`NO_BALANCE ${row.username}`);
      }
    } catch (err) {
      console.error(`FAIL ${row.username}:`, err.message || err);
    }
  }

  await pg.end();
  console.log("DONE");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
