import fs from 'node:fs';
import path from 'node:path';
import { Item, CatalogItem } from './models.js';

export interface ScanCatalogEntry {
  name: string;
  weight: number;
  shelfLife: number;
  description: string;
  category: string;
  articul: string;
}

export class CatalogService {
  private scanCatalog: Map<string, ScanCatalogEntry> = new Map();
  private items: CatalogItem[] = [];
  private filePath: string = 'catalog.json';

  load(filePath: string = 'catalog.json'): void {
    this.filePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(this.filePath)) {
      console.warn(`[Catalog] Файл справочника не найден: ${this.filePath}.`);
      return;
    }

    try {
      const data = fs.readFileSync(this.filePath, 'utf-8');
      const parsed: CatalogItem[] = JSON.parse(data);
      this.items = parsed;

      this.rebuildScanCatalog();
      console.info(`[Catalog] Справочник успешно загружен: ${this.items.length} товаров.`);
    } catch (err) {
      console.error(`[Catalog] Ошибка загрузки справочника:`, err);
    }
  }

  private rebuildScanCatalog(): void {
    this.scanCatalog.clear();
    for (const item of this.items) {
      const plu = item.plu ? String(item.plu).trim() : '';
      if (plu !== '') {
        this.scanCatalog.set(plu, {
          name: item.name || '',
          weight: typeof item.weight === 'number' ? item.weight : 0,
          shelfLife: typeof item.shelf_life === 'number' ? item.shelf_life : 0,
          description: item.description || '',
          category: item.category || 'Рыба и морепродукты',
          articul: item.articul ? String(item.articul).trim() : ''
        });
      }
    }
  }

  saveToFile(): void {
    try {
      const content = JSON.stringify(this.items, null, 4);
      fs.writeFileSync(this.filePath, content, 'utf-8');
      console.info(`[Catalog] Справочник успешно сохранен (${this.items.length} записей).`);
    } catch (err) {
      console.error(`[Catalog] Ошибка сохранения справочника:`, err);
    }
  }

  getScanEntry(plu: string): ScanCatalogEntry | undefined {
    return this.scanCatalog.get(String(plu).trim());
  }

  findCatalogItem(plu?: string, articul?: string): CatalogItem | undefined {
    const cleanPlu = (plu || '').trim();
    const cleanArticul = (articul || '').trim();

    return this.items.find(item => {
      const iPlu = (item.plu || '').toString().trim();
      const iArt = (item.articul || '').toString().trim();
      if (cleanPlu && iPlu === cleanPlu) return true;
      if (cleanArticul && iArt === cleanArticul) return true;
      return false;
    });
  }

  getAllCatalogItems(): CatalogItem[] {
    return [...this.items];
  }

  addOrUpdateCatalogItem(newEntry: CatalogItem, persist: boolean = true): CatalogItem {
    const plu = newEntry.plu ? String(newEntry.plu).trim() : '';
    const articul = newEntry.articul ? String(newEntry.articul).trim() : '';
    const name = (newEntry.name || '').trim();
    const desc = (newEntry.description && newEntry.description.trim()) || '';
    const category = (newEntry.category && newEntry.category.trim()) || 'Рыба и морепродукты';

    const existingIndex = this.items.findIndex(item => {
      const itemPlu = item.plu ? String(item.plu).trim() : '';
      const itemArt = item.articul ? String(item.articul).trim() : '';
      if (plu && itemPlu === plu) return true;
      if (articul && itemArt === articul) return true;
      return false;
    });

    if (existingIndex >= 0) {
      const existing = this.items[existingIndex];
      const merged: CatalogItem = {
        ...existing,
        name: name || existing.name,
        plu: plu || existing.plu,
        articul: articul || existing.articul,
        weight: typeof newEntry.weight === 'number' ? newEntry.weight : existing.weight,
        shelf_life: typeof newEntry.shelf_life === 'number' ? newEntry.shelf_life : existing.shelf_life,
        description: desc !== '' ? desc : (existing.description || ''),
        category: category !== 'Рыба и морепродукты' ? category : (existing.category || category)
      };
      this.items[existingIndex] = merged;
      this.rebuildScanCatalog();
      if (persist) this.saveToFile();
      return merged;
    } else {
      const created: CatalogItem = {
        plu: plu || null,
        articul: articul || null,
        name: name || (plu ? `Товар PLU ${plu}` : `Товар ${articul}`),
        weight: typeof newEntry.weight === 'number' ? newEntry.weight : 0,
        shelf_life: typeof newEntry.shelf_life === 'number' ? newEntry.shelf_life : 10,
        description: desc, // Пустое, если нет описания (никаких 'добавлено оператором')
        category: category
      };
      this.items.push(created);
      this.rebuildScanCatalog();
      if (persist) this.saveToFile();
      return created;
    }
  }

  deleteCatalogItem(pluOrArticul: string): boolean {
    const target = pluOrArticul.trim();
    const initLen = this.items.length;
    this.items = this.items.filter(item => {
      const iPlu = (item.plu || '').toString().trim();
      const iArt = (item.articul || '').toString().trim();
      return iPlu !== target && iArt !== target;
    });

    if (this.items.length !== initLen) {
      this.rebuildScanCatalog();
      this.saveToFile();
      return true;
    }
    return false;
  }

  updateCatalogItem(pluOrArticul: string, updates: Partial<CatalogItem>): CatalogItem | null {
    const target = pluOrArticul.trim();
    const index = this.items.findIndex(item => {
      const iPlu = (item.plu || '').toString().trim();
      const iArt = (item.articul || '').toString().trim();
      return iPlu === target || iArt === target;
    });

    if (index === -1) return null;

    const existing = this.items[index];
    const updated: CatalogItem = {
      ...existing,
      name: updates.name !== undefined ? updates.name.trim() : existing.name,
      description: updates.description !== undefined ? updates.description.trim() : (existing.description || ''),
      category: updates.category !== undefined ? updates.category.trim() : (existing.category || 'Рыба и морепродукты'),
      shelf_life: typeof updates.shelf_life === 'number' ? updates.shelf_life : existing.shelf_life,
      weight: typeof updates.weight === 'number' ? updates.weight : existing.weight
    };

    this.items[index] = updated;
    this.rebuildScanCatalog();
    this.saveToFile();
    return updated;
  }

  autoFill(item: Item): void {
    item.plu = item.plu ? String(item.plu).trim() : '';
    item.articul = item.articul ? String(item.articul).trim() : '';

    const matched = this.findCatalogItem(item.plu, item.articul);
    if (matched) {
      if (!item.articul && matched.articul) {
        item.articul = String(matched.articul).trim();
      }
      if (!item.plu && matched.plu) {
        item.plu = String(matched.plu).trim();
      }
      if (!item.name && matched.name) {
        item.name = matched.name;
      }
      if (!item.description && matched.description) {
        item.description = matched.description;
      }
      if (!item.category && matched.category) {
        item.category = matched.category;
      }
      if (typeof item.shelf_life !== 'number' && typeof matched.shelf_life === 'number') {
        item.shelf_life = matched.shelf_life;
      }
      if (typeof item.weight !== 'number' && typeof matched.weight === 'number') {
        item.weight = matched.weight;
      }
    }
  }

  getItemsCount(): number {
    return this.items.length;
  }
}

export const catalogService = new CatalogService();
