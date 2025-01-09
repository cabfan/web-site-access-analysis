import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// 启动时的服务配置，包括IP、端口、启动后是否自动打开浏览
const _server_host = "0.0.0.0";
const _server_port = "5174";
const _server_open_browser = true;

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    host: _server_host,
    port: _server_port,
    open: _server_open_browser,
  },
}) 