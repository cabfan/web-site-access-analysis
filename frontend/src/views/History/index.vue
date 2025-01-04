<template>
  <div class="page-container">
    <n-card title="分析历史" class="history-card">
      <template #header-extra>
        <n-space>
          <n-input-group>
            <n-input
              v-model:value="searchText"
              placeholder="搜索文件名..."
              clearable
            >
              <template #prefix>
                <n-icon :component="SearchOutline" />
              </template>
            </n-input>
            <n-button type="primary" ghost>
              搜索
            </n-button>
          </n-input-group>
          <n-button-group>
            <n-button quaternary circle title="刷新">
              <template #icon>
                <n-icon><refresh-outline /></n-icon>
              </template>
            </n-button>
            <n-button quaternary circle title="导出">
              <template #icon>
                <n-icon><download-outline /></n-icon>
              </template>
            </n-button>
          </n-button-group>
        </n-space>
      </template>

      <n-data-table
        :columns="columns"
        :data="filteredHistory"
        :loading="loading"
        :pagination="pagination"
        :row-class-name="rowClassName"
      />
    </n-card>

    <!-- 详情抽屉 -->
    <n-drawer v-model:show="showDetail" :width="500">
      <n-drawer-content :title="selectedRecord?.file_name || '详细信息'">
        <template #header-extra>
          <n-space>
            <n-button quaternary circle @click="exportDetail">
              <template #icon>
                <n-icon><download-outline /></n-icon>
              </template>
            </n-button>
          </n-space>
        </template>

        <n-descriptions :column="1" bordered>
          <n-descriptions-item label="服务器IP">
            {{ selectedRecord?.server_ip }}
          </n-descriptions-item>
          <n-descriptions-item label="日志日期">
            {{ formatDate(selectedRecord?.log_date, 'YYYY-MM-DD') }}
          </n-descriptions-item>
          <n-descriptions-item label="分析时间">
            {{ formatDate(selectedRecord?.analysis_date) }}
          </n-descriptions-item>
          <n-descriptions-item label="总请求量">
            {{ selectedRecord?.total_requests }}
          </n-descriptions-item>
          <n-descriptions-item label="独立IP数">
            {{ selectedRecord?.unique_ips }}
          </n-descriptions-item>
          <n-descriptions-item label="可疑请求数">
            <n-tag :type="selectedRecord?.suspicious_requests > 0 ? 'error' : 'success'">
              {{ selectedRecord?.suspicious_requests }}
            </n-tag>
          </n-descriptions-item>
        </n-descriptions>

        <template v-if="selectedRecord?.analysis_data">
          <n-divider>详细分析</n-divider>
          <n-collapse>
            <n-collapse-item title="Top IP" name="1">
              <n-list>
                <n-list-item v-for="ip in getTopItems(selectedRecord.analysis_data.topIps)" :key="ip.item">
                  {{ ip.item }} ({{ ip.count }}次)
                </n-list-item>
              </n-list>
            </n-collapse-item>
            <n-collapse-item title="可疑请求" name="2">
              <n-list>
                <n-list-item v-for="(req, index) in selectedRecord.analysis_data.suspiciousRequests" :key="index">
                  <n-tag :type="req.type === 'high_frequency' ? 'warning' : 'error'" style="margin-right: 8px">
                    {{ req.type }}
                  </n-tag>
                  {{ req.ip }} - {{ req.details }}
                </n-list-item>
              </n-list>
            </n-collapse-item>
          </n-collapse>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { 
  NCard, 
  NDataTable, 
  NTag, 
  NButton, 
  NSpace, 
  NInput,
  NInputGroup,
  NIcon,
  NButtonGroup,
  NDrawer,
  NDrawerContent,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NCollapse,
  NCollapseItem,
  NList,
  NListItem,
  useDialog,
  useMessage
} from 'naive-ui'
import { 
  SearchOutline, 
  RefreshOutline, 
  DownloadOutline,
  EyeOutline,
  TrashOutline
} from '@vicons/ionicons5'
import { useAnalysisStore } from '@/stores/analysis'

const store = useAnalysisStore()
const dialog = useDialog()
const message = useMessage()
const loading = ref(false)
const analysisHistory = ref([])
const searchText = ref('')
const showDetail = ref(false)
const selectedRecord = ref(null)

const pagination = {
  pageSize: 10
}

const filteredHistory = computed(() => {
  if (!searchText.value) return analysisHistory.value
  const search = searchText.value.toLowerCase()
  return analysisHistory.value.filter(item => 
    item.file_name.toLowerCase().includes(search)
  )
})

const columns = [
  {
    title: '文件名',
    key: 'file_name',
    width: 200
  },
  {
    title: '服务器IP',
    key: 'server_ip',
    width: 150
  },
  {
    title: '日志日期',
    key: 'log_date',
    width: 180,
    render(row) {
      return formatDate(row.log_date)
    }
  },
  {
    title: '分析时间',
    key: 'analysis_date',
    render(row) {
      return formatDate(row.analysis_date)
    }
  },
  {
    title: '总请求量',
    key: 'total_requests',
    width: 100
  },
  {
    title: '独立IP数',
    key: 'unique_ips',
    width: 100
  },
  {
    title: '可疑请求数',
    key: 'suspicious_requests',
    width: 100,
    render(row) {
      return h(
        NTag,
        {
          type: row.suspicious_requests > 0 ? 'error' : 'success',
          round: true
        },
        { default: () => row.suspicious_requests }
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render(row) {
      return h(NSpace, {}, {
        default: () => [
          h(NButton, {
            quaternary: true,
            circle: true,
            type: 'primary',
            onClick: () => viewDetails(row),
            title: '查看详情'
          }, {
            icon: () => h(NIcon, { component: EyeOutline })
          }),
          h(NButton, {
            quaternary: true,
            circle: true,
            type: 'error',
            onClick: () => deleteRecord(row),
            title: '删除记录'
          }, {
            icon: () => h(NIcon, { component: TrashOutline })
          })
        ]
      })
    }
  }
]

onMounted(async () => {
  loading.value = true
  try {
    const data = await store.getAnalysisHistory()
    analysisHistory.value = data
  } catch (error) {
    console.error('Failed to load analysis history:', error)
  } finally {
    loading.value = false
  }
})

function viewDetails(row) {
  selectedRecord.value = row
  showDetail.value = true
}

function deleteRecord(row) {
  dialog.warning({
    title: '确认删除',
    content: '确定要删除这条分析记录吗？此操作不可恢复。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await store.deleteAnalysis(row.id);
        message.success('删除成功');
        // 刷新列表
        const data = await store.getAnalysisHistory();
        analysisHistory.value = data;
      } catch (error) {
        message.error('删除失败：' + (error.message || '未知错误'));
      }
    }
  });
}

function exportDetail() {
  // 实现导出逻辑
}

function formatDate(date) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
}

function getTopItems(items = []) {
  return items.slice(0, 5)
}

function rowClassName(row) {
  if (row.suspicious_requests > 0) {
    return 'suspicious-row'
  }
  return ''
}
</script>

<style scoped>
.history-card {
  min-height: calc(100vh - 140px);
}

:deep(.suspicious-row) {
  background-color: rgba(208, 48, 80, 0.05);
}

:deep(.n-drawer-content) {
  padding: 24px;
}

:deep(.n-descriptions) {
  margin-top: 16px;
}

:deep(.n-collapse) {
  margin-top: 16px;
}
</style> 