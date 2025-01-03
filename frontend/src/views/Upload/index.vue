<template>
  <div class="upload-container">
    <n-card title="上传日志文件" class="upload-card">
      <template #header-extra>
        <n-text depth="3">支持的格式: IIS、Nginx、Apache</n-text>
      </template>

      <div class="upload-content" v-if="mounted">
        <n-upload
          ref="uploadRef"
          :custom-request="handleUpload"
          :default-upload="false"
          accept=".log,.txt"
          @change="handleChange"
        >
          <n-upload-dragger v-if="!selectedFile">
            <div class="upload-dragger-content">
              <n-icon size="48" :depth="3" class="upload-icon">
                <cloud-upload-outline />
              </n-icon>
              <n-text class="upload-text">
                点击或拖动日志文件到此区域
              </n-text>
              <n-text depth="3" class="upload-hint">
                支持 .log 和 .txt 格式的日志文件
              </n-text>
            </div>
          </n-upload-dragger>
        </n-upload>

        <div class="upload-options" v-if="selectedFile">
          <n-card size="small" class="file-info-card">
            <n-space vertical>
              <n-space align="center" justify="space-between">
                <n-text>已选择文件：{{ selectedFile.name }}</n-text>
                <n-button text type="error" @click="clearFile">
                  <template #icon>
                    <n-icon><close-outline /></n-icon>
                  </template>
                  移除
                </n-button>
              </n-space>

              <n-divider />
              
              <n-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                label-placement="left"
                label-width="100"
                require-mark-placement="right-hanging"
              >
                <n-form-item label="服务器IP" path="serverIp" required>
                  <n-input
                    v-model:value="formData.serverIp"
                    placeholder="请输入服务器IP地址"
                    clearable
                  />
                </n-form-item>

                <n-form-item label="日志日期" path="logDate" required>
                  <n-date-picker
                    v-model:value="formData.logDate"
                    type="date"
                    clearable
                    style="width: 100%"
                  />
                </n-form-item>

                <n-form-item label="时区" path="isGMTTime">
                  <n-checkbox v-model:checked="formData.isGMTTime">
                    日志时间为GMT时间（自动转换为北京时间）
                  </n-checkbox>
                </n-form-item>
              </n-form>

              <n-space justify="end">
                <n-button
                  type="primary"
                  :loading="loading"
                  :disabled="!formData.serverIp || !formData.logDate"
                  @click="startUpload"
                >
                  开始分析
                </n-button>
              </n-space>
            </n-space>
          </n-card>
        </div>
      </div>

      <n-collapse-transition :show="uploadStatus.show">
        <n-alert
          class="status-alert"
          :type="uploadStatus.type"
          :title="uploadStatus.title"
        >
          {{ uploadStatus.message }}
        </n-alert>
      </n-collapse-transition>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import {
  NUpload,
  NUploadDragger,
  NCard,
  NSpace,
  NButton,
  NIcon,
  NText,
  NForm,
  NFormItem,
  NInput,
  NDatePicker,
  NCheckbox,
  NDivider,
  NAlert,
  NCollapseTransition
} from 'naive-ui'
import {
  CloudUploadOutline,
  CloseOutline
} from '@vicons/ionicons5'
import { useAnalysisStore } from '@/stores/analysis'

const router = useRouter()
const message = useMessage()
const store = useAnalysisStore()

const uploadRef = ref(null)
const formRef = ref(null)
const selectedFile = ref(null)
const loading = ref(false)
const mounted = ref(false)

const formData = ref({
  serverIp: '',
  logDate: null,
  isGMTTime: false
})

const rules = {
  serverIp: [
    { required: true, message: '请输入服务器IP地址' },
    { pattern: /^(\d{1,3}\.){3}\d{1,3}$/, message: '请输入有效的IP地址' }
  ],
  logDate: [
    { required: true, message: '请选择日志日期' }
  ]
}

const uploadStatus = ref({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

onMounted(() => {
  mounted.value = true
})

async function startUpload() {
  try {
    await formRef.value?.validate()
    
    loading.value = true
    const formDataToSend = new FormData()
    formDataToSend.append('logFile', selectedFile.value.file)
    formDataToSend.append('serverIp', formData.value.serverIp)
    formDataToSend.append('logDate', formData.value.logDate)
    formDataToSend.append('isGMTTime', String(formData.value.isGMTTime))

    const response = await store.uploadAndAnalyze(formDataToSend)
    
    uploadStatus.value = {
      show: true,
      type: 'success',
      title: '分析完成',
      message: '日志分析已完成，即将跳转到仪表盘...'
    }

    await nextTick()
    
    setTimeout(async () => {
      try {
        await router.push({
          path: '/',
          query: {
            serverIp: formData.value.serverIp,
            logDate: formData.value.logDate
          }
        })
      } catch (error) {
        console.error('Navigation error:', error)
      }
    }, 1500)

  } catch (error) {
    if (error?.type !== 'validate') {
      message.error(error.message || '上传失败')
    }
  } finally {
    loading.value = false
  }
}

function handleChange(options) {
  const { file } = options
  selectedFile.value = file
}

function clearFile() {
  selectedFile.value = null
  uploadRef.value?.clear()
}

function handleUpload({ file }) {
  selectedFile.value = {
    file,
    name: file.name
  }
}

// 确保组件挂载后再显示上传组件，避免 SSR 问题
setTimeout(() => {
  mounted.value = true
}, 0)
</script>

<style scoped>
.upload-container {
  padding: 24px;
  height: 100%;
}

.upload-card {
  max-width: 800px;
  margin: 0 auto;
}

.upload-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.upload-dragger-content {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-text {
  margin-top: 16px;
  font-size: 16px;
}

.upload-hint {
  font-size: 14px;
}

.file-info-card {
  background-color: #fafafa;
}
</style> 