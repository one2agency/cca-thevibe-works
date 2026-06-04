/**
 * Telegram Webhook Handler — @ClaudeCA_ua_bot
 *
 * SECURITY: токен лише з env, ніколи не хардкодити.
 * Webhook захищений X-Telegram-Bot-Api-Secret-Token.
 *
 * Stateless стан через ForceReply: маркер вбудований у текст
 * повідомлення бота, на яке відповідає користувач.
 */

import { NextRequest, NextResponse } from 'next/server';

// ── Env ───────────────────────────────────────────────────────────────────────
const TOKEN   = process.env.TELEGRAM_BOT_TOKEN ?? '';
const OWNER   = process.env.OWNER_CHAT_ID ?? '';
const SECRET  = process.env.WEBHOOK_SECRET ?? '';
const JAR_URL = process.env.MONOBANK_JAR_URL ?? 'https://send.monobank.ua/jar/9uKqdVDC2W';

const SITE = 'https://cca.thevibe.works';

// ── Telegram API ──────────────────────────────────────────────────────────────

type TgObj = Record<string, unknown>;

async function tg(method: string, body: TgObj = {}): Promise<TgObj> {
  if (!TOKEN) return {};
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

const send = (chat: ID, text: string, extra: TgObj = {}) =>
  tg('sendMessage', { chat_id: chat, text, parse_mode: 'HTML', ...extra });

const edit = (chat: ID, msg: number, text: string, extra: TgObj = {}) =>
  tg('editMessageText', { chat_id: chat, message_id: msg, text, parse_mode: 'HTML', ...extra });

const answerCB = (id: string, text?: string) =>
  tg('answerCallbackQuery', { callback_query_id: id, ...(text ? { text } : {}) });

type ID = number | string;

// ── Texts ─────────────────────────────────────────────────────────────────────

const T = {
  welcome: `👋 Привіт! Я бот <b>CCA Тренажера</b> — підготовки до сертифікації Claude Certified Architect Foundations.

Що хочеш зробити?`,

  donate: `<b>На підтримку CCAF</b>

На підтримку проєкту «Тренажер для підготовки до Claude Certified Architect Foundations»

🎯 <b>Ціль: 100 000.00 ₴</b>

Тренажер безкоштовний і таким лишиться. Донати йдуть на нові питання, домени й підтримку проєкту.

💳 Номер картки: <code>4874 1000 3953 3255</code>`,

  about: `<b>CCA Тренажер</b> — перший україномовний симулятор екзамену Claude Certified Architect Foundations.

🎯 125 питань за 5 доменами
⏱ Режим екзамену: 60 питань · 120 хвилин · поріг 720/1000
📚 Практика за доменом або сценарієм
💾 Зберігає прогрес між сесіями

Повністю безкоштовний.`,

  feedbackPrompt: `💬 <b>Залишити фідбек</b>

Обери тип або одразу відправ текст:`,

  jobPrompt: `🚀 <b>Хочу працювати з AI</b>

Круто! Напиши пару слів про себе: досвід з AI та розробкою, і як з тобою зв'язатися (Telegram або email).`,

  feedbackThanks: `✅ Дякую! Передав. За потреби — відповім тут.`,
  jobThanks:      `✅ Дякую! Передав твою заявку, ми напишемо.`,
};

// ForceReply-маркери (вбудовані в текст запитального повідомлення бота).
// Детекція: перевіряємо чи починається reply_to_message.text з маркера.
const MARKERS = {
  FB_GEN:  '💬FEEDBACK',
  FB_BUG:  '🐛FEEDBACK-bug',
  FB_IDEA: '💡FEEDBACK-idea',
  FB_QST:  '❓FEEDBACK-question',
  JOB:     '🚀JOB',
} as const;

function markerText(marker: string, label: string): string {
  return `${marker}\n\n${label}\n\nНадішли у відповідь на це повідомлення ⬇️`;
}

// ── Keyboards ─────────────────────────────────────────────────────────────────

const KB = {
  menu: {
    inline_keyboard: [
      [{ text: '💛 Підтримати проєкт',   callback_data: 'donate'   }],
      [{ text: '💬 Залишити фідбек',     callback_data: 'feedback' }],
      [{ text: '🚀 Хочу працювати з AI', callback_data: 'job'      }],
      [{ text: '🎯 Відкрити тренажер',   url: SITE                 }],
    ],
  },
  donate: {
    inline_keyboard: [
      [{ text: '💛 Підтримати на Monobank', url: JAR_URL          }],
      [{ text: '◀️ Назад',                  callback_data: 'menu' }],
    ],
  },
  about: {
    inline_keyboard: [
      [{ text: '🎯 Відкрити тренажер',  url: SITE                          }],
      [{ text: '📚 Домени екзамену',    url: `${SITE}/domeny`              }],
      [{ text: '📖 Гайд підготовки',   url: `${SITE}/pidgotovka`          }],
      [{ text: '◀️ Назад',              callback_data: 'menu'              }],
    ],
  },
  feedbackType: {
    inline_keyboard: [
      [
        { text: '🐛 Баг',     callback_data: 'fb:bug'      },
        { text: '💡 Ідея',    callback_data: 'fb:idea'     },
        { text: '❓ Питання', callback_data: 'fb:question' },
      ],
      [{ text: '✏️ Просто написати', callback_data: 'fb:general' }],
      [{ text: '◀️ Назад',            callback_data: 'menu'       }],
    ],
  },
  back: {
    inline_keyboard: [[{ text: '◀️ Головне меню', callback_data: 'menu' }]],
  },
  forceReply: { force_reply: true, selective: false },
};

// ── Handlers ──────────────────────────────────────────────────────────────────

async function showMenu(chat: ID, editMsgId?: number) {
  if (editMsgId) return edit(chat, editMsgId, T.welcome, { reply_markup: KB.menu });
  return send(chat, T.welcome, { reply_markup: KB.menu });
}

async function showDonate(chat: ID, editMsgId?: number) {
  if (editMsgId) return edit(chat, editMsgId, T.donate, { reply_markup: KB.donate });
  return send(chat, T.donate, { reply_markup: KB.donate });
}

async function showAbout(chat: ID, editMsgId?: number) {
  if (editMsgId) return edit(chat, editMsgId, T.about, { reply_markup: KB.about });
  return send(chat, T.about, { reply_markup: KB.about });
}

async function showFeedbackType(chat: ID, editMsgId?: number) {
  if (editMsgId) return edit(chat, editMsgId, T.feedbackPrompt, { reply_markup: KB.feedbackType });
  return send(chat, T.feedbackPrompt, { reply_markup: KB.feedbackType });
}

// Після вибору типу — надсилаємо ForceReply-повідомлення (editMessage + ForceReply несумісні)
async function sendFeedbackForceReply(chat: ID, editMsgId: number | undefined, type: string) {
  const labels: Record<string, string> = {
    bug:      '🐛 Баг',
    idea:     '💡 Ідея',
    question: '❓ Питання',
    general:  '💬 Повідомлення',
  };
  const markers: Record<string, string> = {
    bug:      MARKERS.FB_BUG,
    idea:     MARKERS.FB_IDEA,
    question: MARKERS.FB_QST,
    general:  MARKERS.FB_GEN,
  };
  const marker  = markers[type] ?? MARKERS.FB_GEN;
  const label   = labels[type]  ?? 'Фідбек';
  const msgText = markerText(marker, `${label} — напиши свій текст:`);

  // Ховаємо попереднє меню, щоб не заплутувати
  if (editMsgId) {
    await edit(chat, editMsgId, `${T.feedbackPrompt}\n\n✅ Обрано: ${label}`).catch(() => {});
  }
  return send(chat, msgText, { reply_markup: KB.forceReply });
}

async function sendJobForceReply(chat: ID, editMsgId?: number) {
  const msgText = markerText(MARKERS.JOB, T.jobPrompt);
  if (editMsgId) {
    await edit(chat, editMsgId, `${T.jobPrompt}\n\n✅ Готово, очікую твою відповідь:`).catch(() => {});
  }
  return send(chat, msgText, { reply_markup: KB.forceReply });
}

// ── Detect reply context ──────────────────────────────────────────────────────

type ReplyCtx = { kind: 'feedback'; feedbackType: string } | { kind: 'job' } | { kind: null };

function detectReplyContext(replyText: string): ReplyCtx {
  if (replyText.startsWith(MARKERS.FB_BUG))  return { kind: 'feedback', feedbackType: 'bug'      };
  if (replyText.startsWith(MARKERS.FB_IDEA)) return { kind: 'feedback', feedbackType: 'idea'     };
  if (replyText.startsWith(MARKERS.FB_QST))  return { kind: 'feedback', feedbackType: 'question' };
  if (replyText.startsWith(MARKERS.FB_GEN))  return { kind: 'feedback', feedbackType: 'general'  };
  if (replyText.startsWith(MARKERS.JOB))     return { kind: 'job'                                };
  return { kind: null };
}

// ── Forward to owner ──────────────────────────────────────────────────────────

function senderInfo(msg: TgObj): string {
  const from = msg.from as TgObj | undefined;
  if (!from) return 'невідомий';
  const id       = from.id       as number;
  const name     = (from.first_name as string) ?? '';
  const last     = (from.last_name  as string) ?? '';
  const username = from.username ? `@${from.username as string}` : '';
  const fullName = [name, last].filter(Boolean).join(' ') || username || String(id);
  return `<a href="tg://user?id=${id}">${fullName}</a>${username ? ` (${username})` : ''} [id: ${id}]`;
}

async function forwardFeedback(msg: TgObj, feedbackType: string) {
  if (!OWNER) return;
  const labels: Record<string, string> = {
    bug: '🐛 Баг', idea: '💡 Ідея', question: '❓ Питання', general: '💬 Фідбек',
  };
  const label = labels[feedbackType] ?? '💬 Фідбек';
  await send(OWNER, `${label} від ${senderInfo(msg)}\n\n${msg.text as string}`);
}

async function forwardJob(msg: TgObj) {
  if (!OWNER) {
    console.info('OWNER_CHAT_ID not set. Incoming message from:', (msg.from as TgObj)?.id, (msg.from as TgObj)?.username);
    return;
  }
  await send(OWNER, `🚀 <b>КАНДИДАТ</b>\n\nВід: ${senderInfo(msg)}\n\n${msg.text as string}`);
}

// ── Message handler ───────────────────────────────────────────────────────────

async function handleMessage(msg: TgObj) {
  const chat   = (msg.chat as TgObj).id as number;
  const text   = (msg.text as string) ?? '';
  const replyTo = msg.reply_to_message as TgObj | undefined;

  // Відповідь на ForceReply-повідомлення бота
  if (replyTo) {
    const replyText = (replyTo.text as string) ?? '';
    const ctx = detectReplyContext(replyText);
    if (ctx.kind === 'feedback') {
      await forwardFeedback(msg, ctx.feedbackType);
      await send(chat, T.feedbackThanks, { reply_markup: KB.back });
      return;
    }
    if (ctx.kind === 'job') {
      await forwardJob(msg);
      await send(chat, T.jobThanks, { reply_markup: KB.back });
      return;
    }
  }

  // Команди
  const [cmd, param] = text.split(' ');
  const command = cmd?.toLowerCase();

  if (command === '/start') {
    const p = param?.trim() ?? '';
    if (p === 'feedback') return showFeedbackType(chat);
    if (p === 'job')      return sendJobForceReply(chat);
    if (p === 'donate')   return showDonate(chat);
    return showMenu(chat);
  }

  if (command === '/donate')   return showDonate(chat);
  if (command === '/feedback') return showFeedbackType(chat);
  if (command === '/job')      return sendJobForceReply(chat);
  if (command === '/about')    return showAbout(chat);

  // Будь-який інший текст → меню
  return showMenu(chat);
}

// ── Callback handler ──────────────────────────────────────────────────────────

async function handleCallback(query: TgObj) {
  const msg    = query.message as TgObj;
  const chat   = (msg.chat   as TgObj).id  as number;
  const msgId  = msg.message_id            as number;
  const data   = query.data                as string;
  const qid    = query.id                  as string;

  await answerCB(qid);

  if (data === 'menu')     return showMenu(chat, msgId);
  if (data === 'donate')   return showDonate(chat, msgId);
  if (data === 'feedback') return showFeedbackType(chat, msgId);
  if (data === 'about')    return showAbout(chat, msgId);

  // job: ForceReply не сумісний з edit, тому редагуємо + надсилаємо нове
  if (data === 'job')      return sendJobForceReply(chat, msgId);

  if (data.startsWith('fb:')) {
    const type = data.slice(3); // bug | idea | question | general
    return sendFeedbackForceReply(chat, msgId, type);
  }
}

// ── Route handlers ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Перевірка секрету webhook
  if (SECRET) {
    const incoming = req.headers.get('x-telegram-bot-api-secret-token');
    if (incoming !== SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const update = await req.json() as TgObj;
    if (update.message)        await handleMessage(update.message        as TgObj);
    if (update.callback_query) await handleCallback(update.callback_query as TgObj);
  } catch (err) {
    console.error('[telegram webhook]', err);
  }

  // Telegram очікує 200 завжди
  return new NextResponse('OK', { status: 200 });
}

// Health check
export async function GET(): Promise<NextResponse> {
  return new NextResponse(JSON.stringify({ status: 'ok', bot: '@ClaudeCA_ua_bot' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
