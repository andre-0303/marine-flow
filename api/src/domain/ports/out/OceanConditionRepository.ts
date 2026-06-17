import type { OceanCondition } from '../../entities/OceanCondition.js'

export interface OceanConditionRepository {
  save(condition: OceanCondition): Promise<void>
}
