<template>
  <n-config-provider 
    :theme="theme" 
    :theme-name="isDark ? 'dark' : 'light'"
    :locale="zhCN"
    :date-locale="dateZhCN"
  >
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
              <div class="theme-switch">
                <n-space>
                  <n-button quaternary circle @click="toggleTheme">
                    <template #icon>
                      <n-icon size="18">
                        <sunny-outline v-if="isDark" />
                        <moon-outline v-else />
                      </n-icon>
                    </template>
                  </n-button>
                  <n-button quaternary circle @click="router.push('/settings')">
                    <template #icon>
                      <n-icon size="18">
                        <settings-outline />
                      </n-icon>
                    </template>
                  </n-button>
                </n-space>
              </div>
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
  NMessageProvider,
  NButton,
  NSpace,
  darkTheme,
  zhCN,
  dateZhCN
} from 'naive-ui'
import { 
  AnalyticsOutline,
  CloudUploadOutline,
  TimeOutline,
  SunnyOutline,
  MoonOutline,
  SettingsOutline,
  SpeedometerOutline
} from '@vicons/ionicons5'
import { useStorage } from '@vueuse/core'

const router = useRouter()
const activeKey = ref(router.currentRoute.value.path)
const isDark = useStorage('theme-mode', false)
const theme = ref(null)

function toggleTheme() {
  isDark.value = !isDark.value
}

function handleMenuClick(key) {
  router.push(key)
}

// 监听路由变化
watch(() => router.currentRoute.value.path, (newPath) => {
  activeKey.value = newPath
})

// 监听主题变化
watch(isDark, (newValue) => {
  theme.value = newValue ? darkTheme : null
  // 更新 document 的 theme-name 属性
  document.documentElement.setAttribute('theme-name', newValue ? 'dark' : 'light')
  // 更新 body 的背景色
  document.body.style.backgroundColor = newValue ? 'var(--dark-background)' : 'var(--background-color)'
}, { immediate: true })

const menuOptions = [
  {
    label: '仪表盘',
    key: '/',
    icon: renderIcon(SpeedometerOutline)
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
}

.app-header {
  height: 64px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
}

[theme-name="dark"] .app-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background-color: rgba(16, 16, 20, 0.7);
}

.header-content {
  width: 100%;
  margin: 0 auto;
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 48px;
  box-sizing: border-box;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: bold;
  color: #18a058;
  padding-right: 48px;
  min-width: fit-content;
}

.n-menu {
  flex: 1;
  min-width: 400px;
}

.theme-switch {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.theme-switch .n-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

[theme-name="dark"] .theme-switch .n-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.app-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}
</style> 