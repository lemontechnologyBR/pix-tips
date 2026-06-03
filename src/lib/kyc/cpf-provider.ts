import { normalizeCpf } from "@/lib/kyc";
import { birthDatesMatch, namesMatch } from "@/lib/kyc/cpf-match";

export type CpfProviderId =
  | "none"
  | "mock"
  | "serpro-demo"
  | "serpro"
  | "cpfcnpj"
  | "workbuscas";

export type CpfVerificationStatus =
  | "skipped"
  | "mock"
  | "matched"
  | "mismatch"
  | "cpf_not_found"
  | "error";

export interface CpfVerificationInput {
  cpf: string;
  legalName: string;
  birthDate: string;
}

export interface CpfVerificationResult {
  status: CpfVerificationStatus;
  provider: CpfProviderId;
  message?: string;
  nameMatch?: boolean;
  birthDateMatch?: boolean;
  cpfRegular?: boolean;
  mock?: boolean;
}

const SERPRO_DEMO_URL =
  "https://gateway.apiserpro.serpro.gov.br/datavalid-demonstracao/v4/pf-basica";
const SERPRO_DEMO_BEARER =
  process.env.SERPRO_DEMO_BEARER ?? "06aef429-a981-3ec5-a1f8-71d38d86481e";
const SERPRO_TOKEN_URL = "https://gateway.apiserpro.serpro.gov.br/token";

let serproTokenCache: { token: string; expiresAt: number } | null = null;

export function resolveCpfProvider(): CpfProviderId {
  const configured = process.env.KYC_CPF_PROVIDER?.trim().toLowerCase();
  if (configured === "none") return "none";
  if (configured === "mock") return "mock";
  if (configured === "serpro-demo") return "serpro-demo";
  if (configured === "serpro") return "serpro";
  if (configured === "cpfcnpj") return "cpfcnpj";
  if (configured === "workbuscas") return "workbuscas";

  if (process.env.SERPRO_CONSUMER_KEY && process.env.SERPRO_CONSUMER_SECRET) {
    return "serpro";
  }
  if (process.env.CPF_CNPJ_API_TOKEN && process.env.CPF_CNPJ_PACKAGE_ID) {
    return "cpfcnpj";
  }
  if (process.env.WORKBUSCAS_TOKEN) {
    return "workbuscas";
  }

  return "none";
}

export function cpfVerificationStatusLabel(status: CpfVerificationStatus | null | undefined): string {
  switch (status) {
    case "matched":
      return "CPF conferido";
    case "mismatch":
      return "Dados divergentes";
    case "cpf_not_found":
      return "CPF não encontrado";
    case "mock":
      return "Simulado (dev)";
    case "skipped":
      return "Sem consulta externa";
    case "error":
      return "Erro na consulta";
    default:
      return "—";
  }
}

async function getSerproAccessToken(): Promise<string | null> {
  const key = process.env.SERPRO_CONSUMER_KEY;
  const secret = process.env.SERPRO_CONSUMER_SECRET;
  if (!key || !secret) return null;

  if (serproTokenCache && serproTokenCache.expiresAt > Date.now() + 60_000) {
    return serproTokenCache.token;
  }

  const basic = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(SERPRO_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    console.error("[kyc/cpf] Serpro token error:", res.status);
    return null;
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) return null;

  serproTokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
  };

  return data.access_token;
}

interface SerproRfbValidation {
  nome?: boolean;
  nome_similaridade?: number;
  situacao_cpf?: boolean;
  data_nascimento?: boolean;
}

interface SerproResponse {
  rfb_existe?: boolean;
  rfb?: SerproRfbValidation;
}

async function verifyWithSerpro(
  input: CpfVerificationInput,
  mode: "serpro-demo" | "serpro",
): Promise<CpfVerificationResult> {
  const cpf = normalizeCpf(input.cpf);
  const url =
    mode === "serpro-demo"
      ? SERPRO_DEMO_URL
      : (process.env.SERPRO_DATAVALID_URL ??
        "https://gateway.apiserpro.serpro.gov.br/datavalid/v4/pf-basica");

  const token =
    mode === "serpro-demo" ? SERPRO_DEMO_BEARER : await getSerproAccessToken();

  if (!token) {
    return {
      status: "error",
      provider: mode,
      message: "Credenciais Serpro não configuradas.",
    };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        cpf,
        validacao: {
          nome: input.legalName.trim(),
          situacao_cpf: "regular",
          data_nascimento: input.birthDate,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[kyc/cpf] Serpro HTTP", res.status, body.slice(0, 200));
      return {
        status: "error",
        provider: mode,
        message:
          mode === "serpro-demo"
            ? "Falha no sandbox Serpro. Use CPF demo 257.744.350-16 com nome e data do manual."
            : "Não foi possível consultar o CPF agora. Tente novamente.",
      };
    }

    const data = (await res.json()) as SerproResponse;
    const rfb = data.rfb;

    if (!data.rfb_existe) {
      return {
        status: "cpf_not_found",
        provider: mode,
        message: "CPF não encontrado na base da Receita Federal.",
        cpfRegular: false,
      };
    }

    const nameMatch =
      rfb?.nome === true ||
      (typeof rfb?.nome_similaridade === "number" && rfb.nome_similaridade >= 0.85);
    const birthDateMatch = rfb?.data_nascimento === true;
    const cpfRegular = rfb?.situacao_cpf === true;

    if (nameMatch && birthDateMatch && cpfRegular) {
      return {
        status: "matched",
        provider: mode,
        nameMatch: true,
        birthDateMatch: true,
        cpfRegular: true,
        message: "Dados conferidos com a Receita Federal.",
      };
    }

    const issues: string[] = [];
    if (!nameMatch) issues.push("nome");
    if (!birthDateMatch) issues.push("data de nascimento");
    if (!cpfRegular) issues.push("situação cadastral");

    return {
      status: "mismatch",
      provider: mode,
      nameMatch,
      birthDateMatch,
      cpfRegular,
      message: `Dados não conferem: ${issues.join(", ")}.`,
    };
  } catch (error) {
    console.error("[kyc/cpf] Serpro request failed:", error);
    return {
      status: "error",
      provider: mode,
      message: "Erro ao consultar Serpro Datavalid.",
    };
  }
}

interface CpfCnpjResponse {
  status?: number | boolean;
  nome?: string;
  nascimento?: string;
  situacao?: string;
  erro?: string;
  erroCodigo?: number;
}

async function verifyWithCpfCnpj(input: CpfVerificationInput): Promise<CpfVerificationResult> {
  const token = process.env.CPF_CNPJ_API_TOKEN;
  const packageId = process.env.CPF_CNPJ_PACKAGE_ID;
  if (!token || !packageId) {
    return {
      status: "error",
      provider: "cpfcnpj",
      message: "CPF.CNPJ não configurado.",
    };
  }

  const cpf = normalizeCpf(input.cpf);
  const url = `https://api.cpfcnpj.com.br/${encodeURIComponent(token)}/${encodeURIComponent(packageId)}/${cpf}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("[kyc/cpf] CPF.CNPJ HTTP", res.status);
      return {
        status: "error",
        provider: "cpfcnpj",
        message: "Falha ao consultar CPF.CNPJ.",
      };
    }

    const data = (await res.json()) as CpfCnpjResponse;
    const ok = data.status === 1 || data.status === true;

    if (!ok || !data.nome) {
      return {
        status: "cpf_not_found",
        provider: "cpfcnpj",
        message: data.erro ?? "CPF não encontrado ou inválido.",
        cpfRegular: false,
      };
    }

    const nameMatch = namesMatch(input.legalName, data.nome);
    const birthDateMatch = data.nascimento
      ? birthDatesMatch(input.birthDate, data.nascimento)
      : true;
    const cpfRegular = !data.situacao || /regular|ativa/i.test(data.situacao);

    if (nameMatch && birthDateMatch && cpfRegular) {
      return {
        status: "matched",
        provider: "cpfcnpj",
        nameMatch: true,
        birthDateMatch,
        cpfRegular,
        message: "Dados conferidos com a Receita Federal.",
      };
    }

    const issues: string[] = [];
    if (!nameMatch) issues.push("nome");
    if (!birthDateMatch) issues.push("data de nascimento");
    if (!cpfRegular) issues.push("situação cadastral");

    return {
      status: "mismatch",
      provider: "cpfcnpj",
      nameMatch,
      birthDateMatch,
      cpfRegular,
      message: `Dados não conferem: ${issues.join(", ")}.`,
    };
  } catch (error) {
    console.error("[kyc/cpf] CPF.CNPJ request failed:", error);
    return {
      status: "error",
      provider: "cpfcnpj",
      message: "Erro ao consultar CPF.CNPJ.",
    };
  }
}

interface WorkbuscasResponse {
  status?: number;
  DadosBasicos?: {
    nome?: string;
    cpf?: string;
    dataNascimento?: string;
    situacaoCadastral?: {
      descricaoSituacaoCadastral?: string;
    };
  };
}

async function verifyWithWorkbuscas(
  input: CpfVerificationInput,
): Promise<CpfVerificationResult> {
  const token = process.env.WORKBUSCAS_TOKEN?.trim();
  if (!token) {
    return {
      status: "error",
      provider: "workbuscas",
      message: "Workbuscas não configurado.",
    };
  }

  const cpf = normalizeCpf(input.cpf);
  const baseUrl =
    process.env.WORKBUSCAS_API_URL?.trim() ??
    "https://completa.workbuscas.com/api";
  const url = new URL(baseUrl);
  url.searchParams.set("token", token);
  url.searchParams.set("modulo", "cpf");
  url.searchParams.set("consulta", cpf);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("[kyc/cpf] Workbuscas HTTP", res.status);
      return {
        status: "error",
        provider: "workbuscas",
        message: "Falha ao consultar CPF.",
      };
    }

    const data = (await res.json()) as WorkbuscasResponse;
    const dados = data.DadosBasicos;
    const returnedCpf = normalizeCpf(dados?.cpf ?? "");
    const returnedName = dados?.nome?.trim() ?? "";
    const returnedBirthDate = dados?.dataNascimento?.trim() ?? "";
    const situation = dados?.situacaoCadastral?.descricaoSituacaoCadastral ?? "";

    if (data.status !== 200 || !dados || returnedCpf !== cpf || !returnedName) {
      return {
        status: "cpf_not_found",
        provider: "workbuscas",
        message: "CPF não encontrado ou inválido.",
        cpfRegular: false,
      };
    }

    const nameMatch = namesMatch(input.legalName, returnedName);
    const birthDateMatch = birthDatesMatch(input.birthDate, returnedBirthDate);
    const cpfRegular = /regular/i.test(situation);

    if (nameMatch && birthDateMatch && cpfRegular) {
      return {
        status: "matched",
        provider: "workbuscas",
        nameMatch: true,
        birthDateMatch: true,
        cpfRegular: true,
        message: "Dados conferidos com a consulta de CPF.",
      };
    }

    const issues: string[] = [];
    if (!nameMatch) issues.push("nome");
    if (!birthDateMatch) issues.push("data de nascimento");
    if (!cpfRegular) issues.push("situação cadastral");

    return {
      status: "mismatch",
      provider: "workbuscas",
      nameMatch,
      birthDateMatch,
      cpfRegular,
      message: `Dados não conferem: ${issues.join(", ")}.`,
    };
  } catch (error) {
    console.error("[kyc/cpf] Workbuscas request failed:", error);
    return {
      status: "error",
      provider: "workbuscas",
      message: "Erro ao consultar CPF.",
    };
  }
}

export async function verifyCpfIdentity(
  input: CpfVerificationInput,
): Promise<CpfVerificationResult> {
  const provider = resolveCpfProvider();

  if (provider === "none") {
    return {
      status: "skipped",
      provider,
      message: "Consulta externa desativada. Apenas validação local do CPF.",
    };
  }

  if (provider === "mock") {
    return {
      status: "mock",
      provider,
      mock: true,
      nameMatch: true,
      birthDateMatch: true,
      cpfRegular: true,
      message: "Verificação simulada (KYC_CPF_PROVIDER=mock).",
    };
  }

  if (provider === "serpro-demo" || provider === "serpro") {
    return verifyWithSerpro(input, provider);
  }

  if (provider === "workbuscas") {
    return verifyWithWorkbuscas(input);
  }

  return verifyWithCpfCnpj(input);
}

export function isCpfVerificationBlocking(result: CpfVerificationResult): boolean {
  return result.status === "mismatch" || result.status === "cpf_not_found";
}
