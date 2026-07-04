/**
 * AI 智能报告生成服务
 * 支持 OpenAI 兼容 API（DeepSeek / OpenAI / 本地模型）
 */

interface ReportData {
  totalUsers: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  modelAccuracy: number;
  modelAuc: number;
  topCauses: { name: string; value: number }[];
  complaintTrend: { date: string; actual: number; predicted: number }[];
  kpiSummary: Record<string, string>;
  regionDistribution: { name: string; high: number; medium: number; low: number }[];
}

interface AIGenerateOptions {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_BASE_URL = 'https://api.deepseek.com/v1';
const DEFAULT_MODEL = 'deepseek-chat';

export async function generateAIReport(
  data: ReportData,
  options: AIGenerateOptions,
): Promise<string> {
  const { apiKey, baseUrl = DEFAULT_BASE_URL, model = DEFAULT_MODEL } = options;

  const prompt = buildReportPrompt(data);

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `你是一个资深的电信行业数据分析专家。请根据提供的满意度评价平台数据，撰写一份专业的分析报告。

报告要求：
1. 使用中文，语气专业但易懂
2. 包含以下章节：数据概况、关键发现、风险分析、根因诊断、改进建议
3. 每个结论都要引用具体数据支撑
4. 使用 Markdown 格式输出，包含适当的表情符号增强可读性
5. 报告长度控制在 800-1500 字`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: '请求失败' } }));
    throw new Error(err.error?.message || `API 请求失败: ${response.status}`);
  }

  const result = await response.json();
  return result.choices[0]?.message?.content || '报告生成失败，请重试';
}

function buildReportPrompt(data: ReportData): string {
  const riskRate = ((data.highRiskCount / data.totalUsers) * 100).toFixed(1);
  const totalRisk = data.highRiskCount + data.mediumRiskCount;

  return `请基于以下满意度评价平台的数据生成分析报告：

## 数据概况
- 总用户数：${data.totalUsers.toLocaleString()}
- 不满意高风险用户：${data.highRiskCount.toLocaleString()}（占比 ${riskRate}%）
- 中风险用户：${data.mediumRiskCount.toLocaleString()}
- 低风险用户：${data.lowRiskCount.toLocaleString()}
- 需要关注用户总数：${totalRisk.toLocaleString()}

## 模型表现
- 不满意预测模型准确率：${(data.modelAccuracy * 100).toFixed(1)}%
- 模型 AUC：${data.modelAuc.toFixed(3)}

## 根因分析 TOP5
${data.topCauses.map((c, i) => `${i + 1}. ${c.name}: ${c.value}%`).join('\n')}

## 区域风险分布
${data.regionDistribution.map((r) => `- ${r.name}: 高风险${r.high}人, 中风险${r.medium}人, 低风险${r.low}人`).join('\n')}

## 投诉趋势（近7天）
${data.complaintTrend.map((d) => `- ${d.date}: 实际${d.actual}条, 预测${d.predicted}条`).join('\n')}

## 关键指标摘要
${Object.entries(data.kpiSummary).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

请生成完整分析报告。`;
}

export type { ReportData, AIGenerateOptions };
