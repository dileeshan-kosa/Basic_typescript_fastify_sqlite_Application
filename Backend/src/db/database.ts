import Database from 'better-sqlite3';

// Initialize the SQLite Database
const db = new Database('ceyinfo.db');

// Create the 'users' table if it doesn't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL
  )
`);

export default db;