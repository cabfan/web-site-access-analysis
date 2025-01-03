const BaseParser = require('./BaseParser');
const fs = require('fs').promises;
const readline = require('readline');

class NginxParser extends BaseParser {
  async parse(filePath) {
    const fileStream = await fs.open(filePath, 'r');
    const rl = readline.createInterface({
      input: fileStream.createReadStream(),
      crlfDelay: Infinity
    });

    const entries = [];
    const pattern = /^(\S+) - (\S+) \[([\w:/]+\s[+\-]\d{4})\] "(\S+) (\S+) (\S+)" (\d{3}) (\d+) "([^"]*)" "([^"]*)"$/;

    for await (const line of rl) {
      const match = line.match(pattern);
      if (match) {
        const timeStr = match[3];
        const date = new Date(timeStr.replace(':', ' '));

        entries.push({
          ip: match[1],
          user: match[2],
          time: date.toISOString(),
          method: match[4],
          path: match[5],
          protocol: match[6],
          status: parseInt(match[7]),
          bytes: parseInt(match[8]),
          referer: match[9],
          userAgent: match[10]
        });
      }
    }

    return entries;
  }

  async detectLogType(firstLine) {
    const pattern = /^(\S+) - (\S+) \[([\w:/]+\s[+\-]\d{4})\]/;
    return pattern.test(firstLine);
  }
}

module.exports = NginxParser; 