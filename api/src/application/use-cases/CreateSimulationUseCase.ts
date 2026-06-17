import { v4 as uuid } from 'uuid'
import type { CreateSimulationInput, CreateSimulationUseCase, SimulationOutput } from '../../domain/ports/in/CreateSimulationUseCase.js'
import type { BeachRegionRepository } from '../../domain/ports/out/BeachRegionRepository.js'
import type { OceanConditionRepository } from '../../domain/ports/out/OceanConditionRepository.js'
import type { PredictionRepository } from '../../domain/ports/out/PredictionRepository.js'
import type { RiskCalculatorService } from '../../domain/services/RiskCalculatorService.js'
import { OceanCondition } from '../../domain/entities/OceanCondition.js'
import { Prediction } from '../../domain/entities/Prediction.js'
import { NotFoundError } from '../../shared/errors/NotFoundError.js'

export class CreateSimulationUseCaseImpl implements CreateSimulationUseCase {
  constructor(
    private readonly beachRegionRepository: BeachRegionRepository,
    private readonly oceanConditionRepository: OceanConditionRepository,
    private readonly predictionRepository: PredictionRepository,
    private readonly riskCalculatorService: RiskCalculatorService,
  ) {}

  async execute(input: CreateSimulationInput): Promise<SimulationOutput> {
    const region = await this.beachRegionRepository.findById(input.beachRegionId)
    if (!region) {
      throw new NotFoundError('BeachRegion', input.beachRegionId)
    }

    const condition = new OceanCondition(
      uuid(),
      input.beachRegionId,
      input.windSpeed,
      input.currentStrength,
      input.tideLevel,
      input.pollutionDensity,
      new Date(),
    )

    await this.oceanConditionRepository.save(condition)

    const { score, level, explanation } = this.riskCalculatorService.calculate(condition)

    const prediction = new Prediction(
      uuid(),
      input.beachRegionId,
      condition.id,
      score,
      level,
      explanation,
      input.forecastHours,
      new Date(),
    )

    await this.predictionRepository.save(prediction)

    return {
      predictionId: prediction.id,
      beachRegionId: prediction.beachRegionId,
      riskScore: prediction.riskScore,
      riskLevel: prediction.riskLevel,
      explanation: prediction.explanation,
      forecastHours: prediction.forecastHours,
      createdAt: prediction.createdAt,
    }
  }
}
