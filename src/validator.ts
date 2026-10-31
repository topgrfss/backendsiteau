import { Item } from './models.js';
import { catalogService } from './catalog.js';

function isValidIsoDate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return false;
  }
  const [year, month, day] = str.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function validateItem(item: Item): void {
  // 1. Автозаполнение пустых полей по каталогу
  catalogService.autoFill(item);

  // 2. Стандартные проверки
  if (typeof item.quantity !== 'number' || item.quantity <= 0 || isNaN(item.quantity)) {
    throw new Error(`количество ('quantity') должно быть больше 0 (получено: ${item.quantity})`);
  }

  const plu = (item.plu || '').trim();
  const articul = (item.articul || '').trim();
  if (plu === '' && articul === '') {
    throw new Error('необходимо указать хотя бы PLU или Артикул');
  }

  // 3. Форматирование и валидация дат (YYYY-MM-DD)
  const startDateStr = (item.date?.start || '').trim();
  if (!isValidIsoDate(startDateStr)) {
    throw new Error(`неверный формат 'date.start' ('${startDateStr}'). Ожидается формат YYYY-MM-DD`);
  }
  item.date.start = startDateStr;

  const endDateStr = (item.date?.end || '').trim();
  if (!isValidIsoDate(endDateStr)) {
    throw new Error(`неверный формат 'date.end' ('${endDateStr}'). Ожидается формат YYYY-MM-DD`);
  }
  item.date.end = endDateStr;

  if (endDateStr < startDateStr) {
    throw new Error(
      `дата окончания 'date.end' (${endDateStr}) не может быть раньше даты начала 'date.start' (${startDateStr})`
    );
  }
}
