const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const errorHandler = require('./middleware/errorHandler');
const initDatabase = require('./database/init');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 初始化数据库
initDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
require('fs').mkdirSync(uploadDir, { recursive: true });

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(log|txt)$/)) {
      return cb(new FileTypeError('只支持 .log 和 .txt 文件'));
    }
    cb(null, true);
  }
});

// 路由
app.use('/api/logs', require('./routes/logs'));
app.use('/api/analysis', require('./routes/analysis'));

// 添加新的路由
const aiAnalysisRouter = require('./routes/aiAnalysis');
app.use('/api', aiAnalysisRouter);

// 错误处理
app.use(errorHandler);

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 