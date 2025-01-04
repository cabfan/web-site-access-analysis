const db = require('./db')

class AIAnalysis {
  static async create(data) {
    try {
      
      const sql = `
        INSERT INTO ai_analyses (server_ip, log_date, analysis_date, content)
        VALUES (?, ?, ?, ?)
      `
      const result = await db.run(sql, [
        data.serverIp,
        data.logDate,
        new Date().toISOString(),  // 直接使用当前时间，不需要手动加8小时
        data.content
      ])
      
      return { id: result.lastID, ...data }
    } catch (error) {
      console.error('Error creating AI analysis:', error);
      throw error;
    }
  }

  static async findAll(where = {}) {
    let sql = 'SELECT * FROM ai_analyses'
    const params = []

    if (where.serverIp || where.logDate) {
      sql += ' WHERE'
      const conditions = []
      
      if (where.serverIp) {
        conditions.push(' server_ip = ?')
        params.push(where.serverIp)
      }
      
      if (where.logDate) {
        conditions.push(' date(log_date) = date(?)')
        params.push(where.logDate)
      }
      
      sql += conditions.join(' AND')
    }

    sql += ' ORDER BY analysis_date DESC'
    
    return await db.all(sql, params)
  }

  static async delete(id) {
    const sql = 'DELETE FROM ai_analyses WHERE id = ?'
    await db.run(sql, [id])
    return true
  }
}

module.exports = AIAnalysis 