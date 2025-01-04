<template>
  <div class="page-container">
    <n-card title="系统设置" class="settings-card">
      <n-tabs type="line">
        <n-tab-pane name="ai" tab="AI 配置">
          <n-form
            ref="formRef"
            :model="aiSettings"
            :rules="rules"
            label-placement="left"
            label-width="120"
            require-mark-placement="right-hanging"
          >
            <n-form-item label="API Base URL" path="baseUrl" required>
              <n-input
                v-model:value="aiSettings.baseUrl"
                placeholder="请输入 AI API 的基础 URL"
                clearable
              >
                <template #prefix>
                  <n-icon :component="LinkOutline" />
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="API Key" path="apiKey" required>
              <n-input
                v-model:value="aiSettings.apiKey"
                type="password"
                show-password-on="click"
                placeholder="请输入 API Key"
                clearable
              >
                <template #prefix>
                  <n-icon :component="KeyOutline" />
                </template>
              </n-input>
            </n-form-item>

            <n-form-item label="模型名称" path="modelName" required>
              <n-select
                v-model:value="aiSettings.modelName"
                :options="modelOptions"
                placeholder="请选择 AI 模型"
              />
            </n-form-item>

            <n-form-item label="系统提示词" path="systemPrompt">
              <n-input
                v-model:value="aiSettings.systemPrompt"
                type="textarea"
                placeholder="请输入系统提示词（可选）"
                :autosize="{ minRows: 3, maxRows: 5 }"
              />
            </n-form-item>

            <n-form-item>
              <n-space vertical>
                <n-space justify="end">
                  <n-button
                    type="primary"
                    @click="saveSettings"
                    :loading="saving"
                  >
                    保存设置
                  </n-button>
                  <n-button
                    type="warning"
                    @click="testConnection"
                    :loading="testing"
                  >
                    测试连接
                  </n-button>
                </n-space>
              </n-space>
            </n-form-item>

            <n-form-item>
              <n-collapse-transition :show="!!testResult">
                <n-card
                  :bordered="false"
                  size="small"
                  :class="[
                    'test-result-card',
                    testResult?.success ? 'success' : 'error'
                  ]"
                  v-if="testResult"
                >
                  <template #header>
                    <n-space align="center">
                      <n-icon size="18">
                        <checkmark-circle-outline v-if="testResult.success" />
                        <close-circle-outline v-else />
                      </n-icon>
                      <span>{{ testResult.success ? '测试成功' : '测试失败' }}</span>
                    </n-space>
                  </template>
                  {{ testResult.message }}
                </n-card>
              </n-collapse-transition>
            </n-form-item>
          </n-form>
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  NCard,
  NTabs,
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NSpace,
  NButton,
  NIcon,
  useMessage,
  NCollapseTransition
} from 'naive-ui'
import {
  LinkOutline,
  KeyOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline
} from '@vicons/ionicons5'
import { useStorage } from '@vueuse/core'
import axios from 'axios'

const message = useMessage()
const formRef = ref(null)
const saving = ref(false)
const testing = ref(false)

// 使用 useStorage 持久化存储设置
const aiSettings = useStorage('ai-settings', {
  baseUrl: 'https://api.deepseek.com',
  apiKey: '',
  modelName: 'deepseek-chat',
  systemPrompt: '你是一个专业的日志分析助手，请帮我分析以下日志内容中的异常情况。'
})

const modelOptions = [
  {
    label: 'deepseek-chat',
    value: 'deepseek-chat'
  },
  {
    label: 'gpt-4o-mini',
    value: 'gpt-4o-mini'
  },
  {
    label: 'gpt-4o',
    value: 'gpt-4o'
  },
  {
    label: 'gpt-4o-ca',
    value: 'gpt-4o-ca'
  },
  {
    label: 'Claude 3.5 Sonnet',
    value: 'claude-3-5-sonnet-20241022'
  }
]

const rules = {
  baseUrl: [
    { required: true, message: '请输入 API Base URL' },
    { type: 'url', message: '请输入有效的 URL' }
  ],
  apiKey: [
    { required: true, message: '请输入 API Key' }
  ],
  modelName: [
    { required: true, message: '请选择模型名称' }
  ]
}

// 添加测试结果状态
const testResult = ref(null)

async function saveSettings() {
  try {
    await formRef.value?.validate()
    saving.value = true
    
    // 设置已经通过 useStorage 自动保存到 localStorage
    // 这里只需要显示成功消息
    message.success('设置已保存到本地')
    
  } catch (error) {
    if (error?.type !== 'validate') {
      message.error('保存失败：' + error.message)
    }
  } finally {
    saving.value = false
  }
}

async function testConnection() {
  try {
    await formRef.value?.validate()
    testing.value = true
    testResult.value = null  // 清除之前的测试结果
    
    const response = await axios.post(
      `${aiSettings.value.baseUrl}/v1/chat/completions`,
      {
        model: aiSettings.value.modelName,
        messages: [
          {
            role: 'system',
            content: aiSettings.value.systemPrompt
          },
          {
            role: 'user',
            content: '你好'
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${aiSettings.value.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (response.data.choices && response.data.choices[0]?.message?.content) {
      testResult.value = {
        success: true,
        message: aiSettings.value.modelName + '：' + response.data.choices[0].message.content
      }
    } else {
      throw new Error('返回数据格式不正确')
    }
    
  } catch (error) {
    testResult.value = {
      success: false,
      message: error.response?.data?.error?.message || error.message || '未知错误'
    }
  } finally {
    testing.value = false
  }
}
</script>

<style scoped>
.settings-card {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.n-form-item-label) {
  font-weight: 500;
}

.test-result-card {
  transition: all 0.3s ease;
  width: 100%;  /* 确保卡片占满宽度 */
}

.test-result-card.success {
  background-color: rgba(24, 160, 88, 0.1);
}

.test-result-card.error {
  background-color: rgba(208, 48, 80, 0.1);
}

.test-result-card :deep(.n-card-header) {
  padding: 8px 16px;
}

.test-result-card :deep(.n-card__content) {
  padding: 8px 16px;
}

:deep(.n-icon) {
  color: inherit;
}

.success :deep(.n-icon) {
  color: #18a058;
}

.error :deep(.n-icon) {
  color: #d03050;
}
</style> 