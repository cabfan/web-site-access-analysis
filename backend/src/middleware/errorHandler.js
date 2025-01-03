const { createLogger, format, transports } = require('winston');

// 配置日志记录器
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' })
  ]
});

// 开发环境下同时输出到控制台
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}

function errorHandler(err, req, res, next) {
  // 记录错误
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 区分错误类型
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '输入验证失败',
      details: err.message
    });
  }

  if (err.name === 'FileTypeError') {
    return res.status(400).json({
      error: '不支持的文件类型',
      details: err.message
    });
  }

  // 默认服务器错误响应
  res.status(500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
}

module.exports = errorHandler; 