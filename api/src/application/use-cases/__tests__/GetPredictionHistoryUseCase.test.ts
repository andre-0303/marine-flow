import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetPredictionHistoryUseCaseImpl } from '../GetPredictionHistoryUseCase.js'
import { NotFoundError } from '../../../shared/errors/NotFoundError.js'
import { BeachRegion } from '../../../domain/entities/BeachRegion.js'
import { Prediction } from '../../../domain/entities/Prediction.js'
import type { BeachRegionRepository } from '../../../domain/ports/out/BeachRegionRepository.js'
import type { PredictionRepository } from '../../../domain/ports/out/PredictionRepository.js'

describe('GetPredictionHistoryUseCase', () => {
  let beachRegionRepo: BeachRegionRepository
  let predictionRepo: PredictionRepository
  let useCase: GetPredictionHistoryUseCaseImpl

  const mockRegion = new BeachRegion('region-1', 'Copacabana', -22.97, -43.18, 'Rio de Janeiro', 'active')

  const makePrediction = (id: string, createdAt: Date) =>
    new Prediction(id, 'region-1', 'cond-1', 50, 'medium', 'Risco moderado (score 50).', 24, createdAt)

  beforeEach(() => {
    beachRegionRepo = {
      findById: vi.fn().mockResolvedValue(mockRegion),
      findAll: vi.fn().mockResolvedValue([]),
    }
    predictionRepo = {
      save: vi.fn().mockResolvedValue(undefined),
      findByBeachRegion: vi.fn().mockResolvedValue([]),
    }
    useCase = new GetPredictionHistoryUseCaseImpl(beachRegionRepo, predictionRepo)
  })

  it('retorna lista vazia se não há predictions', async () => {
    const result = await useCase.execute('region-1')
    expect(result).toEqual([])
  })

  it('lança NotFoundError se BeachRegion não existe', async () => {
    vi.mocked(beachRegionRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute('region-1')).rejects.toThrow(NotFoundError)
    await expect(useCase.execute('region-1')).rejects.toThrow('BeachRegion not found: region-1')
  })

  it('retorna predictions ordenadas por createdAt DESC', async () => {
    const older = makePrediction('pred-1', new Date('2024-01-01'))
    const middle = makePrediction('pred-2', new Date('2024-06-01'))
    const newest = makePrediction('pred-3', new Date('2024-12-01'))
    vi.mocked(predictionRepo.findByBeachRegion).mockResolvedValue([older, newest, middle])

    const result = await useCase.execute('region-1')

    expect(result[0].id).toBe('pred-3')
    expect(result[1].id).toBe('pred-2')
    expect(result[2].id).toBe('pred-1')
  })

  it('busca predictions pelo beachRegionId correto', async () => {
    await useCase.execute('region-1')
    expect(predictionRepo.findByBeachRegion).toHaveBeenCalledWith('region-1')
  })

  it('não consulta predictions se BeachRegion não existe', async () => {
    vi.mocked(beachRegionRepo.findById).mockResolvedValue(null)

    await expect(useCase.execute('region-1')).rejects.toThrow(NotFoundError)
    expect(predictionRepo.findByBeachRegion).not.toHaveBeenCalled()
  })
})
