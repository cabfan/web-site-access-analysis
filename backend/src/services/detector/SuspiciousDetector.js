class SuspiciousDetector {
  static async detect(logEntries) {
    const suspiciousRequests = [];
    const ipRequestCount = {};
    const knownVulnerabilityPatterns = this.getVulnerabilityPatterns();

    // 按IP分组请求
    logEntries.forEach(entry => {
      if (!ipRequestCount[entry.ip]) {
        ipRequestCount[entry.ip] = {
          count: 0,
          requests: []
        };
      }
      ipRequestCount[entry.ip].count++;
      ipRequestCount[entry.ip].requests.push(entry);
    });

    // 检测可疑行为
    Object.entries(ipRequestCount).forEach(([ip, data]) => {
      // 检测高频请求
      if (this.isHighFrequency(data.count, data.requests)) {
        suspiciousRequests.push({
          ip,
          type: 'high_frequency',
          details: `${data.count} requests in short time`
        });
      }

      // 检测漏洞扫描
      data.requests.forEach(request => {
        const vulnerabilityMatch = this.checkVulnerabilityPatterns(request.path, knownVulnerabilityPatterns);
        if (vulnerabilityMatch) {
          suspiciousRequests.push({
            ip,
            type: 'vulnerability_scan',
            details: `Attempted to access ${vulnerabilityMatch}`
          });
        }
      });
    });

    return suspiciousRequests;
  }

  static isHighFrequency(count, requests) {
    // 简单的频率检测：每分钟超过100个请求
    return count > 100;
  }

  static getVulnerabilityPatterns() {
    return [
      { pattern: /\.(php|asp|aspx|jsp)$/, type: 'common_web_files' },
      { pattern: /admin|login|wp-admin|phpMyAdmin/, type: 'admin_access' },
      { pattern: /\?.*=.*'/, type: 'sql_injection' },
      { pattern: /<script>|alert\(/, type: 'xss' },
      { pattern: /\.\.|\/etc\/passwd|\/windows\/win.ini/, type: 'path_traversal' }
    ];
  }

  static checkVulnerabilityPatterns(path, patterns) {
    for (const { pattern, type } of patterns) {
      if (pattern.test(path)) {
        return type;
      }
    }
    return null;
  }
}

module.exports = SuspiciousDetector; 