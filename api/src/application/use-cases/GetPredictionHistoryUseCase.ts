import type { GetPredictionHistoryUseCase } from '../../domain/ports/in/GetPredictionHistoryUseCase.js'
import type { BeachRegionRepository } from '../../domain/ports/out/BeachRegionRepository.js'
import type { PredictionRepository } from '../../domain/ports/out/PredictionRepository.js'
import type { Prediction } from '../../domain/entities/Prediction.js'
import { NotFoundError } from '../../shared/errors/NotFoundError.js'

export class GetPredictionHistoryUseCaseImpl implements GetPredictionHistoryUseCase {
  constructor(
    private readonly beachRegionRepository: BeachRegionRepository,
    private readonly predictionRepository: PredictionRepository,
  ) {}

  async execute(beachRegionId: string): Promise<Prediction[]> {
    const region = await this.beachRegionRepository.findById(beachRegionId)
    if (!region) {
      throw new NotFoundError('BeachRegion', beachRegionId)
    }

    const predictions = await this.predictionRepository.findByBeachRegion(beachRegionId)

    return predictions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }
}
