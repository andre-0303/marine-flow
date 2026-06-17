import { DomainError } from '../../shared/errors/DomainError.js'

export type BeachRegionStatus = 'active' | 'inactive'

export class BeachRegion {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly latitude: number,
    public readonly longitude: number,
    public readonly city: string,
    public readonly status: BeachRegionStatus,
  ) {
    if (!id) throw new DomainError('BeachRegion: id required')
    if (!name) throw new DomainError('BeachRegion: name required')
    if (latitude < -90 || latitude > 90) throw new DomainError('BeachRegion: latitude must be between -90 and 90')
    if (longitude < -180 || longitude > 180) throw new DomainError('BeachRegion: longitude must be between -180 and 180')
    if (!city) throw new DomainError('BeachRegion: city required')
  }
}
