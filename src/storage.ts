import Database from 'better-sqlite3';
import { Item } from './models.js';
import { catalogService } from './catalog.js';
import { config } from './config.js';

interface ItemRow {
  id: number;
  name: string;
  plu: string | null;
  articul: string | null;
  quantity: number;
  shelf_life: number | null;
  weight: number | null;
  category: string | null;
  description: string | null;
  date_start: string;
  date_end: string;
}

export class ItemStorage {
  private db: Database.Database;

  constructor(dbPath?: string) {
    const path = dbPath || config.dbPath || 'app.db';
    this.db = new Database(path);
    // Включаем WAL-режим для надежности и высокой скорости
    this.db.pragma('journal_mode = WAL');
    this.initSchema();
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        plu TEXT DEFAULT '',
        articul TEXT DEFAULT '',
        quantity REAL NOT NULL,
        shelf_life INTEGER DEFAULT 10,
        weight REAL DEFAULT 0,
        category TEXT DEFAULT '',
        description TEXT DEFAULT '',
        date_start TEXT NOT NULL,
        date_end TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_items_date_end ON items(date_end);
      CREATE INDEX IF NOT EXISTS idx_items_plu ON items(plu);
    `);
    console.info(`[SQLite] База данных подключена: ${config.dbPath || 'app.db'}`);
  }

  private rowToItem(row: ItemRow): Item {
    const item: Item = {
      id: row.id,
      name: row.name,
      plu: row.plu || '',
      articul: row.articul || '',
      quantity: row.quantity,
      shelf_life: row.shelf_life ?? 10,
      weight: row.weight ?? 0,
      category: row.category || '',
      description: row.description || '',
      date: {
        start: row.date_start,
        end: row.date_end
      }
    };
    return this.enrichWithCatalog(item);
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
    const stmt = this.db.prepare<[], ItemRow>(`
      SELECT id, name, plu, articul, quantity, shelf_life, weight, category, description, date_start, date_end
      FROM items
      ORDER BY date(date_end) ASC, id DESC
    `);
    const rows = stmt.all();
    return rows.map(r => this.rowToItem(r));
  }

  getItemById(id: number): Item | null {
    const stmt = this.db.prepare<[number], ItemRow>(`
      SELECT id, name, plu, articul, quantity, shelf_life, weight, category, description, date_start, date_end
      FROM items
      WHERE id = ?
    `);
    const row = stmt.get(id);
    return row ? this.rowToItem(row) : null;
  }

  createItem(item: Omit<Item, 'id'> | Item): number {
    const stmt = this.db.prepare(`
      INSERT INTO items (name, plu, articul, quantity, shelf_life, weight, category, description, date_start, date_end)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      item.name,
      item.plu || '',
      item.articul || '',
      item.quantity,
      item.shelf_life ?? 10,
      item.weight ?? 0,
      item.category || '',
      item.description || '',
      item.date.start,
      item.date.end
    );
    return Number(info.lastInsertRowid);
  }

  updateItem(id: number, item: Item): boolean {
    const stmt = this.db.prepare(`
      UPDATE items
      SET name = ?, plu = ?, articul = ?, quantity = ?, shelf_life = ?, weight = ?, category = ?, description = ?, date_start = ?, date_end = ?
      WHERE id = ?
    `);
    const info = stmt.run(
      item.name,
      item.plu || '',
      item.articul || '',
      item.quantity,
      item.shelf_life ?? 10,
      item.weight ?? 0,
      item.category || '',
      item.description || '',
      item.date.start,
      item.date.end,
      id
    );
    return info.changes > 0;
  }

  deleteItem(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM items WHERE id = ?`);
    const info = stmt.run(id);
    return info.changes > 0;
  }

  clear(): void {
    this.db.exec(`
      DELETE FROM items;
      DELETE FROM sqlite_sequence WHERE name = 'items';
    `);
  }

  close(): void {
    this.db.close();
  }
}

export const storage = new ItemStorage();
