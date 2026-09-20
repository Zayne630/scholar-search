/**
 * 领域核心期刊与会议
 *
 * 供搜索页"期刊/会议"筛选下拉预置选项，替代仅从当前结果动态提取的方式。
 * 覆盖电力系统、电力电子、控制与安全四个圈子。
 */

export interface CoreVenue {
  name: string          // 检索用名称（与 OpenAlex/CrossRef 的 source display_name 对齐）
  label: string         // 界面显示
  group: 'power' | 'power-electronics' | 'control' | 'security' | 'ai'
}

export const coreVenues: CoreVenue[] = [
  // 电力系统
  { name: 'IEEE Transactions on Power Systems', label: 'IEEE Trans. Power Systems', group: 'power' },
  { name: 'IEEE Transactions on Smart Grid', label: 'IEEE Trans. Smart Grid', group: 'power' },
  { name: 'IEEE Transactions on Energy Conversion', label: 'IEEE Trans. Energy Conversion', group: 'power' },
  { name: 'IEEE Transactions on Sustainable Energy', label: 'IEEE Trans. Sustainable Energy', group: 'power' },
  { name: 'IEEE Transactions on Power Delivery', label: 'IEEE Trans. Power Delivery', group: 'power' },
  { name: 'Applied Energy', label: 'Applied Energy', group: 'power' },
  { name: 'IEEE Power and Energy Society General Meeting', label: 'IEEE PES GM', group: 'power' },
  // 电力电子与工业电子
  { name: 'IEEE Transactions on Power Electronics', label: 'IEEE Trans. Power Electronics', group: 'power-electronics' },
  { name: 'IEEE Transactions on Industrial Electronics', label: 'IEEE Trans. Industrial Electronics', group: 'power-electronics' },
  { name: 'IEEE Journal of Emerging and Selected Topics in Power Electronics', label: 'IEEE JESTPE', group: 'power-electronics' },
  { name: 'IEEE Transactions on Industrial Informatics', label: 'IEEE Trans. Industrial Informatics', group: 'power-electronics' },
  // 控制
  { name: 'IEEE Transactions on Control Systems Technology', label: 'IEEE Trans. Control Systems Tech.', group: 'control' },
  { name: 'IEEE Transactions on Automatic Control', label: 'IEEE Trans. Automatic Control', group: 'control' },
  { name: 'Automatica', label: 'Automatica', group: 'control' },
  { name: 'International Journal of Electrical Power & Energy Systems', label: 'IJEPES', group: 'control' },
  // 安全（含 ICS / 系统安全四大会议）
  { name: 'IEEE Transactions on Information Forensics and Security', label: 'IEEE TIFS', group: 'security' },
  { name: 'IEEE Symposium on Security and Privacy', label: 'IEEE S&P (Oakland)', group: 'security' },
  { name: 'USENIX Security Symposium', label: 'USENIX Security', group: 'security' },
  { name: 'ACM SIGSAC Conference on Computer and Communications Security', label: 'ACM CCS', group: 'security' },
  { name: 'Network and Distributed System Security Symposium', label: 'NDSS', group: 'security' },
  // AI 与智能方法（风电/微网数据驱动常发）
  { name: 'IEEE Transactions on Neural Networks and Learning Systems', label: 'IEEE TNNLS', group: 'ai' },
  { name: 'Renewable Energy', label: 'Renewable Energy', group: 'ai' },
  { name: 'IEEE Transactions on Instrumentation and Measurement', label: 'IEEE TIM', group: 'ai' },
]

/** 分组标签（用于下拉分组） */
export const venueGroupLabels: Record<CoreVenue['group'], string> = {
  'power': '电力系统',
  'power-electronics': '电力电子',
  'control': '控制',
  'security': '安全',
  'ai': '智能方法',
}
