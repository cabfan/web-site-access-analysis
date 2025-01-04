<template>
  <n-modal
    :show="show"
    @update:show="emit('update:show', $event)"
    preset="card"
    style="width: 1000px"
    :bordered="false"
    size="huge"
  >
    <template #header>
      <div class="dialog-header">
        <n-space align="center" justify="space-between">
          <n-space align="center">
            <div class="header-title">AI 分析报告</div>
            <n-tag type="info" size="small">
              {{ data.serverIp }}
            </n-tag>
            <n-tag type="success" size="small">
              {{ formatDate(data.logDate) }}
            </n-tag>
          </n-space>
          <n-space>
            <n-button
              quaternary
              size="small"
              @click="showContent = false"
              :type="!showContent ? 'primary' : 'default'"
            >
              历史记录
            </n-button>
            <n-button
              quaternary
              size="small"
              @click="showContent = true"
              :type="showContent ? 'primary' : 'default'"
              v-if="content"
            >
              分析报告
            </n-button>
          </n-space>
        </n-space>
      </div>
    </template>

    <div class="analysis-content" ref="contentRef">
      <!-- 历史分析记录 -->
      <div v-show="!showContent">
        <n-data-table
          :columns="columns"
          :data="historyList"
          :bordered="false"
          :single-line="false"
          size="small"
        />
      </div>

      <!-- AI 分析内容 -->
      <div class="message ai" v-show="showContent">
        <div class="avatar">AI</div>
        <div class="content markdown-body" v-html="parsedContent"></div>
      </div>

      <!-- 分析中提示 -->
      <div class="analyzing-tip" v-if="analyzing">
        <n-spin size="small" />
        <span>正在分析中...</span>
      </div>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button
          type="primary"
          @click="startNewAnalysis"
          :loading="loading"
          v-if="!analyzing"
        >
          新建分析
        </n-button>
        <n-button @click="handleClose">关闭</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch, nextTick, computed, h } from 'vue'
import { marked } from 'marked'
import { 
  NModal,
  NSpace,
  NButton,
  NIcon,
  NText,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NDataTable,
  NSpin
} from 'naive-ui'
import { StopCircleOutline } from '@vicons/ionicons5'
import { useStorage } from '@vueuse/core'
import axios from 'axios'

const props = defineProps({
  show: Boolean,
  data: {
    type: Object,
    required: true,
    validator(value) {
      const required = ['serverIp', 'logDate', 'details']
      const missing = required.filter(field => !value[field])
      if (missing.length > 0) {
        console.warn('Missing required fields in data prop:', missing)
        return false
      }
      return true
    }
  }
})

const emit = defineEmits(['update:show'])

const analyzing = ref(false)
const content = ref('')
const contentRef = ref(null)
const controller = ref(null)

// 获取 AI 设置
const aiSettings = useStorage('ai-settings', {
  baseUrl: '',
  apiKey: '',
  modelName: '',
  systemPrompt: ''
})

const historyList = ref([])
const loading = ref(false)

// 添加内容显示控制
const showContent = ref(false)

// 获取历史分析
async function fetchHistory() {
  try {
    const response = await axios.get('/api/ai-analyses', {
      params: {
        serverIp: props.data.serverIp,
        logDate: formatDateForAPI(props.data.logDate)
      }
    })
    historyList.value = response.data
  } catch (error) {
    console.error('Failed to fetch history:', error)
  }
}

// 格式化日期为 YYYY-MM-DD
function formatDateForAPI(date) {
  if (!date) return null
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 保存分析结果
async function saveAnalysis() {
  try {
    const analysisData = {
      serverIp: props.data.serverIp,
      logDate: formatDateForAPI(props.data.logDate),
      content: content.value
    }
    
    if (!analysisData.serverIp || !analysisData.logDate || !analysisData.content) {
      const missingFields = []
      if (!analysisData.serverIp) missingFields.push('服务器IP')
      if (!analysisData.logDate) missingFields.push('日志日期')
      if (!analysisData.content) missingFields.push('分析内容')
      
      throw new Error(`缺少必要的分析数据: ${missingFields.join(', ')}`)
    }
    
    const response = await axios.post('/api/ai-analyses', analysisData)

    await fetchHistory()
  } catch (error) {
    console.error('Failed to save analysis:', error.response?.data || error)
  }
}

// 删除分析记录
async function deleteAnalysis(id) {
  try {
    await axios.delete(`/api/ai-analyses/${id}`)
    await fetchHistory()
  } catch (error) {
    console.error('Failed to delete analysis:', error)
  }
}

// 修改显示历史分析
function showAnalysis(item) {
  content.value = item.content
  showContent.value = true
}

// 开始新分析
async function startNewAnalysis() {
  content.value = ''
  await startAnalysis()
}

// 获取预览内容
function getPreview(content) {
  const maxLength = 100
  const text = content.replace(/#/g, '').trim()
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}

// 格式化日期时间
function formatDateTime(date) {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch (error) {
    console.error('Error formatting datetime:', error)
    return ''
  }
}

// 监听对话框显示
watch(() => props.show, async (newVal) => {
  if (newVal) {
    content.value = ''
    await fetchHistory()
  }
})

// 监听分析完成
watch(() => analyzing.value, async (newVal, oldVal) => {
  if (oldVal && !newVal && content.value) {
    await saveAnalysis()
  }
})

async function startAnalysis() {
  analyzing.value = true
  controller.value = new AbortController()
  
  try {
    const response = await fetch(`${aiSettings.value.baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiSettings.value.apiKey}`
      },
      body: JSON.stringify({
        model: aiSettings.value.modelName,
        messages: [
          {
            role: 'system',
            content: aiSettings.value.systemPrompt
          },
          {
            role: 'user',
            content: generatePrompt()
          }
        ],
        stream: true
      }),
      signal: controller.value.signal
    })

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          
          try {
            const parsed = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content || ''
            if (content) {
              appendContent(content)
            }
          } catch (e) {
            console.error('Failed to parse chunk:', e)
          }
        }
      }
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      appendContent('\n\n[分析已终止]')
    } else {
      appendContent('\n\n[分析出错: ' + error.message + ']')
    }
  } finally {
    analyzing.value = false
    controller.value = null
  }
}

function generatePrompt() {
  const { serverIp, logDate, totalRequests, uniqueIps, suspiciousRequests, details } = props.data
  
  // 确保数组数据的可用性
  const topPaths = Array.isArray(details.topPaths) ? details.topPaths : []
  const topUserAgents = Array.isArray(details.topUserAgents) ? details.topUserAgents : []
  const suspiciousReqs = Array.isArray(details.suspiciousRequests) ? details.suspiciousRequests : []
  const trends = Array.isArray(details.trends) ? details.trends : []
  
  return `请作为一个专业的网站访问日志分析专家，分析以下数据并重点关注访问模式和客户端特征。
注意：该网站的正常工作时间为 09:00-12:00 和 14:00-18:00，这些时间段的访问量通常较高是正常现象。

基本信息：
- 服务器: ${serverIp}
- 日期: ${formatDate(logDate)}
- 总请求量: ${totalRequests || 0}
- 可疑请求数: ${suspiciousRequests || 0}

24小时请求趋势：
${trends.map(t => `${t.hour}时: ${t.count}次`).join('\n')}

访问路径 TOP10（按访问量排序）：
${topPaths.map(path => `- ${path.item} (${path.count}次)`).join('\n') || '无数据'}

User Agent TOP10（按使用频率排序）：
${topUserAgents.map(ua => `- ${ua.item} (${ua.count}次)`).join('\n') || '无数据'}

HTTP状态码分布：
${JSON.stringify(details.statusCodeDist || {}, null, 2)}

可疑请求记录：
${suspiciousReqs.map(req => `- ${req.type}: ${req.ip} - ${req.details}`).join('\n') || '无可疑请求'}

请重点分析以下几个方面：
1. 24小时访问趋势分析
   - 工作时间（9:00-12:00, 14:00-18:00）的访问量是否符合预期
   - 非工作时间是否存在异常的访问高峰
   - 访问模式是否符合正常的工作日规律

2. 访问路径分析
   - 高频访问路径的合理性
   - 是否存在对敏感路径的探测
   - 访问路径的分布是否均衡

3. User Agent详细分析
   - 浏览器类型及版本分布（Chrome、Firefox、Safari等）
   - 移动端vs桌面端的访问比例
   - 操作系统分布情况
   - 爬虫请求的特征和合法性
   - 是否存在可疑的或伪造的User Agent

4. 安全建议
   - 针对非工作时间异常访问的防护建议
   - 资源访问优化建议
   - 基于User Agent的访问控制建议
   - 安全加固建议

请用markdown格式输出分析报告，重点突出异常情况和具体的改进建议。对于浏览器使用情况，请尽可能提供百分比分布。`
}

function appendContent(text) {
  content.value += text
  nextTick(() => {
    if (contentRef.value) {
      contentRef.value.scrollTop = contentRef.value.scrollHeight
    }
  })
}

function handleStop() {
  if (controller.value) {
    controller.value.abort()
  }
}

function handleClose() {
  emit('update:show', false)
}

function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function formatNumber(num) {
  return new Intl.NumberFormat('zh-CN').format(num)
}

// 添加 markdown 解析
const parsedContent = computed(() => {
  if (!content.value) return '正在分析...'
  return marked(content.value, {
    gfm: true,
    breaks: true
  })
})

// 修改表格列定义
const columns = [
  {
    title: '序号',
    key: 'index',
    width: 60,
    render: (row, index) => index + 1
  },
  {
    title: '分析时间',
    key: 'analysis_date',
    width: 160,
    render: (row) => formatDateTime(row.analysis_date)
  },
  {
    title: '分析内容预览',
    key: 'content',
    ellipsis: {
      tooltip: true
    },
    render: (row) => {
      const text = row.content.replace(/#/g, '').trim()
      return h('div', { class: 'analysis-preview' }, text)
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 140,
    render: (row) => {
      return h(NSpace, { justify: 'end' }, {
        default: () => [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              onClick: () => showAnalysis(row)
            },
            { default: () => '查看' }
          ),
          h(
            NButton,
            {
              text: true,
              type: 'error',
              onClick: () => deleteAnalysis(row.id)
            },
            { default: () => '删除' }
          )
        ]
      })
    }
  }
]

// 监听分析开始
watch(() => analyzing.value, (newVal) => {
  if (newVal) {
    showContent.value = true
  }
})
</script>

<style scoped>
.analysis-content {
  height: 600px;
  overflow-y: auto;
  padding: 16px;
  position: relative;
}

.message-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.message {
  display: flex;
  gap: 12px;
}

.message.system {
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.message.ai {
  margin-top: 0;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #18a058;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  line-height: 1.6;
}

.dialog-header {
  padding: 4px 0;
}

.header-title {
  font-size: 16px;
  font-weight: 500;
  margin-right: 8px;
}

/* Markdown 样式 */
.markdown-body {
  font-size: 14px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 500;
}

.markdown-body :deep(h1) { font-size: 1.5em; }
.markdown-body :deep(h2) { font-size: 1.3em; }
.markdown-body :deep(h3) { font-size: 1.2em; }
.markdown-body :deep(h4) { font-size: 1.1em; }

.markdown-body :deep(p) {
  margin: 0.8em 0;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
}

.markdown-body :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-body :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-body :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #ddd;
  color: #666;
}

[theme-name="dark"] .message.system {
  background-color: rgba(255, 255, 255, 0.05);
}

[theme-name="dark"] .markdown-body :deep(code) {
  background-color: rgba(255, 255, 255, 0.1);
}

[theme-name="dark"] .markdown-body :deep(pre) {
  background-color: rgba(255, 255, 255, 0.1);
}

[theme-name="dark"] .markdown-body :deep(blockquote) {
  border-left-color: #444;
  color: #999;
}

.history-section {
  padding: 0 16px;
}

.analysis-preview {
  font-size: 13px;
  line-height: 1.5;
  padding: 4px 0;
}

[theme-name="dark"] .summary-text {
  color: #999;
}

.summary-text {
  font-size: 14px;
  color: #666;
}

[theme-name="dark"] .summary-text {
  color: #999;
}

/* 移除不需要的样式 */
.message.system {
  display: none;
}

.analyzing-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #666;
}

[theme-name="dark"] .analyzing-tip {
  color: #999;
}
</style> 