const db = require('../models/db');

class AnalysisController {
  static async getHistory(req, res) {
    try {
      let sql = `SELECT * FROM analysis_results WHERE 1=1`;
      const params = [];

      // 添加服务器筛选
      if (req.query.serverIp) {
        sql += ` AND server_ip = ?`;
        params.push(req.query.serverIp);
      }

      // 添加日期筛选
      if (req.query.logDate) {
        sql += ` AND log_date = ?`;
        params.push(req.query.logDate);
      }

      // 添加排序
      sql += ` ORDER BY analysis_date DESC`;

      const results = await db.all(sql, params);
      
      const parsedResults = results.map(result => {
        // 转换分析时间为北京时间
        const utcDate = new Date(result.analysis_date);
        const beijingDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
        
        return {
          ...result,
          analysis_date: beijingDate.toISOString(),
          analysis_data: result.analysis_data ? JSON.parse(result.analysis_data) : null
        };
      });
      
      res.json(parsedResults);
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getDetails(req, res) {
    try {
      const result = await db.get(`
        SELECT * FROM analysis_results 
        WHERE id = ?
      `, [req.params.id]);
      
      if (!result) {
        return res.status(404).json({ error: '分析记录不存在' });
      }
      
      // 转换分析时间为北京时间
      const utcDate = new Date(result.analysis_date);
      const beijingDate = new Date(utcDate.getTime() + 8 * 60 * 60 * 1000);
      result.analysis_date = beijingDate.toISOString();
      
      res.json(result);
    } catch (error) {
      console.error('Error fetching analysis details:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await db.run(`
        DELETE FROM analysis_results 
        WHERE id = ?
      `, [req.params.id]);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AnalysisController; 