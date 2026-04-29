<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

export interface TrendDataItem {
  keyword: string
  data: { year: number; count: number }[]
}

const props = withDefaults(defineProps<{
  data: TrendDataItem[]
  title?: string
}>(), {
  title: '',
})

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#84cc16',
]

function buildOption(): echarts.EChartsOption {
  if (!props.data.length) {
    return { title: { text: '', show: false } }
  }

  // Collect all years across all keywords
  const yearSet = new Set<number>()
  for (const item of props.data) {
    for (const d of item.data) {
      yearSet.add(d.year)
    }
  }
  const years = Array.from(yearSet).sort((a, b) => a - b)

  const series = props.data.map((item, idx) => {
    const dataMap = new Map(item.data.map(d => [d.year, d.count]))
    return {
      name: item.keyword,
      type: 'line' as const,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: { focus: 'series' as const },
      data: years.map(y => dataMap.get(y) ?? 0),
    }
  })

  return {
    title: {
      text: props.title || undefined,
      left: 'center',
      textStyle: {
        fontSize: 14,
        fontWeight: 600,
        color: 'var(--text)',
      },
      show: !!props.title,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: 'var(--border)',
      textStyle: { color: '#333' },
      formatter(params: any) {
        if (!Array.isArray(params)) return ''
        let html = `<b>${params[0].axisValue}</b><br/>`
        for (const p of params) {
          html += `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};margin-right:6px;"></span>`
          html += `${p.seriesName}: <b>${p.value}</b><br/>`
        }
        return html
      },
    },
    legend: {
      data: props.data.map(d => d.keyword),
      bottom: 0,
      textStyle: { color: 'var(--text-secondary)', fontSize: 12 },
      type: 'scroll',
    },
    grid: {
      left: 50,
      right: 20,
      top: props.title ? 40 : 20,
      bottom: 40,
      containLabel: false,
    },
    color: COLORS,
    xAxis: {
      type: 'category',
      data: years.map(String),
      boundaryGap: false,
      axisLine: { lineStyle: { color: 'var(--border)' } },
      axisLabel: { color: 'var(--text-secondary)' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      splitLine: { lineStyle: { color: 'var(--border)', type: 'dashed' } },
      axisLabel: { color: 'var(--text-secondary)' },
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 20,
        bottom: 30,
        borderColor: 'var(--border)',
        fillerColor: 'rgba(99, 102, 241, 0.15)',
        handleStyle: { color: '#6366f1' },
        textStyle: { color: 'var(--text-secondary)' },
      },
    ],
    series,
  }
}

function renderChart() {
  if (!chartRef.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  chartInstance.setOption(buildOption(), true)
}

function handleResize() {
  chartInstance?.resize()
}

watch(
  () => props.data,
  () => {
    nextTick(() => renderChart())
  },
  { deep: true },
)

watch(
  () => props.title,
  () => {
    nextTick(() => renderChart())
  },
)

onMounted(() => {
  renderChart()

  // Use ResizeObserver for responsive sizing
  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div class="w-full">
    <div ref="chartRef" class="w-full h-80 md:h-96" style="min-height: 300px;" />
  </div>
</template>
