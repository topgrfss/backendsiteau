import { Item } from './models.js';
import { catalogService } from './catalog.js';

export class ItemStorage {
  private items: Map<number, Item> = new Map();
  private nextId = 1;

  constructor() {
    // База склада очищена по запросу пользователя. Каталог сохранен.
    this.items.clear();
  }

  private enrichWithCatalog(item: Item): Item {
    const enriched = { ...item, date: { ...item.date } };
    const cat = catalogService.findCatalogItem(enriched.plu, enriched.articul);
    if (cat) {
      if (!enriched.description && cat.description) {
        enriched.description = cat.description;
      }
      if (!enriched.category && cat.category) {
        enriched.category = cat.category;
      }
      if (typeof enriched.shelf_life !== 'number' && typeof cat.shelf_life === 'number') {
        enriched.shelf_life = cat.shelf_life;
      }
      if (typeof enriched.weight !== 'number' && typeof cat.weight === 'number') {
        enriched.weight = cat.weight;
      }
    }
    return enriched;
  }

  getAllItems(): Item[] {
    const list = Array.from(this.items.values()).map(item => this.enrichWithCatalog(item));
    // ORDER BY date(date_end) ASC, id DESC
    return list.sort((a, b) => {
      if (a.date.end < b.date.end) return -1;
      if (a.date.end > b.date.end) return 1;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }

  getItemById(id: number): Item | null {
    const item = this.items.get(id);
    return item ? this.enrichWithCatalog(item) : null;
  }

  createItem(item: Omit<Item, 'id'> | Item): number {
    const id = this.nextId++;
    const newItem: Item = {
      ...item,
      id,
      date: { ...item.date }
    };
    this.items.set(id, newItem);
    return id;
  }

  updateItem(id: number, item: Item): boolean {
    if (!this.items.has(id)) {
      return false;
    }
    this.items.set(id, {
      ...item,
      id,
      date: { ...item.date }
    });
    return true;
  }

  deleteItem(id: number): boolean {
    return this.items.delete(id);
  }

  clear(): void {
    this.items.clear();
  }
}

export const storage = new ItemStorage();
