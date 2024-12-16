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
