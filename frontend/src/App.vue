<template>
  <n-config-provider>
    <n-dialog-provider>
      <n-message-provider>
        <div class="app-container">
          <header class="app-header">
            <div class="header-content">
              <div class="logo">
                <n-icon size="24" color="#18a058">
                  <analytics-outline />
                </n-icon>
                <span class="title">LogVista</span>
              </div>
              <n-menu
                v-model:value="activeKey"
                mode="horizontal"
                :options="menuOptions"
                @update:value="handleMenuClick"
              />
            </div>
          </header>
          <main class="app-content">
            <router-view></router-view>
          </main>
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import { h, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  NConfigProvider, 
  NMenu,
  NIcon,
  NDialogProvider,
  NMessageProvider
} from 'naive-ui'
import { 
  AnalyticsOutline,
  CloudUploadOutline,
  TimeOutline
} from '@vicons/ionicons5'

const router = useRouter()
const activeKey = ref(router.currentRoute.value.path)

function handleMenuClick(key) {
  router.push(key)
}

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  activeKey.value = newPath
})

const menuOptions = [
  {
    label: '仪表盘',
    key: '/',
    icon: renderIcon(AnalyticsOutline)
  },
  {
    label: '上传日志',
    key: '/upload',
    icon: renderIcon(CloudUploadOutline)
  },
  {
    label: '历史记录',
    key: '/history',
    icon: renderIcon(TimeOutline)
  }
]

function renderIcon(icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}
</script>

<style scoped>
.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--background-color);
}

.app-header {
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 48px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
  color: #18a058;
}

.app-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style> 