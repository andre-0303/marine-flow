import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateSimulationUseCaseImpl } from '../CreateSimulationUseCase.js'
import { NotFoundError } from '../../../shared/errors/NotFoundError.js'
import { BeachRegion } from '../../../domain/entities/BeachRegion.js'
import type { BeachRegionRepository } from '../../../domain/ports/out/BeachRegionRepository.js'
import type { OceanConditionRepository } from '../../../domain/ports/out/OceanConditionRepository.js'
import type { PredictionRepository } from '../../../domain/ports/out/PredictionRepository.js'
import type { RiskCalculatorService } from '../../../domain/services/RiskCalculatorService.js'
import type { ForecastHours } from '../../../domain/entities/Prediction.js'

describe('CreateSimulationUseCase', () => {
  let beachRegionRepo: BeachRegionRepository
  let oceanConditionRepo: OceanConditionRepository
  let predictionRepo: PredictionRepository
  let riskCalculator: RiskCalculatorService
  let useCase: CreateSimulationUseCaseImpl

  const mockRegion = new BeachRegion('region-1', 'Copacabana', -22.97, -43.18, 'Rio de Janeiro', 'active')

  const validInput = {
    beachRegionId: 'region-1',
    windSpeed: 15,
    currentStrength: 2,
    tideLevel: 1,
    pollutionDensity: 30,
    forecastHours: 24 as ForecastHours,
  }

  beforeEach(() => {
    beachRegionRepo = {
      findById: vi.fn().mockResolvedValue(mockRegion),
      findAll: vi.fn().mockResolvedValue([]),
    }
    oceanConditionRepo = {
      save: vi.fn().mockResolvedValue(undefined),
    }
    predictionRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findByBeachRegion: vi.fn().mockResolvedValue([]),
    }
    riskCalculator = {
      calculate: vi.fn().mockReturnValue({ score: 35, level: 'low', explanation: 'Risco baixo (score 35).' }),
    }
    useCase = new CreateSimulationUseCaseImpl(beachRegionRepo, oceanConditionRepo, predictionRepo, riskCalculator)
  })

  it('retorna SimulationOutput com dados corretos no happy path', async () => {
    const result = await useCase.execute(validInput)

    expect(result.beachRegionId).toBe('region-1')
    expect(result.riskScore).toBe(35)
    expect(result.riskLevel).toBe('low')
    expect(result.explanation).toBe('Risco baixo (score 35).')
    expect(result.forecastHours).toBe(24)
    expect(result.predictionId).toBeTruthy()
    expect(result.createdAt).toBeInstanceOf(Date)
  })

  it('lança NotFoundError se BeachRegion não existe', async () => {
    vi.mocked(beachRegionRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundError)
    await expect(useCase.execute(validInput)).rejects.toThrow('BeachRegion not found: region-1')
  })

  it('salva OceanCondition com dados do input', async () => {
    await useCase.execute(validInput)

    expect(oceanConditionRepo.save).toHaveBeenCalledOnce()
    const saved = vi.mocked(oceanConditionRepo.save).mock.calls[0][0]
    expect(saved.beachRegionId).toBe('region-1')
    expect(saved.windSpeed).toBe(15)
    expect(saved.currentStrength).toBe(2)
    expect(saved.tideLevel).toBe(1)
    expect(saved.pollutionDensity).toBe(30)
  })

  it('salva Prediction com score e level vindos do RiskCalculatorService', async () => {
    await useCase.execute(validInput)

    expect(predictionRepo.save).toHaveBeenCalledOnce()
    const saved = vi.mocked(predictionRepo.save).mock.calls[0][0]
    expect(saved.riskScore).toBe(35)
    expect(saved.riskLevel).toBe('low')
    expect(saved.forecastHours).toBe(24)
    expect(saved.beachRegionId).toBe('region-1')
  })

  it('passa a OceanCondition criada para o RiskCalculatorService', async () => {
    await useCase.execute(validInput)

    expect(riskCalculator.calculate).toHaveBeenCalledOnce()
    const conditionArg = vi.mocked(riskCalculator.calculate).mock.calls[0][0]
    expect(conditionArg.beachRegionId).toBe('region-1')
    expect(conditionArg.windSpeed).toBe(15)
    expect(conditionArg.currentStrength).toBe(2)
  })

  it('não salva Prediction se BeachRegion não existe', async () => {
    vi.mocked(beachRegionRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute(validInput)).rejects.toThrow(NotFoundError)
    expect(predictionRepo.save).not.toHaveBeenCalled()
    expect(oceanConditionRepo.save).not.toHaveBeenCalled()
  })
})
