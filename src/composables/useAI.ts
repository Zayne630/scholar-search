/**
 * AI 总结组合式函数
 *
 * 提供研究趋势总结、论文总结、方向对比、创新点发现等功能。
 * 使用流式输出实现打字机效果。
 */

import { ref } from 'vue'
import { getSetting } from '../db'
import { chatStream, DEFAULT_MODELS } from '../api/llm'
import type { LLMConfig, LLMProvider } from '../api/llm'

export function useAI() {
  const generating = ref(false)
  const result = ref('')
  const error = ref<string | null>(null)

  // ---------------------------------------------------------------------------
  // Config
  // ---------------------------------------------------------------------------

  async function getConfig(): Promise<LLMConfig | null> {
    const provider = await getSetting<LLMProvider>('llmProvider')
    const apiKey = await getSetting<string>('llmApiKey')
    const model = await getSetting<string>('llmModel')

    if (!provider || !apiKey) return null

    return {
      provider,
      apiKey,
      model: model || undefined,
    }
  }

  // ---------------------------------------------------------------------------
  // Summarize Trends
  // ---------------------------------------------------------------------------

  async function summarizeTrends(data: {
    keyword: string
    paperCount: number
    recentPapers: Array<{ title: string; year: number; citationCount: number }>
    trendData?: Record<number, number>
  }): Promise<string> {
    const config = await getConfig()
    if (!config) throw new Error('AI API not configured')

    const papersList = data.recentPapers
      .slice(0, 10)
      .map((p, i) => `${i + 1}. "${p.title}" (${p.year}, ${p.citationCount} citations)`)
      .join('\n')

    const trendStr = data.trendData
      ? Object.entries(data.trendData)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([year, count]) => `${year}: ${count}`)
          .join(', ')
      : 'Not available'

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an academic research trend analysis expert. Analyze data objectively and provide insights in Chinese. Format your response with clear markdown headers and bullet points.',
      },
      {
        role: 'user' as const,
        content: `你是一位学术研究趋势分析专家。请基于以下数据分析"${data.keyword}"领域的研究趋势：

数据概要：
- 该领域共有约 ${data.paperCount} 篇相关论文
- 近期代表性论文：
${papersList}

年度论文数量趋势：${trendStr}

请从以下角度进行分析（使用中文）：
1. **总体趋势**：该领域的发展态势（上升/稳定/下降），并说明依据
2. **技术演进**：主要技术路线的演变
3. **热点方向**：当前最活跃的研究子方向
4. **新兴机会**：可能的新研究机会和突破口
5. **实用建议**：对刚进入该领域的研究者的建议

请保持客观、严谨，基于数据进行分析。`,
      },
    ]

    generating.value = true
    result.value = ''
    error.value = null

    try {
      const fullText = await chatStream(config, messages, (text) => {
        result.value = text
      })
      return fullText
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      throw e
    } finally {
      generating.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Summarize Paper
  // ---------------------------------------------------------------------------

  async function summarizePaper(paper: {
    title: string
    abstract?: string
    authors: string[]
    year: number
    venue?: string
  }): Promise<string> {
    const config = await getConfig()
    if (!config) throw new Error('AI API not configured')

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an academic paper analysis expert. Provide structured summaries in Chinese with clear markdown formatting.',
      },
      {
        role: 'user' as const,
        content: `你是一位学术论文分析专家。请对以下论文进行结构化总结：

标题：${paper.title}
作者：${paper.authors.join(', ')}
年份：${paper.year}
${paper.venue ? `期刊/会议：${paper.venue}` : ''}
${paper.abstract ? `摘要：${paper.abstract}` : '摘要：暂无'}

请用中文提供以下内容：
1. **核心贡献**（1-2句话）
2. **方法创新**：采用了什么新方法或改进
3. **实验结果**：主要成果和指标
4. **局限性**：可能的不足之处
5. **启发意义**：对后续研究的启发`,
      },
    ]

    generating.value = true
    result.value = ''
    error.value = null

    try {
      const fullText = await chatStream(config, messages, (text) => {
        result.value = text
      })
      return fullText
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      throw e
    } finally {
      generating.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Compare Directions
  // ---------------------------------------------------------------------------

  async function compareDirections(
    directions: Array<{
      name: string
      paperCount: number
      trend: string
    }>,
  ): Promise<string> {
    const config = await getConfig()
    if (!config) throw new Error('AI API not configured')

    const directionList = directions
      .map(
        (d, i) =>
          `${i + 1}. **${d.name}**：论文数量 ${d.paperCount}，趋势：${d.trend}`,
      )
      .join('\n')

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an academic research direction comparison expert. Provide detailed comparative analysis in Chinese with clear markdown formatting.',
      },
      {
        role: 'user' as const,
        content: `你是一位学术研究方向对比分析专家。请对比分析以下研究方向：

${directionList}

请用中文从以下角度进行对比分析：
1. **研究规模对比**：各方向的论文数量和活跃度
2. **发展趋势对比**：各方向的发展态势差异
3. **技术路线对比**：各方向的主要技术路线
4. **交叉机会**：各方向之间可能的交叉融合点
5. **推荐优先级**：对研究者而言，建议优先关注哪些方向
6. **风险与挑战**：各方向面临的主要挑战

请保持客观、全面的分析。`,
      },
    ]

    generating.value = true
    result.value = ''
    error.value = null

    try {
      const fullText = await chatStream(config, messages, (text) => {
        result.value = text
      })
      return fullText
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      throw e
    } finally {
      generating.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Discover Innovations
  // ---------------------------------------------------------------------------

  async function discoverInnovations(
    papers: Array<{
      title: string
      abstract?: string
      year: number
    }>,
  ): Promise<string> {
    const config = await getConfig()
    if (!config) throw new Error('AI API not configured')

    const papersWithAbstracts = papers
      .slice(0, 15)
      .map(
        (p, i) =>
          `${i + 1}. "${p.title}" (${p.year})\n   ${p.abstract ? `摘要：${p.abstract}` : ''}`,
      )
      .join('\n\n')

    const messages = [
      {
        role: 'system' as const,
        content:
          'You are an academic innovation discovery expert. Identify innovations and future directions from research papers. Respond in Chinese with clear markdown formatting.',
      },
      {
        role: 'user' as const,
        content: `分析以下最新论文，识别其中的创新点和可能的新研究方向：

${papersWithAbstracts}

请用中文总结（注意：引用论文时必须使用完整论文标题，如《论文标题》，不要使用"论文1"等编号）：
1. **方法论创新**：提出了哪些新方法，具体是哪篇论文提出的
2. **交叉融合**：哪些跨领域融合趋势出现，引用相关论文标题
3. **新兴问题**：有哪些新问题被提出，引用具体论文
4. **技术突破**：哪些技术取得了重要进展，引用论文标题
5. **未来展望**：基于这些论文，未来可能的研究方向`,
      },
    ]

    generating.value = true
    result.value = ''
    error.value = null

    try {
      const fullText = await chatStream(config, messages, (text) => {
        result.value = text
      })
      return fullText
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      error.value = msg
      throw e
    } finally {
      generating.value = false
    }
  }

  // ---------------------------------------------------------------------------
  // Test connection (simple wrapper)
  // ---------------------------------------------------------------------------

  async function testCurrentConnection(): Promise<boolean> {
    const config = await getConfig()
    if (!config) return false

    try {
      const { chat } = await import('../api/llm')
      const res = await chat(config, [
        { role: 'user', content: 'Hi, reply with "OK" only.' },
      ])
      return res.length > 0
    } catch {
      return false
    }
  }

  return {
    generating,
    result,
    error,
    getConfig,
    summarizeTrends,
    summarizePaper,
    compareDirections,
    discoverInnovations,
    testCurrentConnection,
  }
}
