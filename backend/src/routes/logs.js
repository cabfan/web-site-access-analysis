const express = require('express');
const router = express.Router();
const multer = require('multer');
const LogController = require('../controllers/LogController');
const { FileTypeError } = require('../utils/errors');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
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

router.post('/upload', upload.single('logFile'), LogController.uploadAndAnalyze);
router.get('/types', LogController.getSupportedTypes);
router.get('/servers', LogController.getServerList);

module.exports = router; 