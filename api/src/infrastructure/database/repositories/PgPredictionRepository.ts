import { pool } from '../connection.js'
import type { PredictionRepository } from '../../../domain/ports/out/PredictionRepository.js'
import { Prediction, type RiskLevel, type ForecastHours } from '../../../domain/entities/Prediction.js'

export class PgPredictionRepository implements PredictionRepository {
  async save(prediction: Prediction): Promise<void> {
    await pool.query(
      `INSERT INTO prediction
        (id, beach_region_id, ocean_condition_id, risk_score, risk_level, explanation, forecast_hours, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        prediction.id,
        prediction.beachRegionId,
        prediction.oceanConditionId,
        prediction.riskScore,
        prediction.riskLevel,
        prediction.explanation,
        prediction.forecastHours,
        prediction.createdAt,
      ],
    )
  }

  async findByBeachRegion(beachRegionId: string): Promise<Prediction[]> {
    const { rows } = await pool.query(
      'SELECT * FROM prediction WHERE beach_region_id = $1 ORDER BY created_at DESC',
      [beachRegionId],
    )
    return rows.map(toEntity)
  }
}

function toEntity(row: Record<string, unknown>): Prediction {
  return new Prediction(
    row.id as string,
    row.beach_region_id as string,
    row.ocean_condition_id as string,
    row.risk_score as number,
    row.risk_level as RiskLevel,
    row.explanation as string,
    row.forecast_hours as ForecastHours,
    new Date(row.created_at as string),
  )
}
