import { describe, it, expect } from 'vitest'
import { OceanCondition } from '../OceanCondition.js'
import { DomainError } from '../../../shared/errors/DomainError.js'

describe('OceanCondition', () => {
  const valid = {
    id: 'cond-1',
    beachRegionId: 'region-1',
    windSpeed: 15,
    currentStrength: 2.5,
    tideLevel: 1.5,
    pollutionDensity: 50,
    createdAt: new Date('2024-01-01'),
  }

  const make = (overrides: Partial<typeof valid> = {}) => {
    const p = { ...valid, ...overrides }
    return new OceanCondition(p.id, p.beachRegionId, p.windSpeed, p.currentStrength, p.tideLevel, p.pollutionDensity, p.createdAt)
  }

  it('cria com dados válidos', () => {
    const cond = make()
    expect(cond.id).toBe(valid.id)
    expect(cond.beachRegionId).toBe(valid.beachRegionId)
    expect(cond.windSpeed).toBe(valid.windSpeed)
    expect(cond.currentStrength).toBe(valid.currentStrength)
    expect(cond.tideLevel).toBe(valid.tideLevel)
    expect(cond.pollutionDensity).toBe(valid.pollutionDensity)
  })

  it('lança DomainError se id vazio', () => {
    expect(() => make({ id: '' })).toThrow(DomainError)
  })

  it('lança DomainError se beachRegionId vazio', () => {
    expect(() => make({ beachRegionId: '' })).toThrow(DomainError)
  })

  it('lança DomainError se windSpeed < 0', () => {
    expect(() => make({ windSpeed: -0.01 })).toThrow(DomainError)
  })

  it('lança DomainError se currentStrength < 0', () => {
    expect(() => make({ currentStrength: -1 })).toThrow(DomainError)
  })

  it('lança DomainError se pollutionDensity < 0', () => {
    expect(() => make({ pollutionDensity: -5 })).toThrow(DomainError)
  })

  it('aceita tideLevel negativo (maré baixa não é validada)', () => {
    expect(() => make({ tideLevel: -3 })).not.toThrow()
  })

  it('aceita todos os campos numéricos em zero', () => {
    expect(() => make({ windSpeed: 0, currentStrength: 0, tideLevel: 0, pollutionDensity: 0 })).not.toThrow()
  })
})
