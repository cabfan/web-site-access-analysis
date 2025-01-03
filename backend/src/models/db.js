const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

let db = null;

async function getDb() {
  if (db) return db;
  
  const dbPath = path.join(__dirname, '../../database/analysis.db');
  
  // 确保数据库目录存在
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // 如果数据库文件存在，先删除它
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });
  
  // 确保表已创建
  const schema = fs.readFileSync(
    path.join(__dirname, '../database/schema.sql'),
    'utf-8'
  );
  
  await db.exec(schema);
  console.log('Database initialized with schema');
  
  return db;
}

module.exports = {
  async run(sql, params = []) {
    const db = await getDb();
    return db.run(sql, params);
  },
  
  async get(sql, params = []) {
    const db = await getDb();
    return db.get(sql, params);
  },
  
  async all(sql, params = []) {
    const db = await getDb();
    return db.all(sql, params);
  }
}; 