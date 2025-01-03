<template>
  <div ref="chartRef" :style="{ height: height, width: width }"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  options: {
    type: Object,
    required: true
  },
  height: {
    type: String,
    default: '300px'
  },
  width: {
    type: String,
    default: '100%'
  }
})

const chartRef = ref(null)
let chart = null

onMounted(() => {
  chart = echarts.init(chartRef.value)
  chart.setOption(props.options)
  
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (chart) {
    chart.dispose()
    window.removeEventListener('resize', handleResize)
  }
})

watch(() => props.options, (newOptions) => {
  if (chart) {
    chart.setOption(newOptions)
  }
}, { deep: true })

function handleResize() {
  if (chart) {
    chart.resize()
  }
}
</script> 