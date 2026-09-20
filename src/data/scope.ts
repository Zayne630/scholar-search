/**
 * 研究领域范围约束
 *
 * 用户的研究方向为电力信息物理系统（CPS）安全、电力电子化电力系统稳定与数据驱动分析。
 * 开启范围约束后，所有检索请求会自动附加学科过滤，排除无关学科（生物、医学、社科等）。
 *
 * 三档范围：
 * - focused（聚焦）：电气工程 / 电子工程 / 控制工程 / 计算机安全 / 电力工程 /
 *   智能电网 / 电力电子 / 输电系统，默认档位
 * - broad（宽泛）：工程 + 计算机科学全部
 * - off（关闭）：不做学科约束
 *
 * 各 API 的过滤参数均已通过 OpenAlex / arXiv / Semantic Scholar 官方文档与实际请求验证。
 */

export type ResearchScope = 'off' | 'broad' | 'focused'

const STORAGE_KEY = 'researchScope'

/** OpenAlex concepts ID（已逐一通过 /concepts 接口核实） */
const OPENALEX_FOCUSED_CONCEPTS = [
  'C119599485', // Electrical engineering
  'C24326235',  // Electronic engineering
  'C133731056', // Control engineering
  'C38652104',  // Computer security
  'C54089160',  // Power engineering
  'C10558101',  // Smart grid
  'C178911571', // Power electronics
  'C140311924', // Electric power transmission
]

const OPENALEX_BROAD_CONCEPTS = [
  'C127413603', // Engineering
  'C41008148',  // Computer science
]

/** arXiv 分类 */
const ARXIV_FOCUSED_CATEGORIES = ['eess.SY', 'cs.SY', 'cs.CR', 'eess.SP']
const ARXIV_BROAD_CATEGORIES = ['eess.SY', 'cs.SY', 'cs.CR', 'eess.SP', 'cs.LG', 'cs.AI']

/** Semantic Scholar fieldsOfStudy 合法枚举值（官方文档） */
const S2_ALLOWED_FIELDS = new Set([
  'Agricultural and Food Sciences', 'Art', 'Biology', 'Business', 'Chemistry',
  'Computer Science', 'Economics', 'Engineering', 'Environmental Science',
  'Geography', 'Geology', 'History', 'Materials Science', 'Mathematics',
  'Medicine', 'Philosophy', 'Physics', 'Political Science', 'Psychology',
  'Sociology',
])

const S2_FOCUSED_FIELDS = ['Engineering', 'Computer Science']
const S2_BROAD_FIELDS = ['Engineering', 'Computer Science', 'Physics', 'Mathematics']

/**
 * CrossRef 无法在服务端按学科过滤（subject 字段覆盖面差），
 * 在客户端按 subject 白名单 + 期刊名关键词过滤。
 */
const CROSSREF_SUBJECT_ALLOW = [
  'engineering', 'computer science', 'energy', 'physics',
  'mathematics', 'technology', 'electricity',
]

/** 期刊/会议名命中任一关键词视为领域内（用于 CrossRef 客户端过滤） */
const CROSSREF_VENUE_KEYWORDS = [
  'power', 'grid', 'energy', 'electric', 'control', 'automation',
  'systems engineering', 'industrial electro', 'smart',
  'security', 'cryptology', 'usenix', 'dependable',
]

/** 读取当前研究范围，未设置时默认 focused */
export function getResearchScope(): ResearchScope {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'off' || v === 'broad' || v === 'focused') return v
  } catch {
    // localStorage 不可用时按默认处理
  }
  return 'focused'
}

export function setResearchScope(scope: ResearchScope) {
  try {
    localStorage.setItem(STORAGE_KEY, scope)
  } catch {
    // ignore
  }
}

/** OpenAlex：返回 concepts.id 过滤值（pipe 分隔 OR），off 时返回 undefined */
export function openalexScopeFilter(): string | undefined {
  const scope = getResearchScope()
  if (scope === 'off') return undefined
  const ids = scope === 'focused' ? OPENALEX_FOCUSED_CONCEPTS : OPENALEX_BROAD_CONCEPTS
  return `concepts.id:${ids.join('|')}`
}

/** arXiv：返回 cat: 过滤子句，off 时返回 undefined */
export function arxivScopeFilter(): string | undefined {
  const scope = getResearchScope()
  if (scope === 'off') return undefined
  const cats = scope === 'focused' ? ARXIV_FOCUSED_CATEGORIES : ARXIV_BROAD_CATEGORIES
  return cats.map(c => `cat:${c}`).join(' OR ')
}

/** Semantic Scholar：返回合法的 fieldsOfStudy 参数值，off 时返回 undefined */
export function s2ScopeFilter(): string | undefined {
  const scope = getResearchScope()
  if (scope === 'off') return undefined
  const fields = scope === 'focused' ? S2_FOCUSED_FIELDS : S2_BROAD_FIELDS
  return fields.join(',')
}

/**
 * 判断 CrossRef 的 fieldsOfStudy（subject 列表）与期刊名是否落在研究范围内。
 * off 时恒为 true。
 */
export function crossrefInScope(subjects: string[] | undefined, venue: string | undefined): boolean {
  const scope = getResearchScope()
  if (scope === 'off') return true

  const subjectHit = (subjects ?? []).some(s =>
    CROSSREF_SUBJECT_ALLOW.some(k => s.toLowerCase().includes(k)),
  )
  if (subjectHit) return true

  const v = (venue ?? '').toLowerCase()
  if (v && CROSSREF_VENUE_KEYWORDS.some(k => v.includes(k))) return true

  // 无 subject 也无 venue 信息的条目保留（避免把大量数据整体丢弃）
  return !subjects?.length && !venue
}

/**
 * 将任意来源的 fieldOfStudy 显示名映射为 S2 合法枚举值。
 * 用于"高级筛选"中的领域下拉：非合法值直接丢弃，避免 S2 返回 400。
 */
export function toS2FieldsOfStudy(value: string): string[] {
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => S2_ALLOWED_FIELDS.has(s))
}

/**
 * 将"高级筛选"的领域选择映射为 arXiv 分类。
 * 显示名（如 Engineering / Computer Science）无法直接对应 arXiv 分类，
 * 返回 undefined 时表示放弃该过滤（对 arXiv 无意义）。
 */
export function toArxivCategory(value: string): string | undefined {
  const v = value.toLowerCase()
  if (v.includes('engineering')) return 'eess.SY'
  if (v.includes('computer science')) return 'cs'
  return undefined
}
