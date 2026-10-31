import fs from 'node:fs';
import path from 'node:path';
import { Item, CatalogItem } from './models.js';

export interface ScanCatalogEntry {
  name: string;
  weight: number;
  shelfLife: number;
}

export class CatalogService {
  private scanCatalog: Map<string, ScanCatalogEntry> = new Map();
  private items: CatalogItem[] = [];

  load(filePath: string): void {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(resolvedPath)) {
      console.warn(`[Catalog] Файл справочника не найден: ${resolvedPath}. Автозаполнение отключено.`);
      return;
    }

    try {
      const data = fs.readFileSync(resolvedPath, 'utf-8');
      const parsed: CatalogItem[] = JSON.parse(data);
      this.items = parsed;

      this.scanCatalog.clear();
      for (const item of parsed) {
        const plu = item.plu ? String(item.plu).trim() : '';
        if (plu !== '') {
          this.scanCatalog.set(plu, {
            name: item.name || '',
            weight: typeof item.weight === 'number' ? item.weight : 0,
            shelfLife: typeof item.shelf_life === 'number' ? item.shelf_life : 0
          });
        }
      }

      console.info(`[Catalog] Справочник успешно загружен. Элементов: ${this.items.length}, для сканирования: ${this.scanCatalog.size}`);
    } catch (err) {
      console.error(`[Catalog] Ошибка загрузки справочника из ${resolvedPath}:`, err);
    }
  }

  getScanEntry(plu: string): ScanCatalogEntry | undefined {
    return this.scanCatalog.get(String(plu).trim());
  }

  autoFill(item: Item): void {
    item.plu = item.plu ? String(item.plu).trim() : '';
    item.articul = item.articul ? String(item.articul).trim() : '';

    for (const c of this.items) {
      const cPlu = c.plu ? String(c.plu).trim() : '';
      const cArticul = c.articul ? String(c.articul).trim() : '';

      // Если пользователь ввел PLU, и он совпал с каталогом
      if (item.plu !== '' && item.plu === cPlu) {
        if (!item.articul && cArticul) {
          item.articul = cArticul;
        }
        if (!item.name && c.name) {
          item.name = c.name;
        }
        return;
      }

      // Если пользователь ввел Артикул, и он совпал с каталогом
      if (item.articul !== '' && item.articul === cArticul) {
        if (!item.plu && cPlu) {
          item.plu = cPlu;
        }
        if (!item.name && c.name) {
          item.name = c.name;
        }
        return;
      }
    }
  }

  getItemsCount(): number {
    return this.items.length;
  }
}

export const catalogService = new CatalogService();
