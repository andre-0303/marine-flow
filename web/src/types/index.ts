export type BeachRegionStatus = 'active' | 'inactive'

export interface BeachRegion {
  id: string
  name: string
  latitude: number
  longitude: number
  city: string
  status: BeachRegionStatus
}

export type RiskLevel = 'low' | 'medium' | 'high'
export type ForecastHours = 24 | 48 | 72

export interface SimulationInput {
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
  createdAt: string
}

export interface Prediction {
  id: string
  beachRegionId: string
  riskScore: number
  riskLevel: RiskLevel
  explanation: string
  forecastHours: ForecastHours
  createdAt: string
}
