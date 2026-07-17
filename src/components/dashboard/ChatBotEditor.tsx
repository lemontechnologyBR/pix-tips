"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { tipPageUrl } from "@/lib/brand";
import {
  DEFAULT_ROTATING_INTERVAL_SEC,
  MAX_ROTATING,
  MIN_ROTATING_INTERVAL_SEC,
  renderCommandResponse,
} from "@/lib/chat-bot/settings";
import { ChatBotIcon, type ChatBotIconName } from "@/components/dashboard/ChatBotIcon";
import type {
  ChatBotCommand,
  ChatBotRotatingMessage,
  ChatBotSettings,
} from "@/types";

interface ChatBotProfile {
  settings: ChatBotSettings;
  twitchConnected: boolean;
  twitchChannel: string | null;
  botConfigured: boolean;
  botUsername: string | null;
  tipPageUrl: string;
}

interface ChatBotEditorProps {
  initialProfile: ChatBotProfile;
  username: string;
  displayName: string;
}

const COMMAND_ICONS: Record<string, ChatBotIconName> = {
  pix: "pix",
  doar: "doar",
  ajuda: "ajuda",
};

const VARIABLES = ["{url}", "{nome}", "{usuario}"] as const;

function newCommandId() {
  return `custom-${Date.now().toString(36)}`;
}

function newRotatingId() {
  return `rot-${Date.now().toString(36)}`;
}

function formatIntervalLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.round(seconds / 60);
  return m === 1 ? "1 min" : `${m} min`;
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: ChatBotIconName;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
        <ChatBotIcon name={icon} className="h-5 w-5" />
      </div>
      <div>
        <h2 className="font-semibold text-white">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        )}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
        checked ? "bg-cyan-500" : "bg-zinc-700"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: ChatBotIconName;
  label: string;
  value: React.ReactNode;
  tone: "ok" | "warn" | "neutral";
}) {
  const tones = {
    ok: "border-emerald-500/25 bg-emerald-500/[0.06] text-emerald-300",
    warn: "border-amber-500/25 bg-amber-500/[0.06] text-amber-300",
    neutral: "border-zinc-800 bg-zinc-950/40 text-zinc-400",
  };

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2">
        <ChatBotIcon name={icon} className="h-4 w-4 opacity-80" />
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}

export function ChatBotEditor({
  initialProfile,
  username,
  displayName,
}: ChatBotEditorProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [settings, setSettings] = useState<ChatBotSettings>(initialProfile.settings);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const customCommands = useMemo(
    () => settings.commands.filter((cmd) => !cmd.builtin),
    [settings.commands],
  );

  const rotatingMessages = settings.rotatingMessages ?? [];

  const activeCount = useMemo(
    () => settings.commands.filter((cmd) => cmd.enabled).length,
    [settings.commands],
  );

  const activeRotating = useMemo(
    () => rotatingMessages.filter((m) => m.enabled).length,
    [rotatingMessages],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  function updateCommand(id: string, patch: Partial<ChatBotCommand>) {
    setSettings((prev) => ({
      ...prev,
      commands: prev.commands.map((cmd) =>
        cmd.id === id ? { ...cmd, ...patch } : cmd,
      ),
    }));
  }

  function addCustomCommand() {
    setSettings((prev) => ({
      ...prev,
      commands: [
        ...prev.commands,
        {
          id: newCommandId(),
          trigger: "comando",
          response: "Sua mensagem aqui",
          enabled: true,
        },
      ],
    }));
  }

  function removeCustomCommand(id: string) {
    setSettings((prev) => ({
      ...prev,
      commands: prev.commands.filter((cmd) => cmd.id !== id),
    }));
  }

  function updateRotating(id: string, patch: Partial<ChatBotRotatingMessage>) {
    setSettings((prev) => ({
      ...prev,
      rotatingMessages: (prev.rotatingMessages ?? []).map((m) =>
        m.id === id ? { ...m, ...patch } : m,
      ),
    }));
  }

  function addRotatingMessage() {
    setSettings((prev) => {
      const list = prev.rotatingMessages ?? [];
      if (list.length >= MAX_ROTATING) return prev;
      return {
        ...prev,
        rotatingMessages: [
          ...list,
          {
            id: newRotatingId(),
            text: "Doe via Pix: {url}",
            intervalSeconds: DEFAULT_ROTATING_INTERVAL_SEC,
            enabled: true,
          },
        ],
      };
    });
  }

  function removeRotatingMessage(id: string) {
    setSettings((prev) => ({
      ...prev,
      rotatingMessages: (prev.rotatingMessages ?? []).filter((m) => m.id !== id),
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/user/chat-bot", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        settings?: ChatBotSettings;
      };

      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar");
        return;
      }

      if (data.settings) {
        setSettings(data.settings);
        setProfile((prev) => ({ ...prev, settings: data.settings! }));
      }
      showToast("Configurações salvas!");
    } finally {
      setSaving(false);
    }
  }

  const canEnable = profile.twitchConnected && profile.botConfigured;
  const pageUrl = tipPageUrl(username);
  const previewCtx = { username, displayName };
  const previewPix = settings.commands.find((c) => c.trigger === "pix");
  const previewDoar = settings.commands.find((c) => c.trigger === "doar");
  const botName = profile.botUsername ?? "pixtipsbot";

  const statusHero = settings.enabled
    ? {
        box: "border-emerald-500/30 bg-gradient-to-r from-emerald-600/10 via-emerald-900/5 to-zinc-900/20",
        icon: "border-emerald-500/40 bg-emerald-600/15 text-emerald-300",
        title: "Bot ativo no chat",
        body: profile.twitchChannel
          ? `Respondendo comandos em #${profile.twitchChannel} durante a live.`
          : "Respondendo comandos no chat da Twitch.",
      }
    : canEnable
      ? {
          box: "border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-cyan-900/5 to-zinc-900/20",
          icon: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
          title: "Pronto para ativar",
          body: "Tudo configurado. Ative o bot e salve para começar a responder no chat.",
        }
      : {
          box: "border-zinc-700/80 bg-gradient-to-r from-zinc-800/40 to-zinc-900/20",
          icon: "border-zinc-600/60 bg-zinc-800/80 text-zinc-400",
          title: "Configuração pendente",
          body: !profile.twitchConnected
            ? "Vincule sua conta Twitch em Configurações para usar o ChatBot."
            : "Aguardando credenciais do bot no servidor.",
        };

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <ChatBotIcon name="robot" className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">ChatBot</h1>
            <p className="mt-1 max-w-xl text-sm text-zinc-400">
              Comandos automáticos no chat da Twitch com link da sua página de doações.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={saving}
          className="rounded-xl web3-btn-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-900/30 hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <ChatBotIcon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className={`flex items-start gap-4 rounded-2xl border px-5 py-4 ${statusHero.box}`}>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${statusHero.icon}`}
        >
          <ChatBotIcon name={settings.enabled ? "check" : "robot"} className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{statusHero.title}</p>
          <p className="mt-1 text-sm text-zinc-400">{statusHero.body}</p>
        </div>
        <Toggle
          checked={settings.enabled}
          disabled={!canEnable}
          onChange={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          icon="twitch"
          label="Conta Twitch"
          value={
            profile.twitchConnected ? (
              <span className="text-emerald-400">Vinculada</span>
            ) : (
              <Link href="/dashboard/settings" className="text-cyan-400 hover:text-cyan-300">
                Vincular →
              </Link>
            )
          }
          tone={profile.twitchConnected ? "ok" : "warn"}
        />
        <StatCard
          icon="server"
          label="Bot no servidor"
          value={profile.botConfigured ? (profile.botUsername ?? "Online") : "Pendente"}
          tone={profile.botConfigured ? "ok" : "warn"}
        />
        <StatCard
          icon="commands"
          label="Comandos ativos"
          value={`${activeCount} de ${settings.commands.length}`}
          tone="neutral"
        />
        <StatCard
          icon="chat"
          label="Msgs rotativas"
          value={`${activeRotating} ativas`}
          tone="neutral"
        />
        <StatCard
          icon="link"
          label="Página de doações"
          value={
            <a
              href={pageUrl}
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
            >
              /{username}
            </a>
          }
          tone="neutral"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,22rem)]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
            <SectionHeading
              icon="power"
              title="Configuração"
              description="Prefixo usado antes de cada comando no chat."
            />
            <div className="mt-5 flex flex-wrap items-end gap-4">
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Prefixo
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={settings.prefix}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, prefix: e.target.value || "!" }))
                  }
                  className="mt-2 w-24 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-2.5 text-center font-mono text-lg text-white"
                />
              </div>
              <div className="flex flex-wrap gap-2 pb-1">
                {[`${settings.prefix}pix`, `${settings.prefix}doar`, `${settings.prefix}ajuda`].map(
                  (sample) => (
                    <span
                      key={sample}
                      className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 font-mono text-xs text-cyan-300"
                    >
                      {sample}
                    </span>
                  ),
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
            <SectionHeading
              icon="commands"
              title="Comandos"
              description="Personalize as respostas do bot no chat."
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {VARIABLES.map((v) => (
                <span
                  key={v}
                  className="rounded-full border border-zinc-700/80 bg-zinc-950/60 px-2.5 py-0.5 font-mono text-[11px] text-zinc-400"
                >
                  {v}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-3">
              {settings.commands
                .filter((cmd) => cmd.builtin)
                .map((cmd) => {
                  const icon = COMMAND_ICONS[cmd.trigger] ?? "custom";
                  return (
                    <div
                      key={cmd.id}
                      className={`overflow-hidden rounded-xl border transition ${
                        cmd.enabled
                          ? "border-cyan-500/20 bg-zinc-950/50"
                          : "border-zinc-800/80 bg-zinc-950/20 opacity-70"
                      }`}
                    >
                      <div className="flex items-center gap-3 border-b border-zinc-800/60 px-4 py-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
                          <ChatBotIcon name={icon} className="h-4 w-4" />
                        </div>
                        <span className="font-mono text-sm font-semibold text-cyan-200">
                          {settings.prefix}
                          {cmd.trigger}
                        </span>
                        <div className="ml-auto flex items-center gap-2">
                          <span className="text-xs text-zinc-500">
                            {cmd.enabled ? "Ativo" : "Off"}
                          </span>
                          <Toggle
                            checked={cmd.enabled}
                            onChange={() =>
                              updateCommand(cmd.id, { enabled: !cmd.enabled })
                            }
                          />
                        </div>
                      </div>
                      <div className="p-4">
                        {cmd.trigger === "ajuda" ? (
                          <p className="text-sm text-zinc-500">
                            Lista automaticamente todos os comandos ativos quando alguém digitar{" "}
                            <span className="font-mono text-zinc-400">
                              {settings.prefix}ajuda
                            </span>
                            .
                          </p>
                        ) : (
                          <input
                            type="text"
                            value={cmd.response}
                            onChange={(e) =>
                              updateCommand(cmd.id, { response: e.target.value })
                            }
                            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"
                            placeholder="Resposta do comando…"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

              {customCommands.length > 0 && (
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Personalizados
                  </p>
                  {customCommands.map((cmd) => (
                    <div
                      key={cmd.id}
                      className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400">
                          <ChatBotIcon name="custom" className="h-4 w-4" />
                        </div>
                        <span className="text-sm text-zinc-500">{settings.prefix}</span>
                        <input
                          type="text"
                          value={cmd.trigger}
                          onChange={(e) =>
                            updateCommand(cmd.id, { trigger: e.target.value })
                          }
                          className="w-32 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-sm text-white"
                        />
                        <Toggle
                          checked={cmd.enabled}
                          onChange={() =>
                            updateCommand(cmd.id, { enabled: !cmd.enabled })
                          }
                        />
                        <button
                          type="button"
                          onClick={() => removeCustomCommand(cmd.id)}
                          className="ml-auto text-xs text-red-400 hover:text-red-300"
                        >
                          Remover
                        </button>
                      </div>
                      <input
                        type="text"
                        value={cmd.response}
                        onChange={(e) =>
                          updateCommand(cmd.id, { response: e.target.value })
                        }
                        placeholder="Resposta do comando"
                        className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white"
                      />
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={addCustomCommand}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3.5 text-sm text-zinc-400 transition hover:border-cyan-500/40 hover:brightness-110/[0.03] hover:text-cyan-300"
              >
                <ChatBotIcon name="custom" className="h-4 w-4" />
                Adicionar comando personalizado
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5 sm:p-6">
            <SectionHeading
              icon="chat"
              title="Mensagens rotativas"
              description="O bot envia sozinho no chat a cada intervalo (mín. 1 min). Use {url}, {nome}, {usuario}."
            />

            <div className="mt-5 space-y-3">
              {rotatingMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-4 transition ${
                    msg.enabled
                      ? "border-cyan-500/20 bg-zinc-950/50"
                      : "border-zinc-800/80 bg-zinc-950/20 opacity-70"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      A cada {formatIntervalLabel(msg.intervalSeconds)}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-zinc-500">
                        {msg.enabled ? "Ativa" : "Off"}
                      </span>
                      <Toggle
                        checked={msg.enabled}
                        onChange={() =>
                          updateRotating(msg.id, { enabled: !msg.enabled })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => removeRotatingMessage(msg.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={msg.text}
                    onChange={(e) => updateRotating(msg.id, { text: e.target.value })}
                    rows={2}
                    maxLength={450}
                    placeholder="Texto da mensagem automática…"
                    className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600"
                  />

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="text-xs text-zinc-500">Intervalo</label>
                    <input
                      type="number"
                      min={MIN_ROTATING_INTERVAL_SEC}
                      max={3600}
                      step={30}
                      value={msg.intervalSeconds}
                      onChange={(e) =>
                        updateRotating(msg.id, {
                          intervalSeconds: Number(e.target.value) || DEFAULT_ROTATING_INTERVAL_SEC,
                        })
                      }
                      className="w-24 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 font-mono text-sm text-white"
                    />
                    <span className="text-xs text-zinc-500">segundos</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[60, 180, 300, 600, 900].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => updateRotating(msg.id, { intervalSeconds: sec })}
                          className={`rounded-md border px-2 py-0.5 text-[11px] ${
                            msg.intervalSeconds === sec
                              ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                              : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                          }`}
                        >
                          {formatIntervalLabel(sec)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRotatingMessage}
                disabled={rotatingMessages.length >= MAX_ROTATING}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-700 py-3.5 text-sm text-zinc-400 transition hover:border-cyan-500/40 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChatBotIcon name="chat" className="h-4 w-4" />
                {rotatingMessages.length >= MAX_ROTATING
                  ? `Limite de ${MAX_ROTATING} mensagens`
                  : "Adicionar mensagem rotativa"}
              </button>
            </div>
          </section>
        </div>

        <div className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
            <div className="flex items-center justify-between border-b border-zinc-800/80 px-4 py-3">
              <div className="flex items-center gap-2">
                <ChatBotIcon name="chat" className="h-4 w-4 text-zinc-500" />
                <span className="text-sm font-medium text-zinc-300">Preview do chat</span>
              </div>
              <span
                className={`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide ${
                  settings.enabled ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    settings.enabled ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"
                  }`}
                />
                {settings.enabled ? "Ao vivo" : "Offline"}
              </span>
            </div>
            <div className="space-y-2 bg-[#0e0e10] p-4 font-mono text-[12px] leading-relaxed">
              <p>
                <span className="text-[#9146ff]">viewer123:</span>{" "}
                <span className="text-zinc-300">{settings.prefix}pix</span>
              </p>
              {previewPix?.enabled ? (
                <p>
                  <span className="text-[#00f593]">{botName}:</span>{" "}
                  <span className="text-zinc-400">
                    {renderCommandResponse(previewPix, settings, previewCtx)}
                  </span>
                </p>
              ) : (
                <p className="text-zinc-600 italic">!pix desativado</p>
              )}
              <p className="pt-1">
                <span className="text-[#9146ff]">fan_live:</span>{" "}
                <span className="text-zinc-300">{settings.prefix}doar</span>
              </p>
              {previewDoar?.enabled ? (
                <p>
                  <span className="text-[#00f593]">{botName}:</span>{" "}
                  <span className="text-zinc-400">
                    {renderCommandResponse(previewDoar, settings, previewCtx)}
                  </span>
                </p>
              ) : (
                <p className="text-zinc-600 italic">!doar desativado</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Checklist
            </p>
            <ol className="mt-4 space-y-3">
              {[
                {
                  done: profile.twitchConnected,
                  label: "Conta Twitch vinculada",
                  href: profile.twitchConnected ? undefined : "/dashboard/settings",
                },
                {
                  done: profile.botConfigured,
                  label: "Bot configurado no servidor",
                },
                {
                  done: settings.enabled,
                  label: "Bot ativado nesta página",
                },
                {
                  done: settings.enabled && profile.twitchConnected,
                  label: `Modere /${botName} no canal`,
                },
              ].map((step) => (
                <li key={step.label} className="flex items-start gap-3 text-sm">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      step.done
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                        : "border-zinc-700 bg-zinc-900 text-zinc-600"
                    }`}
                  >
                    {step.done ? (
                      <ChatBotIcon name="check" className="h-3 w-3" />
                    ) : (
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-600" />
                    )}
                  </span>
                  {step.href ? (
                    <Link href={step.href} className="text-cyan-400 hover:text-cyan-300">
                      {step.label}
                    </Link>
                  ) : (
                    <span className={step.done ? "text-zinc-300" : "text-zinc-500"}>
                      {step.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <ChatBotIcon name="check" className="h-4 w-4" />
          {toast}
        </div>
      )}
    </div>
  );
}
