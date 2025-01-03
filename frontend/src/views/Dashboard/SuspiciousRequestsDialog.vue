<template>
  <n-modal
    :show="localShow"
    preset="card"
    title="可疑请求详情"
    :style="{ width: '900px' }"
    :bordered="false"
    size="huge"
    :segmented="{ content: true }"
    @update:show="$emit('update:show', $event)"
  >
    <div class="table-container">
      <n-data-table
        :columns="columns"
        :data="requests.items"
        :pagination="pagination"
        :loading="loading"
        :scroll-x="800"
        :max-height="500"
      />
    </div>
  </n-modal>
</template>

<script setup>
import { h, ref, computed, watch } from 'vue';
import { NModal, NDataTable, NTag, NText, NTooltip, NSpace } from 'naive-ui';

const props = defineProps({
  show: Boolean,
  requests: {
    type: Object,
    default: () => ({
      items: [],
      total: 0,
      pageSize: 100,
      currentPage: 1
    })
  }
});

defineEmits(['update:show']);

const localShow = ref(props.show);

watch(() => props.show, (newVal) => {
  localShow.value = newVal;
});

const loading = ref(false);

const columns = [
  {
    title: 'IP地址',
    key: 'ip',
    width: 150,
    fixed: 'left',
    render(row) {
      return h(NText, { code: true }, { default: () => row.ip });
    }
  },
  {
    title: '类型',
    key: 'type',
    width: 120,
    render(row) {
      const typeConfig = {
        high_frequency: {
          name: '高频访问',
          type: 'warning',
          icon: '⚡'
        },
        vulnerability_scan: {
          name: '漏洞扫描',
          type: 'error',
          icon: '🔍'
        },
        default: {
          name: '其他',
          type: 'default',
          icon: '❓'
        }
      };

      const config = typeConfig[row.type] || typeConfig.default;
      
      return h(NTooltip, null, {
        trigger: () => h(
          NTag,
          {
            type: config.type,
            round: true,
            style: {
              cursor: 'help'
            }
          },
          { default: () => `${config.icon} ${config.name}` }
        ),
        default: () => getTypeDescription(row.type)
      });
    }
  },
  {
    title: '详情',
    key: 'details',
    ellipsis: false,
    render(row) {
      return h(NSpace, { vertical: true, size: 8 }, {
        default: () => [
          h('div', { class: 'details-text' }, row.details),
          row.type === 'vulnerability_scan' && row.path ? 
            h('div', { class: 'scan-path' }, [
              h('span', { class: 'path-label' }, '请求路径：'),
              h(NText, { code: true }, { default: () => row.path })
            ]) : null
        ]
      });
    }
  }
];

const pagination = computed(() => ({
  page: props.requests.currentPage,
  pageSize: props.requests.pageSize,
  itemCount: props.requests.total,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  prefix({ itemCount }) {
    return `共 ${itemCount} 条可疑请求`;
  }
}));

function getTypeDescription(type) {
  const descriptions = {
    high_frequency: '短时间内发送大量请求，可能是爬虫或攻击行为',
    vulnerability_scan: '尝试访问敏感路径或执行漏洞探测',
    default: '未知的可疑行为'
  };
  return descriptions[type] || descriptions.default;
}
</script>

<style scoped>
.table-container {
  position: relative;
  width: 100%;
}

:deep(.n-data-table) {
  width: 100%;
}

:deep(.n-tag) {
  min-width: 90px;
  justify-content: center;
}

.details-text {
  line-height: 1.5;
}

.scan-path {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}

.path-label {
  margin-right: 4px;
  color: #999;
}

:deep(.n-text.n-code) {
  font-family: monospace;
  padding: 2px 4px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 3px;
  word-break: break-all;
}

:deep(.n-data-table-td) {
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
</style> 