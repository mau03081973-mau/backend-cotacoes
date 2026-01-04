import * as SQLite from "expo-sqlite";

let db = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync("investimentos.db");
  }
  return db;
}

export async function initDB() {
  const database = await getDB();

  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS acoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_compra REAL NOT NULL,
      data_compra TEXT
    );
  `);
}
