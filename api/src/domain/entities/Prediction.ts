import { DomainError } from '../../shared/errors/DomainError.js'

export type RiskLevel = 'low' | 'medium' | 'high'
export type ForecastHours = 24 | 48 | 72

export class Prediction {
  constructor(
    public readonly id: string,
    public readonly beachRegionId: string,
    public readonly oceanConditionId: string,
    public readonly riskScore: number,
    public readonly riskLevel: RiskLevel,
    public readonly explanation: string,
    public readonly forecastHours: ForecastHours,
    public readonly createdAt: Date,
  ) {
    if (!id) throw new DomainError('Prediction: id required')
    if (!beachRegionId) throw new DomainError('Prediction: beachRegionId required')
    if (!oceanConditionId) throw new DomainError('Prediction: oceanConditionId required')
    if (riskScore < 0 || riskScore > 100) throw new DomainError('Prediction: riskScore must be between 0 and 100')
    if (![24, 48, 72].includes(forecastHours)) throw new DomainError('Prediction: forecastHours must be 24, 48, or 72')
  }
}
