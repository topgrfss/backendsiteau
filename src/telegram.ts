import { config } from './config.js';
import { storage } from './storage.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getDaysLeft(endIso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endIso);
  end.setHours(0, 0, 0, 0);
  return Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Отправка сообщения в Telegram через Bot API
 */
export async function sendTelegramMessage(htmlText: string): Promise<{ success: boolean; error?: string }> {
  const token = config.telegramBotToken?.trim();
  const chatId = config.telegramChatId?.trim();

  if (!token || !chatId) {
    return {
      success: false,
      error: 'TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не настроены в .env'
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: htmlText,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = (await res.json()) as { ok?: boolean; description?: string };
    if (!res.ok || !data.ok) {
      return {
        success: false,
        error: data.description || `HTTP ${res.status}: Ошибка отправки в Telegram`
      };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Ошибка сети при обращении к Telegram API'
    };
  }
}

/**
 * Проверка всех партий на складе и отправка отчета о сроках <= 3 дней
 */
export async function checkAndSendExpiringNotification(
  isManualCheck = false
): Promise<{ success: boolean; sent: boolean; message: string; count: number }> {
  const token = config.telegramBotToken?.trim();
  const chatId = config.telegramChatId?.trim();

  if (!token || !chatId) {
    const msg = 'Telegram-уведомления не настроены: укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в файле .env';
    console.warn(`[Telegram] ${msg}`);
    return { success: false, sent: false, message: msg, count: 0 };
  }

  const items = storage.getAllItems();
  const expiringItems = items
    .map(item => ({
      item,
      daysLeft: getDaysLeft(item.date.end)
    }))
    .filter(entry => entry.daysLeft <= 3)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const nowFormatted = new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  if (expiringItems.length === 0) {
    console.info(`[Telegram] ${nowFormatted} — партий со сроком <= 3 дней нет.`);

    // При ручной проверке через кнопку админки информируем, что связь работает
    if (isManualCheck) {
      const okMsg =
        `✅ <b>Склад Siteau — Контроль сроков годности</b>\n\n` +
        `📅 <i>Проверка: ${nowFormatted} (МСК)</i>\n\n` +
        `Все партии на складе свежие! Продукции со сроком годности ≤ 3 дней не обнаружено.\n` +
        `Бот подключен и готов отправлять ежедневные отчеты в 06:00.`;

      const sendRes = await sendTelegramMessage(okMsg);
      return {
        success: sendRes.success,
        sent: true,
        message: sendRes.success ? 'Тестовое сообщение успешно отправлено в Telegram!' : (sendRes.error || 'Ошибка отправки'),
        count: 0
      };
    }

    return {
      success: true,
      sent: false,
      message: 'Партий с истекающим сроком нет, отправка не требуется',
      count: 0
    };
  }

  // Формируем красивый отчет для Telegram
  let totalWeight = 0;
  const lines: string[] = [];

  lines.push(`⚠️ <b>Склад Siteau — Внимание: истекающие сроки!</b>`);
  lines.push(`📅 <i>Дата отчета: ${nowFormatted} (МСК)</i>`);
  lines.push(`🚨 <b>Партий на контроле (≤ 3 дн.): ${expiringItems.length}</b>\n`);

  expiringItems.forEach((entry, idx) => {
    const { item, daysLeft } = entry;
    totalWeight += item.quantity;

    let statusBadge = '';
    if (daysLeft < 0) {
      statusBadge = `🔴 <b>ПРОСРОЧЕНО</b> (${Math.abs(daysLeft)} дн. назад)`;
    } else if (daysLeft === 0) {
      statusBadge = `🚨 <b>ИСТЕКАЕТ СЕГОДНЯ</b>`;
    } else if (daysLeft === 1) {
      statusBadge = `⚠️ <b>ИСТЕКАЕТ ЗАВТРА</b> (1 день)`;
    } else {
      statusBadge = `🟡 <b>Осталось дней: ${daysLeft}</b>`;
    }

    const pluTag = item.plu ? `PLU: <code>${escapeHtml(item.plu)}</code>` : '';
    const catTag = item.category ? `[${escapeHtml(item.category)}]` : '';
    const nameStr = escapeHtml(item.name.toUpperCase());

    lines.push(
      `${idx + 1}. <b>${nameStr}</b> ${catTag}\n` +
      `   • Статус: ${statusBadge}\n` +
      `   • Остаток веса: <b>${item.quantity} кг</b>\n` +
      `   • Партия: <code>#${item.id}</code> ${pluTag ? `| ${pluTag}` : ''}\n` +
      `   • Годен до: <b>${item.date.end}</b>`
    );
  });

  lines.push(`\n━━━━━━━━━━━━━━━━━━━━`);
  lines.push(`⚖️ Всего под угрозой списания: <b>${totalWeight.toFixed(2)} кг</b>`);
  lines.push(`🔎 Проверьте витрину и склад для приоритетной реализации.`);

  const messageText = lines.join('\n');
  const sendRes = await sendTelegramMessage(messageText);

  if (sendRes.success) {
    console.info(`[Telegram] Отчет об истекающих сроках (${expiringItems.length} партий) успешно отправлен.`);
  } else {
    console.error(`[Telegram] Ошибка отправки отчета: ${sendRes.error}`);
  }

  return {
    success: sendRes.success,
    sent: true,
    message: sendRes.success ? `Отправлен отчет по ${expiringItems.length} партиям` : (sendRes.error || 'Ошибка отправки'),
    count: expiringItems.length
  };
}

/**
 * Инициализация ежедневного планировщика в 6:00 утра
 */
export function initTelegramScheduler(): void {
  const targetHour = config.telegramNotifyHour ?? 6;

  function scheduleNext() {
    const now = new Date();
    const next = new Date(now);
    next.setHours(targetHour, 0, 0, 0);

    // Если 6:00 утра сегодня уже прошло, переносим на 6:00 завтра
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    const delayMs = next.getTime() - now.getTime();
    const hours = Math.floor(delayMs / (1000 * 60 * 60));
    const mins = Math.floor((delayMs % (1000 * 60 * 60)) / (1000 * 60));

    console.info(`[Telegram Scheduler] Следующая проверка в ${targetHour}:00 запланирована на ${next.toISOString()} (через ${hours}ч ${mins}м)`);

    setTimeout(async () => {
      try {
        console.info(`[Telegram Scheduler] Запуск ежедневной утренней проверки сроков годности...`);
        await checkAndSendExpiringNotification(false);
      } catch (err) {
        console.error('[Telegram Scheduler] Непредвиденная ошибка при проверке:', err);
      }
      // Планируем следующий день
      scheduleNext();
    }, delayMs);
  }

  const token = config.telegramBotToken?.trim();
  const chatId = config.telegramChatId?.trim();

  if (!token || !chatId) {
    console.info('[Telegram Scheduler] Запущен в режиме ожидания токена (укажите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env)');
  } else {
    console.info(`[Telegram Scheduler] Активен. Ежедневный отчет настроен на ${targetHour}:00 утра.`);
  }

  scheduleNext();
}
