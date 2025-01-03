const BaseParser = require('./BaseParser');
const fs = require('fs').promises;
const readline = require('readline');

class IISParser extends BaseParser {
  async parse(filePath) {
    const fileStream = await fs.open(filePath, 'r');
    const rl = readline.createInterface({
      input: fileStream.createReadStream(),
      crlfDelay: Infinity
    });

    const entries = [];
    let fields = [];
    let isHeader = true;
    let entryCount = 0;

    for await (const line of rl) {
      // 跳过注释行，但解析字段定义
      if (line.startsWith('#')) {
        if (line.includes('Fields:')) {
          fields = line.split(': ')[1].split(' ');
        }
        continue;
      }

      // 解析日志条目
      const values = line.split(' ');
      if (values.length === fields.length) {
        const entry = {};
        fields.forEach((field, index) => {
          const value = values[index];
          
          // 特殊字段处理
          if (field === 'date' || field === 'time') {
            entry[field] = value;
          } else if (field === 'sc-status') {  // 状态码字段
            entry.status = parseInt(value);     // 确保状态码是数字
          } else if (field === 'c-ip') {       // IP地址字段
            entry.ip = value;
          } else if (field === 'cs-uri-stem') { // 请求路径字段
            entry.path = value;
          } else if (field === 'cs(User-Agent)') { // User Agent字段
            entry.userAgent = value;
          } else {
            entry[field] = value;
          }
        });

        // 如果有日期和时间字段，合并它们并转换为北京时间
        if (entry.date && entry.time) {
          const gmtDate = new Date(`${entry.date} ${entry.time}`);
          // 转换为北京时间 (GMT+8)
          const beijingDate = new Date(gmtDate.getTime() + 8 * 60 * 60 * 1000);
          entry.time = beijingDate.toISOString();
          delete entry.date; // 删除单独的日期字段，因为已经合并到 time 中了
        }

        // 确保必要的字段存在
        if (!entry.status) entry.status = 0;
        if (!entry.ip) entry.ip = '-';
        if (!entry.path) entry.path = '-';

        entries.push(entry);
        entryCount++;
      }
    }

    return entries;
  }

  async detectLogType(firstLine) {
    return firstLine.startsWith('#Software: Microsoft Internet Information Services');
  }
}

module.exports = IISParser; 