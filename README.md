# PromptZen

**PromptZen** 是一个简洁高效的 Prompt 管理工具，旨在帮助用户高效管理、学习和使用自己的 Prompt，支持与 OpenAI 接口对接，实时获取生成结果，简化与 AI 的互动流程。

## 项目功能
- **Prompt 管理**：通过标签、搜索和分类，轻松管理和查找你的 Prompt。
- **实时预览与插值**：输入动态变量并实时预览生成的完整 Prompt。
- **与 OpenAI 接口对接**：一键将 Prompt 发送到 OpenAI API，快速获取生成结果。
- **历史记录**：记录和复用已发送的 Prompt，提高效率。
- **本地存储与备份**：所有数据存储在 SQLite3 中，支持导出与备份。

## 技术栈
- **前端**：Vue 3 + Vite
- **后端**：Node.js + Express
- **数据库**：SQLite3
- **UI**：Naive UI

## 安装与使用

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/PromptZen.git
cd PromptZen
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动开发环境
```bash
npm run dev
```

### 4. 配置 API Key
在项目根目录下创建 .env 文件，并加入以下内容：
```bash
OPENAI_API_KEY=your_openai_api_key
```

## 项目结构
```bash
PromptZen/
├── client/                # 前端代码目录
│   ├── public/            # 静态资源文件（如 favicon、全局图片等）
│   ├── src/               # Vue3 源代码
│   │   ├── assets/        # 静态资源，如图片、CSS、图标等
│   │   ├── components/    # 通用组件（如按钮、卡片）
│   │   ├── layouts/       # 页面布局组件（如 Header、Sidebar）
│   │   ├── pages/         # 页面组件（如首页、设置页）
│   │   ├── router/        # 路由配置
│   │   ├── store/         # 状态管理（Pinia）
│   │   ├── utils/         # 通用工具函数
│   │   ├── App.vue        # Vue 根组件
│   │   ├── main.js        # 应用入口文件
│   │   └── vite.config.js # Vite 配置文件
│   └── package.json       # 前端依赖
│
├── server/                # 后端代码目录
│   ├── db/                # 数据库文件和初始化脚本
│   │   ├── database.sqlite3  # SQLite 数据文件
│   │   └── schema.sql        # 数据库表结构定义
│   ├── routes/            # API 路由
│   ├── utils/             # 通用工具（如变量替换工具）
│   ├── app.js             # Express 应用入口
│   ├── config.js          # 配置文件（如端口、API Key）
│   ├── package.json       # 后端依赖
│   └── .env               # 环境变量（如 API Key）
│
├── .gitignore             # Git 忽略文件
├── README.md              # 项目说明文件
└── LICENSE                # 许可证
```

## License
MIT License