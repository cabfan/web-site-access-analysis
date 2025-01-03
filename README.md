# Web Site Access Analysis

**Web Site Access Analysis** 是一个强大的Web服务器日志分析工具，支持分析IIS、Nginx等服务器的访问日志，帮助管理员发现潜在的安全威胁和了解网站访问情况。

## 项目功能
- **日志分析**：支持上传并分析IIS、Nginx等服务器的访问日志
- **数据可视化**：通过图表直观展示访问量、请求分布等数据
- **安全监测**：
  - 检测可疑的爬虫行为
  - 识别潜在的漏洞扫描请求
  - 发现异常访问模式
- **历史记录**：分析结果持久化存储，支持随时查看历史分析报告
- **轻量级存储**：仅保存分析结果，不存储原始日志，节省存储空间

## 技术栈
- **前端**：Vue 3 + Vite
- **后端**：Node.js + Express
- **数据库**：SQLite3
- **UI**：Naive UI

## 项目结构
```bash
web-site-access-analysis/
├── frontend/                # 前端代码目录
│   ├── src/                 # Vue3 源代码
│   │   ├── assets/         # 静态资源
│   │   ├── components/     # 通用组件
│   │   ├── views/          # 页面组件
│   │   │   ├── Dashboard/  # 数据展示面板
│   │   │   ├── Upload/     # 日志上传页面
│   │   │   └── History/    # 历史记录页面
│   │   ├── router/         # 路由配置
│   │   ├── stores/         # 状态管理（Pinia）
│   │   └── utils/          # 工具函数
│   └── package.json
│
├── backend/                 # 后端代码目录
│   ├── src/
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务逻辑
│   │   │   ├── parser/     # 日志解析器
│   │   │   ├── analyzer/   # 数据分析模块
│   │   │   └── detector/   # 异常检测模块
│   │   ├── models/         # 数据模型
│   │   └── utils/          # 工具函数
│   ├── database/           # SQLite数据库文件
│   └── package.json
│
└── README.md
```

## 安装与使用

### 后端启动
```bash
cd backend
npm install
npm run dev
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 支持的日志格式
- IIS 日志 (W3C 格式)
- Nginx 访问日志 (默认格式)
- Apache 访问日志 (Common Log Format)

## 分析指标
1. 访问统计
   - 总请求量
   - 独立IP数
   - 请求方法分布
   - 响应状态码分布

2. 安全分析
   - 可疑爬虫行为识别
   - 漏洞扫描请求检测
   - 暴力破解尝试检测
   - 异常请求模式识别

3. 性能分析
   - 响应时间分布
   - 带宽使用情况
   - 高频访问资源统计

## 开发计划
- [ ] 支持更多日志格式
- [ ] 添加实时分析功能
- [ ] 导出分析报告
- [ ] 自定义分析规则
- [ ] 告警通知功能

## License
MIT License
