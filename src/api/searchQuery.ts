/**
 * 检索词预处理
 *
 * 学术缩写（如 CI-SSTI、FDIA）中的连字符会被搜索引擎当分词符处理，
 * 导致与无关学科的同名缩写混淆（例如医学中 SSTI 指皮肤软组织感染，
 * 搜索 CI-SSTI 时大量医学论文会淹没目标论文）。
 * 当输入是单个含连字符或下划线的词条时，为其加双引号做精确短语匹配，
 * 可将结果从数千条缩到个位数并让目标论文排到首位。
 */

/**
 * 若查询词需要精确短语匹配则加双引号。
 * - 多词输入保持原样（用户意图是宽泛检索）
 * - 已含引号或空格的输入原样返回
 * - 单个含连字符/下划线的词条（缩写、复合词）加引号
 */
export function quotedTermIfNeeded(query: string): string {
  const q = query.trim()
  if (!q) return q
  if (q.includes(' ')) return q
  if (q.startsWith('"')) return q
  if (/[-_]/.test(q)) return `"${q}"`
  return q
}

/**
 * 判断（经 quotedTermIfNeeded 处理后的）查询是否为精确短语。
 * 精确短语检索的匹配数天然很少、词本身已完成消歧，
 * 各数据源在此情况下应跳过学科范围过滤，避免因数据库
 * 概念标注不一致（如同一方向被标为 Control system 而非
 * Control engineering）而误杀目标论文。
 */
export function isExactPhrase(processedQuery: string): boolean {
  return processedQuery.trim().startsWith('"')
}
