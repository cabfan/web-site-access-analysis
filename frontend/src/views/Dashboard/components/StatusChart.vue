<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:legend'])

const chartRef = ref(null)
let chartInstance = null

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

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
  const statusDist = props.data
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
  const legendData = Object.values(groupedData)
    .filter(item => item.value > 0)
    .map(item => ({
      name: item.name,
      color: item.itemStyle.color,
      percent: ((item.value / statusDist.total) * 100).toFixed(1)
    }))
    .sort((a, b) => parseFloat(b.percent) - parseFloat(a.percent))

  emit('update:legend', legendData)

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
  
  chartInstance.setOption(option)
}

function handleResize() {
  chartInstance?.resize()
}

watch(() => props.data, () => {
  if (chartInstance) {
    initChart()
  }
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.chart-container {
  height: 100%;
  min-height: 300px;
}
</style> 