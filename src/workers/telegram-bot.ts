type TelegramChat = {
  id: number;
  title?: string;
  username?: string;
  type: string;
};

type TelegramMessage = {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  chat: TelegramChat;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
};

type TelegramResponse<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

const botToken = process.env.TELEGRAM_BOT_TOKEN;
const siteUrl = process.env.SITE_URL;
const importSecret = process.env.TELEGRAM_IMPORT_SECRET;
const allowedChatId = process.env.TELEGRAM_CHANNEL_ID;
const importPath = "/api/signals/telegram/import";
const pollingTimeoutSeconds = 25;
let offset = 0;
let stopped = false;

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`${name} is required.`);
  }

  return value;
}

function getSignalText(update: TelegramUpdate) {
  const message = update.channel_post ?? update.edited_channel_post ?? update.message;
  const text = message?.text ?? message?.caption ?? "";

  if (!message || !text.trim()) {
    return null;
  }

  return {
    message,
    text,
  };
}

function isAllowedChat(chatId: number) {
  if (!allowedChatId) {
    return true;
  }

  return String(chatId) === allowedChatId;
}

async function telegramApi<T>(method: string, params: Record<string, string | number>) {
  const token = requireEnv(botToken, "TELEGRAM_BOT_TOKEN");
  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url);
  const body = (await response.json()) as TelegramResponse<T>;

  if (!response.ok || !body.ok) {
    throw new Error(body.description || `Telegram API error: ${response.status}`);
  }

  return body.result as T;
}

async function sendToSite(text: string, message: TelegramMessage) {
  const baseUrl = requireEnv(siteUrl, "SITE_URL").replace(/\/$/, "");
  const secret = requireEnv(importSecret, "TELEGRAM_IMPORT_SECRET");
  const response = await fetch(`${baseUrl}${importPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({
      text,
      publishedAt: new Date(message.date * 1000).toISOString(),
    }),
  });

  const body = (await response.json().catch(() => null)) as { signal?: { id: string; pair: string } } | null;

  if (!response.ok) {
    throw new Error(`Site import failed: ${response.status} ${JSON.stringify(body)}`);
  }

  return body;
}

async function processUpdate(update: TelegramUpdate) {
  const payload = getSignalText(update);

  if (!payload) {
    return;
  }

  if (!isAllowedChat(payload.message.chat.id)) {
    console.log(`[telegram-bot] skipped chat=${payload.message.chat.id}`);
    return;
  }

  const result = await sendToSite(payload.text, payload.message);
  console.log(
    `[telegram-bot] imported message=${payload.message.message_id} chat=${payload.message.chat.id} signal=${result?.signal?.id ?? "unknown"} pair=${result?.signal?.pair ?? "unknown"}`,
  );
}

async function poll() {
  while (!stopped) {
    try {
      const updates = await telegramApi<TelegramUpdate[]>("getUpdates", {
        offset,
        timeout: pollingTimeoutSeconds,
        allowed_updates: JSON.stringify(["message", "channel_post", "edited_channel_post"]),
      });

      for (const update of updates) {
        offset = update.update_id + 1;

        try {
          await processUpdate(update);
        } catch (error) {
          console.error(`[telegram-bot] failed update=${update.update_id}`, error);
        }
      }
    } catch (error) {
      console.error("[telegram-bot] polling failed", error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

function shutdown() {
  stopped = true;
  console.log("[telegram-bot] stopping.");
}

requireEnv(botToken, "TELEGRAM_BOT_TOKEN");
requireEnv(siteUrl, "SITE_URL");
requireEnv(importSecret, "TELEGRAM_IMPORT_SECRET");

console.log("[telegram-bot] started. Waiting for channel posts.");
void poll();

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
