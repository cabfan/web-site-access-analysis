const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

let db;

async function getDb() {
  if (!db) {
    db = await sqlite.open({
      filename: path.join(__dirname, '../../database/analysis.db'),
      driver: sqlite3.Database
    });
  }
  return db;
}

module.exports = {
  async run(sql, params = []) {
    const db = await getDb();
    return await db.run(sql, params);
  },
  
  async all(sql, params = []) {
    const db = await getDb();
    return await db.all(sql, params);
  },
  
  async get(sql, params = []) {
    const db = await getDb();
    return await db.get(sql, params);
  }
}; 