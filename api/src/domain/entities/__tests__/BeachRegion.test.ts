import { describe, it, expect } from 'vitest'
import { BeachRegion } from '../BeachRegion.js'
import { DomainError } from '../../../shared/errors/DomainError.js'

describe('BeachRegion', () => {
  const valid = {
    id: 'region-1',
    name: 'Praia de Copacabana',
    latitude: -22.97,
    longitude: -43.18,
    city: 'Rio de Janeiro',
    status: 'active' as const,
  }

  const make = (overrides: Partial<typeof valid> = {}) => {
    const p = { ...valid, ...overrides }
    return new BeachRegion(p.id, p.name, p.latitude, p.longitude, p.city, p.status)
  }

  it('cria com dados válidos', () => {
    const region = make()
    expect(region.id).toBe(valid.id)
    expect(region.name).toBe(valid.name)
    expect(region.latitude).toBe(valid.latitude)
    expect(region.longitude).toBe(valid.longitude)
    expect(region.city).toBe(valid.city)
    expect(region.status).toBe(valid.status)
  })

  it('lança DomainError se id vazio', () => {
    expect(() => make({ id: '' })).toThrow(DomainError)
  })

  it('lança DomainError se name vazio', () => {
    expect(() => make({ name: '' })).toThrow(DomainError)
  })

  it('lança DomainError se city vazia', () => {
    expect(() => make({ city: '' })).toThrow(DomainError)
  })

  it.each([-91, 91, -90.001, 90.001])('lança DomainError se latitude = %s', (latitude) => {
    expect(() => make({ latitude })).toThrow(DomainError)
  })

  it.each([-181, 181, -180.001, 180.001])('lança DomainError se longitude = %s', (longitude) => {
    expect(() => make({ longitude })).toThrow(DomainError)
  })

  it('aceita latitude nos limites exatos -90 e 90', () => {
    expect(() => make({ latitude: -90 })).not.toThrow()
    expect(() => make({ latitude: 90 })).not.toThrow()
  })

  it('aceita longitude nos limites exatos -180 e 180', () => {
    expect(() => make({ longitude: -180 })).not.toThrow()
    expect(() => make({ longitude: 180 })).not.toThrow()
  })
})
