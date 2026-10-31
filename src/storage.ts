import { Item } from './models.js';

export class ItemStorage {
  private items: Map<number, Item> = new Map();
  private nextId = 1;

  constructor() {
    this.seedInitialItems();
  }

  private seedInitialItems(): void {
    const initialItems: Array<Omit<Item, 'id'>> = [
      {
        name: 'форель карелия 2+',
        plu: '49393',
        articul: '289649',
        quantity: 12,
        date: { start: '2026-10-25', end: '2026-11-08' }
      },
      {
        name: 'треска филе',
        plu: '13862',
        articul: '613512',
        quantity: 8,
        date: { start: '2026-10-28', end: '2026-11-06' }
      },
      {
        name: 'щука филе',
        plu: '13869',
        articul: '539977',
        quantity: 5,
        date: { start: '2026-10-30', end: '2026-11-07' }
      }
    ];

    for (const item of initialItems) {
      this.createItem(item);
    }
  }

  getAllItems(): Item[] {
    const list = Array.from(this.items.values());
    // ORDER BY date(date_end) ASC, id DESC
    return list.sort((a, b) => {
      if (a.date.end < b.date.end) return -1;
      if (a.date.end > b.date.end) return 1;
      return (b.id ?? 0) - (a.id ?? 0);
    });
  }

  getItemById(id: number): Item | null {
    const item = this.items.get(id);
    return item ? { ...item, date: { ...item.date } } : null;
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
