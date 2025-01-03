const IISParser = require('./IISParser');
const NginxParser = require('./NginxParser');
const fs = require('fs').promises;

class LogParser {
  static async detectLogType(filePath) {
    const firstLine = await this.readFirstLine(filePath);
    
    const parsers = [
      new IISParser(),
      new NginxParser()
    ];

    for (const parser of parsers) {
      if (await parser.detectLogType(firstLine)) {
        return parser;
      }
    }

    throw new Error('Unsupported log format');
  }

  static async parse(filePath, parser) {
    return await parser.parse(filePath);
  }

  static async readFirstLine(filePath) {
    const fileStream = await fs.open(filePath, 'r');
    const rl = require('readline').createInterface({
      input: fileStream.createReadStream(),
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      rl.close();
      return line;
    }
  }
}

module.exports = LogParser; 