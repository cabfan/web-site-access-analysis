<template>
  <div class="dashboard-container">
    <n-scrollbar class="dashboard-scrollbar">
      <div class="dashboard-content">
        <n-card class="filter-card" :bordered="false">
          <n-space align="center">
            <n-select
              v-model:value="selectedServer"
              :options="serverOptions"
              placeholder="选择服务器"
              clearable
              style="width: 200px"
            />
            <n-date-picker
              v-model:value="selectedDate"
              type="date"
              clearable
              style="width: 150px"
              placeholder="选择日期"
            />
            <n-button
              type="primary"
              ghost
              @click="refreshData"
              :loading="loading"
            >
              <template #icon>
                <n-icon><refresh-outline /></n-icon>
              </template>
              刷新
            </n-button>
          </n-space>
        </n-card>

        <n-grid :x-gap="24" :y-gap="24" :cols="24">
          <!-- 统计卡片 -->
          <n-grid-item :span="8">
            <n-card class="stat-card">
              <n-statistic label="总请求量">
                <template #prefix>
                  <n-icon :component="AnalyticsOutline" />
                </template>
                <n-number-animation
                  ref="totalRequestsRef"
                  :from="0"
                  :to="statistics.totalRequests"
                  :duration="1000"
                  :formatter="numberAnimationFormatter"
                />
                <template #suffix>
                  <n-space vertical size="small" style="margin-left: 12px">
                    <n-text v-if="selectedServer" depth="3" style="font-size: 12px">
                      服务器: {{ selectedServer }}
                    </n-text>
                    <n-text v-if="selectedDate" depth="3" style="font-size: 12px">
                      日期: {{ selectedDate }}
                    </n-text>
                  </n-space>
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
                <n-number-animation
                  ref="uniqueIpsRef"
                  :from="0"
                  :to="statistics.uniqueIps"
                  :duration="1000"
                  :formatter="numberAnimationFormatter"
                />
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
                <n-number-animation
                  ref="suspiciousRequestsRef"
                  :from="0"
                  :to="statistics.suspiciousRequests"
                  :duration="1000"
                  :formatter="numberAnimationFormatter"
                />
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
              <div ref="requestTrendChart" class="chart-container"></div>
            </n-card>
          </n-grid-item>

          <n-grid-item :span="8">
            <n-card title="请求状态分布" class="chart-card">
              <div class="chart-wrapper">
                <div ref="statusCodeChart" class="chart-container"></div>
                <div class="chart-legend">
                  <n-space wrap :size="[12, 8]">
                    <n-tag
                      v-for="item in statusLegend"
                      :key="item.name"
                      :color="{ color: item.color + '20', borderColor: item.color }"
                      :text-color="item.color"
                      size="small"
                    >
                      {{ item.name }} ({{ item.percent }}%)
                    </n-tag>
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
import { ref, onMounted, onUnmounted } from 'vue'
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
  HelpCircleOutline
} from '@vicons/ionicons5'
import * as echarts from 'echarts'
import { useAnalysisStore } from '@/stores/analysis'
import SuspiciousRequestsDialog from './SuspiciousRequestsDialog.vue'
import { useRoute } from 'vue-router'

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
let trendChartInstance = null
let statusChartInstance = null

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
  if (num >= 1000) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return num;
};

// 专门用于 n-number-animation 的格式化函数
const numberAnimationFormatter = value => formatNumber(Number(value));

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
  } catch (error) {
    console.error('Failed to fetch server list:', error)
  }
}

// 刷新数据
async function refreshData() {
  loading.value = true
  try {
    const params = {
      serverIp: selectedServer.value,
      logDate: selectedDate.value
    }
    const data = await store.getStatistics(params)
    statistics.value = data
    initCharts()
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchServerList()
  
  // 如果URL中有日期参数，设置选中的日期
  if (route.query.logDate) {
    selectedDate.value = route.query.logDate
  }
  
  await refreshData()
})

onUnmounted(() => {
  if (trendChartInstance) {
    trendChartInstance.dispose()
  }
  if (statusChartInstance) {
    statusChartInstance.dispose()
  }
})

function initCharts() {
  // 请求趋势图表
  if (requestTrendChart.value) {
    trendChartInstance = echarts.init(requestTrendChart.value)
    const trendData = statistics.value.details.trends || []
    console.log('Trend Data:', trendData)
    
    const option = {
      grid: {
        top: 40,
        right: 20,
        bottom: 40,
        left: 60
      },
      tooltip: {
        trigger: 'axis',
        formatter: function(params) {
          const data = params[0];
          return `${data.name}<br/>请求数：${data.value}`;
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      xAxis: {
        type: 'category',
        data: Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`),
        axisLabel: {
          interval: 2,
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        }
      },
      yAxis: {
        type: 'value',
        name: '请求数',
        nameTextStyle: {
          color: '#666'
        },
        minInterval: 1,
        axisLabel: {
          color: '#666'
        },
        axisLine: {
          lineStyle: {
            color: '#ddd'
          }
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
            color: '#eee'
          }
        }
      },
      series: [{
        name: '请求数',
        data: trendData.map(item => item.count),
        type: 'line',
        smooth: true,
        showSymbol: true,
        symbolSize: 8,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(32, 128, 240, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(32, 128, 240, 0.1)'
            }
          ])
        },
        itemStyle: {
          color: '#2080f0',
          borderWidth: 2
        },
        lineStyle: {
          width: 3,
          color: '#2080f0'
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#2080f0',
            borderColor: '#fff',
            borderWidth: 2,
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(32, 128, 240, 0.5)'
          }
        }
      }]
    }
    
    console.log('Chart Option:', option)
    trendChartInstance.setOption(option)
  }
  
  // 状态码分布图表
  if (statusCodeChart.value) {
    statusChartInstance = echarts.init(statusCodeChart.value)
    const statusDist = statistics.value.details.statusCodeDist || {}
    
    // 使用后端返回的详细状态码数据
    const statusData = statusDist.details || []

    // 按类别分组数据
    const groupedData = statusData.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = {
          name: getCategoryName(item.category),
          value: 0,
          children: [],
          itemStyle: { color: getCategoryColor(item.category) }
        }
      }
      acc[item.category].value += item.count
      acc[item.category].children.push({
        name: item.name,
        value: item.count,
        itemStyle: { color: item.color }
      })
      return acc
    }, {})

    // 更新图例数据
    statusLegend.value = Object.values(groupedData)
      .filter(item => item.value > 0)  // 过滤掉数量为0的项
      .map(item => ({
        name: item.name,
        color: item.itemStyle.color,
        percent: ((item.value / statusDist.total) * 100).toFixed(1)
      }))
      .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent));  // 按百分比降序排序

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: function(params) {
          const value = params.value
          const percent = params.percent
          return `${params.name}<br/>数量: ${value}<br/>占比: ${percent}%`
        },
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#eee',
        borderWidth: 1,
        textStyle: {
          color: '#333'
        }
      },
      series: [{
        name: '状态码分布',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 5,
          shadowColor: 'rgba(0, 0, 0, 0.1)'
        },
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 10,
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: Object.values(groupedData)
      }]
    }
    
    statusChartInstance.setOption(option)
  }

  window.addEventListener('resize', handleResize)
}

function handleResize() {
  trendChartInstance?.resize()
  statusChartInstance?.resize()
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
</style> 