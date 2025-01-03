const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs').promises;

async function initDatabase() {
  const dbPath = path.join(__dirname, '../../database/analysis.db');
  const dbDir = path.dirname(dbPath);

  // 确保数据库目录存在
  try {
    await fs.mkdir(dbDir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // 读取并执行 schema.sql
  const schema = await fs.readFile(
    path.join(__dirname, 'schema.sql'),
    'utf-8'
  );

  await db.exec(schema);
  console.log('Database initialized successfully');
  
  return db;
}

module.exports = initDatabase; 