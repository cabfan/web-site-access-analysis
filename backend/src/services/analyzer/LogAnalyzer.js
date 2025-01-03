const SuspiciousDetector = require('../detector/SuspiciousDetector');

class LogAnalyzer {
  static async analyze(logEntries, options = {}) {
    // 基础统计
    const stats = this.calculateBasicStats(logEntries);
    
    // 可疑请求检测
    const allSuspiciousRequests = await SuspiciousDetector.detect(logEntries);
    
    // 对可疑请求进行分页处理
    const suspiciousRequests = {
      total: allSuspiciousRequests.length,
      items: allSuspiciousRequests.slice(0, 100), // 默认只返回前100条
      pageSize: 100,
      currentPage: 1
    };
    
    // 时间趋势分析
    const trends = this.analyzeTrends(logEntries, options);
    
    // 状态码分布
    const statusCodeDist = this.analyzeStatusCodes(logEntries);

    return {
      totalRequests: logEntries.length,
      uniqueIps: stats.uniqueIps,
      suspiciousRequests: allSuspiciousRequests.length,
      details: {
        trends,
        statusCodeDist,
        suspiciousRequests,
        topIps: stats.topIps,
        topPaths: stats.topPaths,
        topUserAgents: stats.topUserAgents
      }
    };
  }

  static calculateBasicStats(entries) {
    const ips = new Set();
    const ipCount = {};
    const pathCount = {};
    const userAgentCount = {};

    entries.forEach(entry => {
      // 统计IP
      ips.add(entry.ip);
      ipCount[entry.ip] = (ipCount[entry.ip] || 0) + 1;

      // 统计路径
      pathCount[entry.path] = (pathCount[entry.path] || 0) + 1;

      // 统计User Agent
      if (entry.userAgent) {
        userAgentCount[entry.userAgent] = (userAgentCount[entry.userAgent] || 0) + 1;
      }
    });

    return {
      uniqueIps: ips.size,
      topIps: this.getTopItems(ipCount, 10),
      topPaths: this.getTopItems(pathCount, 10),
      topUserAgents: this.getTopItems(userAgentCount, 10)
    };
  }

  static analyzeTrends(entries, options = {}) {
    const hourlyCount = {};
    
    entries.forEach(entry => {
      try {
        // 确保时间字段存在且有效
        if (!entry.time) {
          console.warn('Entry missing time field');
          return;
        }

        // 解析时间
        const date = new Date(entry.time);
        if (isNaN(date.getTime())) {
          console.warn('Invalid date:', entry.time);
          return;
        }

        // 直接使用本地时间，因为在导入时已经处理过时区了
        const hour = date.getHours();
        
        // 累加请求数
        hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
      } catch (error) {
        console.error('Error processing entry:', error);
      }
    });

    // 生成24小时的数据数组
    return Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourlyCount[i] || 0,
      label: `${i.toString().padStart(2, '0')}:00`
    }));
  }

  static analyzeStatusCodes(entries) {
    const statusCount = {};
    let totalRequests = 0;
    
    // 统计各状态码的数量
    entries.forEach(entry => {
      if (entry && entry.status != null) {
        const status = entry.status.toString();
        statusCount[status] = (statusCount[status] || 0) + 1;
        totalRequests++;
      }
    });

    // 状态码映射配置
    const statusMap = {
      '200': { name: '200 成功', color: '#18a058', category: 'success' },
      '301': { name: '301 永久重定向', color: '#2080f0', category: 'redirect' },
      '302': { name: '302 临时重定向', color: '#2080f0', category: 'redirect' },
      '304': { name: '304 未修改', color: '#2080f0', category: 'cached' },
      '400': { name: '400 错误请求', color: '#f0a020', category: 'client_error' },
      '401': { name: '401 未授权', color: '#f0a020', category: 'client_error' },
      '403': { name: '403 禁止访问', color: '#f0a020', category: 'client_error' },
      '404': { name: '404 未找到', color: '#f0a020', category: 'client_error' },
      '500': { name: '500 服务器错误', color: '#d03050', category: 'server_error' },
      '502': { name: '502 网关错误', color: '#d03050', category: 'server_error' },
      '503': { name: '503 服务不可用', color: '#d03050', category: 'server_error' },
      '504': { name: '504 网关超时', color: '#d03050', category: 'server_error' }
    };

    // 转换为前端需要的格式，包含状态码信息、数量和占比
    const result = Object.entries(statusCount).map(([status, count]) => {
      const statusInfo = statusMap[status] || {
        name: `${status} 其他`,
        color: '#909399',
        category: 'other'
      };

      return {
        status,
        name: statusInfo.name,
        color: statusInfo.color,
        category: statusInfo.category,
        count,
        percentage: ((count / totalRequests) * 100).toFixed(2)
      };
    });

    // 按数量排序
    result.sort((a, b) => b.count - a.count);

    // 计算分类统计
    const categoryStats = result.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          count: 0,
          percentage: 0
        };
      }
      acc[item.category].count += item.count;
      acc[item.category].percentage = ((acc[item.category].count / totalRequests) * 100).toFixed(2);
      return acc;
    }, {});

    return {
      details: result,
      categories: categoryStats,
      total: totalRequests
    };
  }

  static getTopItems(countMap, limit) {
    return Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([item, count]) => ({ item, count }));
  }
}

module.exports = LogAnalyzer; 