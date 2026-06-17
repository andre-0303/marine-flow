import type { OceanCondition } from '../entities/OceanCondition.js'
import type { RiskLevel } from '../entities/Prediction.js'

export interface RiskCalculatorService {
  calculate(condition: OceanCondition): { score: number; level: RiskLevel; explanation: string }
}

// Score formula — weighted sum of normalized factors (0–100 each):
//   windScore      = clamp(windSpeed / 30, 0, 1) * 100        weight 20%
//   currentScore   = clamp(currentStrength / 5, 0, 1) * 100   weight 30% (BR-06)
//   tideScore      = clamp(max(0, tideLevel) / 3, 0, 1) * 100 weight 30% (BR-05, high tide only)
//   pollutionScore = clamp(pollutionDensity / 100, 0, 1) * 100 weight 20%
//   total = 0.20*wind + 0.30*current + 0.30*tide + 0.20*pollution
export class RiskCalculatorServiceImpl implements RiskCalculatorService {
  calculate(condition: OceanCondition): { score: number; level: RiskLevel; explanation: string } {
    const windScore = clamp(condition.windSpeed / 30, 0, 1) * 100
    const currentScore = clamp(condition.currentStrength / 5, 0, 1) * 100
    const tideScore = clamp(Math.max(0, condition.tideLevel) / 3, 0, 1) * 100
    const pollutionScore = clamp(condition.pollutionDensity / 100, 0, 1) * 100

    const score = Math.round(
      0.20 * windScore +
      0.30 * currentScore +
      0.30 * tideScore +
      0.20 * pollutionScore
    )

    const level = resolveLevel(score)
    const explanation = buildExplanation(score, level, { windScore, currentScore, tideScore, pollutionScore })

    return { score, level, explanation }
  }
}

function resolveLevel(score: number): RiskLevel {
  if (score < 40) return 'low'
  if (score < 70) return 'medium'
  return 'high'
}

function buildExplanation(
  score: number,
  level: RiskLevel,
  factors: { windScore: number; currentScore: number; tideScore: number; pollutionScore: number },
): string {
  const dominant = ([
    ['vento forte', factors.windScore],
    ['correntes intensas', factors.currentScore],
    ['maré alta', factors.tideScore],
    ['alta densidade de poluição', factors.pollutionScore],
  ] as [string, number][])
    .filter(([, v]) => v >= 50)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2)
    .map(([label]) => label)

  const levelLabel = { low: 'baixo', medium: 'moderado', high: 'alto' }[level]

  if (dominant.length === 0) {
    return `Risco ${levelLabel} (score ${score}). Condições oceânicas dentro dos parâmetros normais.`
  }

  return `Risco ${levelLabel} (score ${score}) devido a ${dominant.join(' e ')}.`
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
