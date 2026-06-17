import { pool } from '../connection.js'
import type { BeachRegionRepository } from '../../../domain/ports/out/BeachRegionRepository.js'
import { BeachRegion, type BeachRegionStatus } from '../../../domain/entities/BeachRegion.js'

export class PgBeachRegionRepository implements BeachRegionRepository {
  async findById(id: string): Promise<BeachRegion | null> {
    const { rows } = await pool.query('SELECT * FROM beach_region WHERE id = $1', [id])
    if (rows.length === 0) return null
    return toEntity(rows[0])
  }

  async findAll(): Promise<BeachRegion[]> {
    const { rows } = await pool.query('SELECT * FROM beach_region ORDER BY name')
    return rows.map(toEntity)
  }
}

function toEntity(row: Record<string, unknown>): BeachRegion {
  return new BeachRegion(
    row.id as string,
    row.name as string,
    Number(row.latitude),
    Number(row.longitude),
    row.city as string,
    row.status as BeachRegionStatus,
  )
}
