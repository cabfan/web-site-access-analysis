<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chartInstance = null

function initChart() {
  if (!chartRef.value) return
  
  chartInstance = echarts.init(chartRef.value)
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
      data: props.data.map(item => item.count),
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