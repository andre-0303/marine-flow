import { DomainError } from '../../shared/errors/DomainError.js'

export class OceanCondition {
  constructor(
    public readonly id: string,
    public readonly beachRegionId: string,
    public readonly windSpeed: number,
    public readonly currentStrength: number,
    public readonly tideLevel: number,
    public readonly pollutionDensity: number,
    public readonly createdAt: Date,
  ) {
    if (!id) throw new DomainError('OceanCondition: id required')
    if (!beachRegionId) throw new DomainError('OceanCondition: beachRegionId required')
    if (windSpeed < 0) throw new DomainError('OceanCondition: windSpeed must be >= 0')
    if (currentStrength < 0) throw new DomainError('OceanCondition: currentStrength must be >= 0')
    if (pollutionDensity < 0) throw new DomainError('OceanCondition: pollutionDensity must be >= 0')
  }
}
