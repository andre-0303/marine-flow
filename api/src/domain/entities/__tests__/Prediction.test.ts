import { describe, it, expect } from 'vitest'
import { Prediction } from '../Prediction.js'
import { DomainError } from '../../../shared/errors/DomainError.js'
import type { ForecastHours } from '../Prediction.js'

describe('Prediction', () => {
  const valid = {
    id: 'pred-1',
    beachRegionId: 'region-1',
    oceanConditionId: 'cond-1',
    riskScore: 50,
    riskLevel: 'medium' as const,
    explanation: 'Risco moderado (score 50).',
    forecastHours: 24 as ForecastHours,
    createdAt: new Date('2024-01-01'),
  }

  const make = (overrides: Partial<typeof valid> = {}) => {
    const p = { ...valid, ...overrides }
    return new Prediction(p.id, p.beachRegionId, p.oceanConditionId, p.riskScore, p.riskLevel, p.explanation, p.forecastHours, p.createdAt)
  }

  it('cria com dados válidos', () => {
    const pred = make()
    expect(pred.id).toBe(valid.id)
    expect(pred.riskScore).toBe(50)
    expect(pred.riskLevel).toBe('medium')
    expect(pred.forecastHours).toBe(24)
  })

  it('lança DomainError se id vazio', () => {
    expect(() => make({ id: '' })).toThrow(DomainError)
  })

  it('lança DomainError se beachRegionId vazio', () => {
    expect(() => make({ beachRegionId: '' })).toThrow(DomainError)
  })

  it('lança DomainError se oceanConditionId vazio', () => {
    expect(() => make({ oceanConditionId: '' })).toThrow(DomainError)
  })

  it.each([0, 100])('aceita riskScore no limite %s', (riskScore) => {
    expect(() => make({ riskScore })).not.toThrow()
  })

  it.each([-1, 101])('lança DomainError se riskScore = %s', (riskScore) => {
    expect(() => make({ riskScore })).toThrow(DomainError)
  })

  it.each([24, 48, 72] as ForecastHours[])('aceita forecastHours válido: %s', (forecastHours) => {
    expect(() => make({ forecastHours })).not.toThrow()
  })

  it.each([0, 12, 36, 96])('lança DomainError se forecastHours = %s', (forecastHours) => {
    expect(() => make({ forecastHours: forecastHours as ForecastHours })).toThrow(DomainError)
  })
})
