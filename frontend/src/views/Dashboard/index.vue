<template>
  <div class="dashboard-container">
    <n-scrollbar class="dashboard-scrollbar">
      <div class="dashboard-content">
        <n-card class="filter-card" :bordered="true">
          <n-space align="center" justify="space-between">
            <n-space align="center">
              <n-select
                v-model:value="selectedServer"
                :options="serverOptions"
                placeholder="选择服务器"
                style="width: 200px"
                @update:value="refreshData"
              />
              <n-text depth="2" v-if="statistics.value?.logDate || statistics.logDate">
                数据统计于 {{ formatDate(statistics.value?.logDate || statistics.logDate) }}
              </n-text>
            </n-space>
            <n-button
              type="primary"
              @click="refreshData"
              :loading="loading"
            >
              刷新数据
            </n-button>
          </n-space>
        </n-card>

        <n-grid :x-gap="24" :y-gap="24" :cols="24">
          <!-- 统计卡片 -->
          <n-grid-item :span="8">
            <n-card class="stat-card">
              <n-statistic label="总请求量">
                <template #prefix>
                  <n-icon :component="SpeedometerOutline" />
                </template>
                <template #default>
                  <span>{{ formatNumber(statistics.totalRequests) }}</span>
                </template>
              </n-statistic>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card class="stat-card">
              <n-statistic label="独立IP数">
                <template #prefix>
                  <n-icon :component="PeopleOutline" />
                </template>
                <template #default>
                  <span>{{ formatNumber(statistics.uniqueIps) }}</span>
                </template>
                <template #suffix>
                  <n-tooltip trigger="hover">
                    <template #trigger>
                      <n-button text style="font-size: 16px">
                        <n-icon><help-circle-outline /></n-icon>
                      </n-button>
                    </template>
                    不同的IP地址访问次数统计，可以反映网站的实际访问用户规模。
                    点击查看详细的IP访问列表。
                  </n-tooltip>
                </template>
              </n-statistic>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card 
              class="stat-card warning" 
              hoverable 
              @click="showSuspiciousRequests = true"
            >
              <n-statistic label="可疑请求">
                <template #prefix>
                  <n-icon :component="WarningOutline" />
                </template>
                <template #default>
                  <span>{{ formatNumber(statistics.suspiciousRequests) }}</span>
                </template>
                <template #suffix>
                  <n-tag v-if="statistics.suspiciousRequests > 0" type="warning" size="small" style="margin-left: 12px">
                    点击查看
                  </n-tag>
                </template>
              </n-statistic>
            </n-card>
          </n-grid-item>

          <!-- 图表区域 -->
          <n-grid-item :span="16">
            <n-card title="24小时请求趋势" class="chart-card">
              <trend-chart :data="statistics.details?.trends || []" />
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card title="请求状态分布" class="chart-card">
              <div class="chart-wrapper">
                <status-chart 
                  :data="statistics.details?.statusCodeDist || {}"
                  @update:legend="statusLegend = $event"
                />
                <div class="chart-legend">
                  <n-space :size="[8, 4]" justify="center">
                    <n-tooltip
                      v-for="item in statusLegend"
                      :key="item.name"
                      trigger="hover"
                      placement="top"
                    >
                      <template #trigger>
                        <div class="legend-item">
                          <div class="color-block" :style="{ backgroundColor: item.color }"></div>
                          <span class="percent">{{ item.percent }}%</span>
                        </div>
                      </template>
                      {{ item.name }}
                    </n-tooltip>
                  </n-space>
                </div>
              </div>
            </n-card>
          </n-grid-item>

          <!-- TOP 数据区域 -->
          <n-grid-item :span="8">
            <n-card title="访问IP TOP10" class="stat-list-card">
              <n-scrollbar style="max-height: 400px">
                <n-list hoverable clickable>
                  <n-list-item v-for="(item, index) in statistics.details?.topIps" :key="index">
                    <n-thing>
                      <template #header>
                        <n-space align="center">
                          <n-tag :type="index < 3 ? 'warning' : 'default'" size="small" round>
                            {{ index + 1 }}
                          </n-tag>
                          <span class="ip-address">{{ item.item }}</span>
                        </n-space>
                      </template>
                      <template #description>
                        <n-space justify="space-between" align="center">
                          <span>访问次数：{{ formatNumber(item.count) }}</span>
                        </n-space>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-scrollbar>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card title="访问路径 TOP10" class="stat-list-card">
              <n-scrollbar style="max-height: 400px">
                <n-list hoverable clickable>
                  <n-list-item v-for="(item, index) in statistics.details?.topPaths" :key="index">
                    <n-thing>
                      <template #header>
                        <n-space align="center">
                          <n-tag :type="index < 3 ? 'warning' : 'default'" size="small" round>
                            {{ index + 1 }}
                          </n-tag>
                          <span class="path text-ellipsis">{{ item.item }}</span>
                        </n-space>
                      </template>
                      <template #description>
                        <n-space justify="space-between" align="center">
                          <span>访问次数：{{ formatNumber(item.count) }}</span>
                        </n-space>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-scrollbar>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card title="User Agent TOP10" class="stat-list-card">
              <n-scrollbar style="max-height: 400px">
                <n-list hoverable clickable>
                  <n-list-item v-for="(item, index) in statistics.details?.topUserAgents" :key="index">
                    <n-thing>
                      <template #header>
                        <n-space align="center">
                          <n-tag :type="index < 3 ? 'warning' : 'default'" size="small" round>
                            {{ index + 1 }}
                          </n-tag>
                          <span class="user-agent text-ellipsis">{{ item.item }}</span>
                        </n-space>
                      </template>
                      <template #description>
                        <n-space justify="space-between" align="center">
                          <span>使用次数：{{ formatNumber(item.count) }}</span>
                        </n-space>
                      </template>
                    </n-thing>
                  </n-list-item>
                </n-list>
              </n-scrollbar>
            </n-card>
          </n-grid-item>
        </n-grid>
      </div>
    </n-scrollbar>

    <suspicious-requests-dialog
      v-model:show="showSuspiciousRequests"
      :requests="statistics.details?.suspiciousRequests"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { 
  NCard, 
  NGrid, 
  NGridItem, 
  NStatistic, 
  NIcon,
  NSpace,
  NButton,
  NDataTable,
  NNumberAnimation,
  NTooltip,
  NTag,
  NModal,
  NList,
  NListItem,
  NThing,
  NScrollbar,
  NSelect,
  NDatePicker
} from 'naive-ui'
import { 
  AnalyticsOutline, 
  PeopleOutline, 
  WarningOutline,
  RefreshOutline,
  HelpCircleOutline,
  SpeedometerOutline
} from '@vicons/ionicons5'
import * as echarts from 'echarts'
import { useAnalysisStore } from '@/stores/analysis'
import SuspiciousRequestsDialog from './SuspiciousRequestsDialog.vue'
import { useRoute } from 'vue-router'
import TrendChart from './components/TrendChart.vue'
import StatusChart from './components/StatusChart.vue'

const statistics = ref({
  totalRequests: 0,
  uniqueIps: 0,
  suspiciousRequests: 0,
  fileName: '',
  details: {
    trends: [],
    statusCodeDist: {},
    suspiciousRequests: [],
    topIps: [],
    topPaths: [],
    topUserAgents: []
  }
})

const showSuspiciousModal = ref(false)
const showSuspiciousRequests = ref(false)
const loading = ref(false)
const store = useAnalysisStore()

const topIps = ref([])
const requestTrendChart = ref(null)
const statusCodeChart = ref(null)
const trendChartInstance = ref(null)
const statusChartInstance = ref(null)

const ipColumns = [
  {
    title: 'IP地址',
    key: 'ip'
  },
  {
    title: '请求次数',
    key: 'count'
  },
  {
    title: '最后访问时间',
    key: 'lastAccess'
  },
  {
    title: '状态',
    key: 'status',
    render(row) {
      return h(
        NTag,
        {
          type: row.isSuspicious ? 'error' : 'success',
          round: true,
          size: 'small'
        },
        { default: () => row.isSuspicious ? '可疑' : '正常' }
      )
    }
  }
]

// 添加状态码图例数据
const statusLegend = ref([])

const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return new Intl.NumberFormat('zh-CN', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    useGrouping: true
  }).format(num);
};

const route = useRoute()
const selectedServer = ref(null)
const selectedDate = ref(null)
const serverOptions = ref([])

// 获取服务器列表
async function fetchServerList() {
  try {
    const data = await store.getServerList()
    serverOptions.value = data.map(ip => ({
      label: ip,
      value: ip
    }))

    // 如果URL中有服务器参数，设置选中的服务器
    if (route.query.serverIp) {
      selectedServer.value = route.query.serverIp
    } 
    // 否则选中第一个服务器
    else if (serverOptions.value.length > 0) {
      selectedServer.value = serverOptions.value[0].value
    }
  } catch (error) {
    console.error('Failed to fetch server list:', error)
  }
}

// 刷新数据
async function refreshData() {
  if (!mounted.value) return;
  
  loading.value = true;
  try {
    const params = {
      serverIp: selectedServer.value
    };
    const data = await store.getStatistics(params);
    
    if (mounted.value && data) {
      statistics.value = {
        ...data,
        logDate: data.logDate  // 确保 logDate 被正确设置
      };
    }
  } catch (error) {
    console.error('Failed to refresh data:', error);
  } finally {
    if (mounted.value) {
      loading.value = false;
    }
  }
}

// 添加挂载状态跟踪
const mounted = ref(false)

onMounted(() => {
  mounted.value = true
  fetchServerList()
    .then(() => {
      if (route.query.serverIp) {
        selectedServer.value = route.query.serverIp
      }
      return refreshData()
    })
    .catch(error => {
      console.error('Error in onMounted:', error)
    })
})

onUnmounted(() => {
  mounted.value = false
})

function handleResize() {
  if (trendChartInstance.value) {
    trendChartInstance.value.resize()
  }
  if (statusChartInstance.value) {
    statusChartInstance.value.resize()
  }
}

// 辅助函数：获取类别名称
function getCategoryName(category) {
  const categoryNames = {
    success: '成功响应',
    redirect: '重定向',
    client_error: '客户端错误',
    server_error: '服务器错误',
    cached: '缓存响应',
    other: '其他'
  }
  return categoryNames[category] || category
}

// 辅助函数：获取类别颜色
function getCategoryColor(category) {
  const categoryColors = {
    success: '#18a058',
    redirect: '#2080f0',
    client_error: '#f0a020',
    server_error: '#d03050',
    cached: '#8f8f8f',
    other: '#909399'
  }
  return categoryColors[category] || '#909399'
}

// 添加日期格式化函数
function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';  // 检查日期是否有效
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}
</script>

<style scoped>
.dashboard-container {
  height: calc(100vh - 64px); /* 减去导航栏高度 */
  display: flex;
  flex-direction: column;
}

.dashboard-scrollbar {
  flex: 1;
}

.dashboard-content {
  padding: 24px;
  min-height: 100%;
}

.filter-card {
  margin-bottom: 24px;
  background-color: #fff;
  transition: all 0.3s;
  box-shadow: var(--card-shadow) !important;
}

/* 暗色模式样式 */
[theme-name="dark"] .filter-card {
  border-color: var(--dark-border-color);
  background-color: var(--n-card-color);
}

/* 确保所有卡片样式一致 */
:deep(.n-card) {
  background-color: #fff;
  transition: all 0.3s;
  box-shadow: var(--card-shadow) !important;
}

[theme-name="dark"] :deep(.n-card) {
  border-color: var(--dark-border-color);
  background-color: var(--n-card-color);
}

.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.chart-card {
  height: 400px;
}

.chart-container {
  height: 100%;
  min-height: 300px;
}

.stat-list-card {
  height: 480px;
  display: flex;
  flex-direction: column;
}

.text-ellipsis {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ip-address {
  font-family: monospace;
  font-size: 14px;
}

.path {
  font-family: monospace;
  font-size: 13px;
  color: #666;
}

.user-agent {
  font-size: 12px;
  color: #666;
}

:deep(.n-thing-main__description) {
  margin-top: 4px;
}

:deep(.n-list-item:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.n-card-header) {
  font-weight: bold;
}

:deep(.n-tag) {
  min-width: 20px;
  padding: 0 6px;
  justify-content: center;
}

:deep(.n-list-item) {
  padding: 8px 12px;
}

:deep(.n-scrollbar-rail) {
  z-index: 10;
}

/* 添加日期文本样式 */
:deep(.n-text) {
  font-size: 14px;
}

/* 添加数字样式 */
.n-statistic-value {
  font-size: 24px;
  font-weight: 500;
}

.chart-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-legend {
  padding: 4px 16px;
  display: flex;
  justify-content: center;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: help;
}

.color-block {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.percent {
  font-size: 13px;
  color: #666;
}

[theme-name="dark"] .percent {
  color: #999;
}
</style> 