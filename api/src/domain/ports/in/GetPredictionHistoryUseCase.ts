import type { Prediction } from '../../entities/Prediction.js'

export interface GetPredictionHistoryUseCase {
  execute(beachRegionId: string): Promise<Prediction[]>
}
