import { pool } from '../connection.js'
import type { OceanConditionRepository } from '../../../domain/ports/out/OceanConditionRepository.js'
import type { OceanCondition } from '../../../domain/entities/OceanCondition.js'

export class PgOceanConditionRepository implements OceanConditionRepository {
  async save(condition: OceanCondition): Promise<void> {
    await pool.query(
      `INSERT INTO ocean_condition
        (id, beach_region_id, wind_speed, current_strength, tide_level, pollution_density, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        condition.id,
        condition.beachRegionId,
        condition.windSpeed,
        condition.currentStrength,
        condition.tideLevel,
        condition.pollutionDensity,
        condition.createdAt,
      ],
    )
  }
}
