import pg from 'pg'

const { Pool } = pg

let _instance: InstanceType<typeof Pool> | undefined

export function getPool(): InstanceType<typeof Pool> {
  if (!_instance) {
    _instance = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return _instance
}
