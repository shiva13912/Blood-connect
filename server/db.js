import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'bloodconnect.db');

let db = null;

export async function initDB() {
  const SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'donor',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS donors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER DEFAULT 30,
    gender TEXT DEFAULT 'Male',
    bloodGroup TEXT NOT NULL DEFAULT 'O+',
    city TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT UNIQUE NOT NULL,
    eligibility INTEGER DEFAULT 1,
    lastDonationDate TEXT DEFAULT '',
    totalDonations INTEGER DEFAULT 0,
    availability INTEGER DEFAULT 1,
    profileImage TEXT DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patientName TEXT NOT NULL,
    bloodGroup TEXT NOT NULL,
    hospital TEXT DEFAULT '',
    city TEXT DEFAULT '',
    contactNumber TEXT DEFAULT '',
    urgency TEXT DEFAULT 'Medium',
    status TEXT DEFAULT 'Pending',
    createdBy TEXT DEFAULT 'anonymous',
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    recipientId INTEGER,
    recipientEmail TEXT,
    recipientName TEXT,
    type TEXT DEFAULT 'info',
    title TEXT DEFAULT '',
    message TEXT DEFAULT '',
    requestId INTEGER,
    requestData TEXT,
    isRead INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  saveDB();
  return db;
}

function saveDB() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

export function all(sql, params = {}) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

export function get(sql, params = {}) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

export function run(sql, params = {}) {
  db.run(sql, params);
  const id = db.exec("SELECT last_insert_rowid() as id")[0]?.values[0][0];
  saveDB();
  return { lastInsertRowid: id, changes: db.getRowsModified() };
}

export default { initDB, all, get, run };
