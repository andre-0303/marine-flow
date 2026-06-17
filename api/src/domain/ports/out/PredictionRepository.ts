import type { Prediction } from '../../entities/Prediction.js'

export interface PredictionRepository {
  save(prediction: Prediction): Promise<void>
  findByBeachRegion(beachRegionId: string): Promise<Prediction[]>
}
