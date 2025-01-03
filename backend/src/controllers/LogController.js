const LogParser = require('../services/parser/LogParser');
const LogAnalyzer = require('../services/analyzer/LogAnalyzer');
const db = require('../models/db');
const { ValidationError } = require('../utils/errors');

class LogController {
  static async uploadAndAnalyze(req, res, next) {
    try {
      if (!req.file) {
        throw new ValidationError('没有上传文件');
      }

      // 验证必填字段
      if (!req.body.serverIp) {
        throw new ValidationError('服务器IP是必填项');
      }
      if (!req.body.logDate) {
        throw new ValidationError('日志日期是必填项');
      }

      // 获取时区设置
      const isGMTTime = req.body.isGMTTime === 'true';

      // 1. 解析日志类型
      const parser = await LogParser.detectLogType(req.file.path);
      
      // 2. 解析日志文件
      const logEntries = await LogParser.parse(req.file.path, parser);
      
      // 3. 分析日志数据
      const analysisResult = await LogAnalyzer.analyze(logEntries, { isGMTTime });
      
      // 4. 保存分析结果到数据库
      const result = await db.run(`
        INSERT INTO analysis_results 
        (file_name, server_ip, log_date, total_requests, unique_ips, suspicious_requests, analysis_data)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        req.file.originalname,
        req.body.serverIp,
        req.body.logDate,
        analysisResult.totalRequests,
        analysisResult.uniqueIps,
        analysisResult.suspiciousRequests,
        JSON.stringify(analysisResult.details)
      ]);

      res.json({
        success: true,
        analysisId: result.lastID,
        summary: analysisResult
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSupportedTypes(req, res) {
    res.json({
      supportedTypes: [
        { name: 'IIS (W3C)', extension: '.log' },
        { name: 'Nginx', extension: '.log' },
        { name: 'Apache', extension: '.log' }
      ]
    });
  }

  static async getServerList(req, res) {
    try {
      const results = await db.all(`
        SELECT DISTINCT server_ip 
        FROM analysis_results 
        ORDER BY server_ip
      `);
      
      res.json(results.map(r => r.server_ip));
    } catch (error) {
      console.error('Error fetching server list:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = LogController; 