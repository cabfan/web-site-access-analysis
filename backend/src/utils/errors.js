class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class FileTypeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FileTypeError';
  }
}

class ParserError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ParserError';
  }
}

module.exports = {
  ValidationError,
  FileTypeError,
  ParserError
}; 