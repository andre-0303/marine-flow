import type { BeachRegion } from '../../entities/BeachRegion.js'

export interface BeachRegionRepository {
  findById(id: string): Promise<BeachRegion | null>
  findAll(): Promise<BeachRegion[]>
}
