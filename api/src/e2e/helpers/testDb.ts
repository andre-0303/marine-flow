import { getPool } from '../../infrastructure/database/connection.js'

export const TEST_BEACH_REGION_ID = '00000000-0000-0000-0000-0000000000e2'

export async function seedTestBeachRegion(): Promise<void> {
  await getPool().query(
    `INSERT INTO beach_region (id, name, latitude, longitude, city, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [TEST_BEACH_REGION_ID, 'Praia de Teste E2E', -22.97, -43.18, 'Rio de Janeiro', 'active'],
  )
}

export async function cleanTestData(): Promise<void> {
  const pool = getPool()
  await pool.query('DELETE FROM prediction WHERE beach_region_id = $1', [TEST_BEACH_REGION_ID])
  await pool.query('DELETE FROM ocean_condition WHERE beach_region_id = $1', [TEST_BEACH_REGION_ID])
  await pool.query('DELETE FROM beach_region WHERE id = $1', [TEST_BEACH_REGION_ID])
}
