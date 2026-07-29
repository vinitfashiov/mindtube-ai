export interface ApiUsageLog {
  id: string;
  type: 'video_synthesis' | 'chat_qa' | 'translation';
  timestamp: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  costInr: number;
  details: string;
}

export interface ApiCostSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsd: number;
  totalCostInr: number;
  logs: ApiUsageLog[];
}

// Gemini 2.5 / 2.0 Flash Official Pricing Constants
export const INPUT_TOKEN_COST_PER_MILLION = 0.075; // $0.075 per 1M input tokens
export const OUTPUT_TOKEN_COST_PER_MILLION = 0.30;  // $0.30 per 1M output tokens
export const USD_TO_INR_RATE = 86.5;                // 1 USD = 86.5 INR

export function calculateGeminiCost(inputTokens: number, outputTokens: number) {
  const inputCost = (inputTokens / 1_000_000) * INPUT_TOKEN_COST_PER_MILLION;
  const outputCost = (outputTokens / 1_000_000) * OUTPUT_TOKEN_COST_PER_MILLION;
  const totalUsd = inputCost + outputCost;
  const totalInr = totalUsd * USD_TO_INR_RATE;

  return {
    costUsd: totalUsd,
    costInr: totalInr
  };
}
