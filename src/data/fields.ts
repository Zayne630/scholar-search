/**
 * 研究方向层级数据
 *
 * 大方向 (ResearchField) -> 子方向 (SubField) -> 搜索关键词
 *
 * 方向体系依据课题组近期论文提炼：
 * - 电力系统网络安全（攻击构造 / 脆弱性评估 / 检测防御）
 * - 电力电子与并网变换器（构网型 / 跟网型 / 振荡）
 * - 电力系统稳定性分析（小信号 / 次同步 / 暂态）
 * - 数据驱动电力系统（Koopman / 联邦学习 / 稳定评估）
 * - 工控与 AI 安全（PLC / LLM agent / 入侵检测）
 */

export interface SubField {
  name: string        // 中文名
  nameEn: string      // 英文名
  keyword: string     // 搜索关键词
  description: string // 简短描述
}

export interface ResearchField {
  slug: string        // URL slug
  name: string        // 中文名
  nameEn: string      // 英文名
  keyword: string     // 主搜索关键词
  icon: string        // 图标名称 (对应 ionicons5)
  color: string       // 主题色
  description: string // 方向简介
  subfields: SubField[] // 子方向列表
}

export const researchFields: ResearchField[] = [
  {
    slug: 'power-cybersecurity',
    name: '电力系统网络安全',
    nameEn: 'Power System Cybersecurity',
    keyword: 'power system cyberattack',
    icon: 'ShieldCheckmarkOutline',
    color: '#ef4444',
    description: '研究针对电力系统的网络攻击构造、脆弱性评估与检测防御，涵盖虚假数据注入、传感链攻击、隐蔽攻击与弹性控制。',
    subfields: [
      { name: '虚假数据注入攻击', nameEn: 'False Data Injection (FDI)', keyword: 'false data injection attack power system', description: '向量测或控制指令注入虚假数据的攻击建模与影响分析' },
      { name: '攻击检测与防御', nameEn: 'Attack Detection & Mitigation', keyword: 'cyberattack detection power system', description: '基于观测器、残差分析与状态估计的攻击检测方法' },
      { name: '脆弱性评估', nameEn: 'Vulnerability Assessment', keyword: 'vulnerability assessment cyberattack grid', description: '枚举攻击面并量化攻击可行性与隐蔽性' },
      { name: '隐蔽与协同攻击', nameEn: 'Stealthy & Coordinated Attacks', keyword: 'stealthy cyberattack smart grid', description: '绕过坏数据检测的隐蔽攻击与多节点协同攻击设计' },
      { name: '弹性控制与恢复', nameEn: 'Resilient Control & Restoration', keyword: 'resilient control power system cyberattack', description: '攻击下保持运行与攻击后的快速恢复策略' },
      { name: 'SCADA 与协议安全', nameEn: 'SCADA & Protocol Security', keyword: 'SCADA IEC 61850 security', description: 'SCADA、IEC 61850、Modbus 等电力协议的安全分析' },
      { name: '网络攻击下稳定问题', nameEn: 'Attack-Induced Instability', keyword: 'cyberattack induced instability oscillation', description: '网络攻击诱发振荡、失稳等系统级后果（如 CI-SSTI 类攻击）' },
    ],
  },
  {
    slug: 'grid-converters',
    name: '电力电子与并网变换器',
    nameEn: 'Grid-Interface Converters',
    keyword: 'grid-forming inverter',
    icon: 'HardwareChipOutline',
    color: '#f59e0b',
    description: '研究构网型与跟网型变换器的建模、控制与并网稳定性，是高比例新能源电网的核心装备层方向。',
    subfields: [
      { name: '构网型控制', nameEn: 'Grid-Forming Control', keyword: 'grid-forming inverter control', description: '下垂控制、虚拟同步机等自主电压相位生成策略' },
      { name: '跟网型与锁相环', nameEn: 'Grid-Following & PLL', keyword: 'grid-following converter PLL', description: '跟网型变换器与锁相环动态及其稳定问题' },
      { name: '阻抗建模与分析', nameEn: 'Impedance Modeling', keyword: 'impedance modeling grid-connected converter', description: '频域阻抗/导纳建模与交互稳定分析' },
      { name: '次同步振荡', nameEn: 'Subsynchronous Oscillation', keyword: 'subsynchronous oscillation wind farm', description: '风电场并网引发的次同步振荡与谐振机理' },
      { name: '宽频振荡', nameEn: 'Broadband Oscillation', keyword: 'broadband oscillation converter', description: '电力电子化系统的高频段振荡问题' },
      { name: '新型电力系统强度', nameEn: 'Grid Strength & SCR', keyword: 'short circuit ratio weak grid inverter', description: '短路比、弱电网条件下的并网性能' },
      { name: '故障穿越与保护', nameEn: 'Fault Ride-Through', keyword: 'fault ride-through grid-forming', description: '电网故障下变换器的穿越控制与保护配合' },
    ],
  },
  {
    slug: 'power-stability',
    name: '电力系统稳定性',
    nameEn: 'Power System Stability',
    keyword: 'power system small-signal stability',
    icon: 'PulseOutline',
    color: '#3b82f6',
    description: '研究电力系统小信号稳定、次同步扭振与暂态稳定的分析方法与稳定裕度评估。',
    subfields: [
      { name: '小信号稳定分析', nameEn: 'Small-Signal Stability', keyword: 'small-signal stability power system', description: '特征值分析、参与因子与主导模态辨识' },
      { name: '次同步扭振', nameEn: 'Subsynchronous Torsional Interaction', keyword: 'subsynchronous torsional interaction', description: '机组轴系扭振与电网的机电耦合作用（SSTI/SSR）' },
      { name: '暂态稳定', nameEn: 'Transient Stability', keyword: 'transient stability assessment power system', description: '大扰动后系统保持同步的能力评估' },
      { name: '稳定裕度量化', nameEn: 'Stability Margin', keyword: 'stability margin assessment grid', description: '距离失稳边界的量化指标与在线监视' },
      { name: '直流微电网稳定', nameEn: 'DC Microgrid Stability', keyword: 'DC microgrid stability constant power load', description: '直流微电网与恒功率负荷的稳定问题' },
      { name: '高比例新能源影响', nameEn: 'Renewable Penetration Impact', keyword: 'renewable energy penetration power system stability', description: '新能源占比升高对系统惯量与稳定的影响' },
    ],
  },
  {
    slug: 'data-driven-power',
    name: '数据驱动电力系统',
    nameEn: 'Data-Driven Power Systems',
    keyword: 'data-driven power system analysis',
    icon: 'GitMergeOutline',
    color: '#8b5cf6',
    description: '研究机器学习与电力系统机理模型的结合：Koopman 算子、联邦学习、可解释稳定评估与智能风机控制。',
    subfields: [
      { name: 'Koopman 理论应用', nameEn: 'Koopman Operator Methods', keyword: 'Koopman operator power system', description: '用提升线性化从数据中获得可解释线性模型与特征值' },
      { name: '联邦学习电网应用', nameEn: 'Federated Learning for Grid', keyword: 'federated learning smart grid', description: '数据不出本地场景下的多节点协同训练' },
      { name: '数据驱动稳定评估', nameEn: 'Data-Driven Stability Assessment', keyword: 'data-driven stability assessment power system', description: '从量测数据直接评估系统稳定状态' },
      { name: '风机建模与控制', nameEn: 'Wind Turbine Modeling & Control', keyword: 'wind turbine control modeling', description: '变速风机的动力学建模、观测器与自适应控制' },
      { name: '数字孪生与仿真平台', nameEn: 'Digital Twin & RT-Simulation', keyword: 'digital twin power system real-time simulation', description: '电磁暂态仿真、硬件在环与实时仿真平台' },
      { name: '电力负荷与状态估计', nameEn: 'Load & State Estimation', keyword: 'state estimation smart grid measurement', description: '量测驱动的状态估计与异常数据识别' },
    ],
  },
  {
    slug: 'ics-ai-security',
    name: '工控与 AI 安全',
    nameEn: 'ICS & AI Agent Security',
    keyword: 'industrial control system security',
    icon: 'BugOutline',
    color: '#10b981',
    description: '研究可编程逻辑控制器（PLC）安全、LLM 智能体攻击能力评估与工控入侵检测，关注从网络访问到物理影响的转化。',
    subfields: [
      { name: 'PLC 安全', nameEn: 'PLC Security', keyword: 'PLC programmable logic controller security', description: 'PLC 协议、程序与运行环境的安全分析' },
      { name: 'LLM 智能体安全', nameEn: 'LLM Agent Security', keyword: 'LLM agent cyber attack benchmark', description: '大模型智能体的攻击能力与安全评测基准' },
      { name: '工控入侵检测', nameEn: 'ICS Intrusion Detection', keyword: 'intrusion detection industrial control system', description: '面向工控流量与过程数据的异常检测' },
      { name: '信息物理攻击评估', nameEn: 'Cyber-Physical Attack Benchmark', keyword: 'cyber-physical attack benchmark evaluation', description: '以物理后果为终点的攻击评估方法学' },
      { name: '攻击面与协议分析', nameEn: 'Attack Surface & Protocols', keyword: 'Modbus S7comm protocol attack surface', description: '工业协议的攻击面枚举与漏洞分析' },
      { name: 'AI 安全防护', nameEn: 'AI Safety & Defense', keyword: 'LLM agent safety defense control', description: '面向智能体威胁的防御架构与访问控制' },
    ],
  },
]

/**
 * 根据 slug 获取研究方向
 */
export function getFieldBySlug(slug: string): ResearchField | undefined {
  return researchFields.find(f => f.slug === slug)
}

/**
 * 根据 slug 获取子方向列表
 */
export function getSubfields(slug: string): SubField[] {
  return getFieldBySlug(slug)?.subfields ?? []
}
