const LogParser = require('../services/parser/LogParser');
const path = require('path');

describe('LogParser', () => {
  const sampleLogPath = path.join(__dirname, '../__fixtures__/sample.log');

  test('should detect IIS log format', async () => {
    const parser = await LogParser.detectLogType(sampleLogPath);
    expect(parser.constructor.name).toBe('IISParser');
  });

  test('should parse log entries correctly', async () => {
    const parser = await LogParser.detectLogType(sampleLogPath);
    const entries = await LogParser.parse(sampleLogPath, parser);
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
  });
}); 