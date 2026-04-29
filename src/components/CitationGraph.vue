<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { Paper } from '../types/paper'

const props = defineProps<{
  paper: Paper
  references: Paper[]
  citations: Paper[]
}>()

const emit = defineEmits<{
  navigate: [paperId: string]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null

interface GraphNode {
  name: string
  category: number
  symbolSize: number
  value: string
  itemStyle?: { color?: string }
}

function buildOption(): echarts.EChartsOption {
  const currentId = props.paper.id
  const nodes: GraphNode[] = []
  const links: { source: string; target: string; lineStyle?: { opacity: number } }[] = []

  // Center node: current paper
  const maxSize = 50
  const minSize = 18
  const maxCitations = Math.max(
    props.paper.citationCount,
    ...props.references.slice(0, 25).map(r => r.citationCount),
    ...props.citations.slice(0, 25).map(c => c.citationCount),
    1,
  )

  function scaleSize(citationCount: number): number {
    const ratio = citationCount / maxCitations
    return minSize + (maxSize - minSize) * Math.sqrt(ratio)
  }

  nodes.push({
    name: currentId,
    category: 0,
    symbolSize: maxSize,
    value: props.paper.title,
    itemStyle: { color: '#6366f1' },
  })

  // Reference nodes (category 1) - green
  const refSlice = props.references.slice(0, 24)
  for (const ref of refSlice) {
    nodes.push({
      name: ref.id,
      category: 1,
      symbolSize: scaleSize(ref.citationCount),
      value: ref.title,
      itemStyle: { color: '#10b981' },
    })
    links.push({ source: currentId, target: ref.id, lineStyle: { opacity: 0.4 } })
  }

  // Citation nodes (category 2) - yellow/amber
  const remainingSlots = 50 - nodes.length
  const citeSlice = props.citations.slice(0, remainingSlots)
  for (const cite of citeSlice) {
    if (nodes.some(n => n.name === cite.id)) continue
    nodes.push({
      name: cite.id,
      category: 2,
      symbolSize: scaleSize(cite.citationCount),
      value: cite.title,
      itemStyle: { color: '#f59e0b' },
    })
    links.push({ source: cite.id, target: currentId, lineStyle: { opacity: 0.4 } })
  }

  return {
    tooltip: {
      trigger: 'item',
      formatter(params: any) {
        if (params.dataType === 'node') {
          const title = params.data.value || params.name
          const displayTitle = title.length > 80 ? title.slice(0, 80) + '...' : title
          // Find citation count
          const nodePaper = [props.paper, ...props.references, ...props.citations]
            .find(p => p.id === params.data.name)
          const citationStr = nodePaper ? ` (${nodePaper.citationCount} citations)` : ''
          return `<div style="max-width:300px">${displayTitle}${citationStr}</div>`
        }
        return ''
      },
      confine: true,
    },
    legend: {
      data: [
        props.paper.title.length > 20 ? props.paper.title.slice(0, 20) + '...' : props.paper.title,
      ],
      bottom: 0,
      textStyle: { color: 'var(--text-secondary)' },
      show: false,
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        label: { show: false },
        force: {
          repulsion: 250,
          gravity: 0.1,
          edgeLength: [60, 120],
          friction: 0.6,
        },
        categories: [
          { name: 'Current Paper', itemStyle: { color: '#6366f1' } },
          { name: 'References', itemStyle: { color: '#10b981' } },
          { name: 'Citations', itemStyle: { color: '#f59e0b' } },
        ],
        data: nodes,
        links,
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 },
        },
      },
    ],
  }
}

function renderChart() {
  if (!chartRef.value || !props.paper) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    chartInstance.on('click', (params: any) => {
      if (params.dataType === 'node' && params.data.name !== props.paper.id) {
        emit('navigate', params.data.name)
      }
    })
  }

  chartInstance.setOption(buildOption(), true)
}

watch(
  () => [props.paper, props.references, props.citations],
  () => {
    nextTick(() => renderChart())
  },
  { deep: true },
)

onMounted(() => {
  renderChart()

  if (chartRef.value) {
    resizeObserver = new ResizeObserver(() => {
      chartInstance?.resize()
    })
    resizeObserver.observe(chartRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null

  if (chartInstance) {
    chartInstance.off('click')
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Legend -->
    <div class="flex items-center justify-center gap-4 mb-3 text-xs" style="color: var(--text-secondary);">
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-full" style="background: #6366f1;" />
        Current
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-full" style="background: #10b981;" />
        References
      </span>
      <span class="flex items-center gap-1.5">
        <span class="inline-block w-3 h-3 rounded-full" style="background: #f59e0b;" />
        Cited by
      </span>
    </div>

    <div ref="chartRef" class="w-full h-80 md:h-96 rounded-lg" style="min-height: 300px; background: var(--bg-secondary);" />
  </div>
</template>
