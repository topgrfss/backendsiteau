import { Item } from './models.js';
import { catalogService } from './catalog.js';

export class ItemStorage {
  private items: Map<number, Item> = new Map();
  private nextId = 1;

  constructor() {
    this.seedInitialItems();
  }

  private seedInitialItems(): void {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const addDays = (base: Date, days: number): string => {
      const target = new Date(base.getTime() + days * 86400000);
      return fmt(target);
    };

    const initialItems: Array<Omit<Item, 'id'>> = [
      {
        name: 'форель карелия 2+',
        plu: '49393',
        articul: '289649',
        quantity: 14.5,
        date: { start: addDays(today, -3), end: addDays(today, 11) },
        description: 'Свежая охлажденная форель из Карелии, навеска 2+ кг. Идеально для запекания и стейков.',
        shelf_life: 14
      },
      {
        name: 'треска филе',
        plu: '13862',
        articul: '613512',
        quantity: 22.0,
        date: { start: addDays(today, -2), end: addDays(today, 7) },
        description: 'Филе дикой атлантической трески без кожи и костей. Диетический продукт с высоким содержанием белка.',
        shelf_life: 9
      },
      {
        name: 'лосось стейк орд',
        plu: '60368',
        articul: '000',
        quantity: 6.0,
        date: { start: addDays(today, -1), end: addDays(today, 0) },
        description: 'Свежесрезанные стейки атлантического лосося с витрины собственного производства.',
        shelf_life: 1
      },
      {
        name: 'камбала',
        plu: '41645',
        articul: '487381',
        quantity: 18.0,
        date: { start: addDays(today, -7), end: addDays(today, 2) },
        description: 'Охлажденная камбала с нежным слоистым мясом. Прекрасна для жарки на сливочном масле.',
        shelf_life: 9
      },
      {
        name: 'щука филе',
        plu: '13869',
        articul: '539977',
        quantity: 9.5,
        date: { start: addDays(today, -12), end: addDays(today, -3) },
        description: 'Нежное филе речной щуки. Отлично подходит для паровых котлет и диетических блюд.',
        shelf_life: 9
      }
    ];

    for (const item of initialItems) {
      this.createItem(item);
    }
  }

  private enrichWithCatalog(item: Item): Item {
    const enriched = { ...item, date: { ...item.date } };
    if (!enriched.description || !enriched.shelf_life) {
      const cat = catalogService.findCatalogItem(enriched.plu, enriched.articul);
      if (cat) {
        if (!enriched.description && cat.description) {
          enriched.description = cat.description;
        }
        if (typeof enriched.shelf_life !== 'number' && typeof cat.shelf_life === 'number') {
          enriched.shelf_life = cat.shelf_life;
        }
        if (typeof enriched.weight !== 'number' && typeof cat.weight === 'number') {
          enriched.weight = cat.weight;
        }
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
}

export const storage = new ItemStorage();
