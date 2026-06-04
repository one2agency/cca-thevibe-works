/**
 * Одноразове налаштування Telegram webhook.
 *
 * Використання:
 *   TELEGRAM_BOT_TOKEN=... WEBHOOK_SECRET=... npx tsx scripts/setup-webhook.ts https://cca.thevibe.works/api/telegram
 *
 * Або через npm-скрипт (після додавання змінних у .env.local):
 *   npm run setup-webhook -- https://cca.thevibe.works/api/telegram
 */

import 'dotenv/config';      // вантажить .env.local якщо є

const TOKEN  = process.env.TELEGRAM_BOT_TOKEN;
const SECRET = process.env.WEBHOOK_SECRET ?? '';
const URL    = process.argv[2];

if (!TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не встановлено');
  process.exit(1);
}
if (!URL) {
  console.error('❌ Вкажи URL: npx tsx scripts/setup-webhook.ts https://cca.thevibe.works/api/telegram');
  process.exit(1);
}

async function tg(method: string, body: object) {
  const r = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function main() {
  console.log('🔧 Встановлення webhook...');

  // 1. setWebhook
  const wh = await tg('setWebhook', {
    url: URL,
    ...(SECRET ? { secret_token: SECRET } : {}),
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: true,
  });
  console.log('setWebhook:', JSON.stringify(wh, null, 2));

  // 2. setMyCommands
  const cmd = await tg('setMyCommands', {
    commands: [
      { command: 'start',    description: 'Головне меню'         },
      { command: 'donate',   description: 'Підтримати проєкт'    },
      { command: 'feedback', description: 'Залишити фідбек'      },
      { command: 'job',      description: 'Хочу працювати з AI'  },
      { command: 'about',    description: 'Про тренажер'         },
    ],
  });
  console.log('setMyCommands:', JSON.stringify(cmd, null, 2));

  // 3. getWebhookInfo — перевірка
  const info = await tg('getWebhookInfo', {});
  console.log('\n✅ Webhook info:', JSON.stringify(info, null, 2));
}

main().catch(console.error);
