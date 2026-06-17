import type { ForecastHours, RiskLevel } from '../../entities/Prediction.js'

export interface CreateSimulationInput {
  beachRegionId: string
  windSpeed: number
  currentStrength: number
  tideLevel: number
  pollutionDensity: number
  forecastHours: ForecastHours
}

export interface SimulationOutput {
  predictionId: string
  beachRegionId: string
  riskScore: number
  riskLevel: RiskLevel
  explanation: string
  forecastHours: ForecastHours
  createdAt: Date
}

export interface CreateSimulationUseCase {
  execute(input: CreateSimulationInput): Promise<SimulationOutput>
}
