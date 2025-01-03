class BaseParser {
  constructor() {
    if (this.constructor === BaseParser) {
      throw new Error('BaseParser cannot be instantiated directly');
    }
  }

  async parse(filePath) {
    throw new Error('parse method must be implemented');
  }

  async detectLogType(firstLine) {
    throw new Error('detectLogType method must be implemented');
  }
}

module.exports = BaseParser; 