import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../app.js'
import { seedTestBeachRegion, cleanTestData, TEST_BEACH_REGION_ID } from './helpers/testDb.js'

const UNKNOWN_REGION_ID = '00000000-0000-0000-0000-000000000000'

const validBody = {
  beachRegionId: TEST_BEACH_REGION_ID,
  windSpeed: 15,
  currentStrength: 2,
  tideLevel: 1,
  pollutionDensity: 30,
  forecastHours: 24,
}

describe('Simulations E2E', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildApp()
    await app.ready()
    await seedTestBeachRegion()
  })

  afterAll(async () => {
    await cleanTestData()
    await app.close()
  })

  describe('POST /simulations', () => {
    it('retorna 201 com SimulationOutput no happy path', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: validBody,
      })

      expect(response.statusCode).toBe(201)
      const { data } = response.json<{ data: Record<string, unknown> }>()
      expect(data.predictionId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
      expect(data.beachRegionId).toBe(TEST_BEACH_REGION_ID)
      expect(data.riskScore).toBeGreaterThanOrEqual(0)
      expect(data.riskScore).toBeLessThanOrEqual(100)
      expect(['low', 'medium', 'high']).toContain(data.riskLevel)
      expect(typeof data.explanation).toBe('string')
      expect(data.explanation).toBeTruthy()
      expect(data.forecastHours).toBe(24)
      expect(data.createdAt).toBeTruthy()
    })

    it('retorna 404 se BeachRegion não existe', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: { ...validBody, beachRegionId: UNKNOWN_REGION_ID },
      })

      expect(response.statusCode).toBe(404)
      const body = response.json<{ error: string }>()
      expect(body.error).toContain(UNKNOWN_REGION_ID)
    })

    it('retorna 400 se campo obrigatório está faltando (windSpeed)', async () => {
      const { windSpeed: _omit, ...bodyWithoutWindSpeed } = validBody
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: bodyWithoutWindSpeed,
      })

      expect(response.statusCode).toBe(400)
    })

    it('retorna 400 se forecastHours tem valor inválido (36)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: { ...validBody, forecastHours: 36 },
      })

      expect(response.statusCode).toBe(400)
    })

    it('retorna 400 se beachRegionId não é UUID válido', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: { ...validBody, beachRegionId: 'nao-e-uuid' },
      })

      expect(response.statusCode).toBe(400)
    })

    it('retorna 400 se windSpeed é negativo', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/simulations',
        payload: { ...validBody, windSpeed: -1 },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('GET /simulations/:beachRegionId/history', () => {
    it('retorna 200 com { data: array } para região existente', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/simulations/${TEST_BEACH_REGION_ID}/history`,
      })

      expect(response.statusCode).toBe(200)
      const body = response.json<{ data: unknown[] }>()
      expect(body).toHaveProperty('data')
      expect(Array.isArray(body.data)).toBe(true)
    })

    it('predictions no histórico têm os campos esperados', async () => {
      // cria prediction via POST para garantir que histórico não estará vazio
      await app.inject({ method: 'POST', url: '/simulations', payload: validBody })

      const response = await app.inject({
        method: 'GET',
        url: `/simulations/${TEST_BEACH_REGION_ID}/history`,
      })

      const { data } = response.json<{ data: Record<string, unknown>[] }>()
      expect(data.length).toBeGreaterThan(0)

      const pred = data[0]
      expect(pred).toHaveProperty('id')
      expect(pred).toHaveProperty('beachRegionId')
      expect(pred).toHaveProperty('riskScore')
      expect(pred).toHaveProperty('riskLevel')
      expect(pred).toHaveProperty('explanation')
      expect(pred).toHaveProperty('forecastHours')
      expect(pred).toHaveProperty('createdAt')
    })

    it('predictions retornam ordenadas por createdAt DESC', async () => {
      // cria duas predictions sequenciais
      await app.inject({ method: 'POST', url: '/simulations', payload: { ...validBody, forecastHours: 48 } })
      await app.inject({ method: 'POST', url: '/simulations', payload: { ...validBody, forecastHours: 72 } })

      const response = await app.inject({
        method: 'GET',
        url: `/simulations/${TEST_BEACH_REGION_ID}/history`,
      })

      const { data } = response.json<{ data: { createdAt: string }[] }>()
      expect(data.length).toBeGreaterThanOrEqual(2)

      for (let i = 1; i < data.length; i++) {
        const prev = new Date(data[i - 1].createdAt).getTime()
        const curr = new Date(data[i].createdAt).getTime()
        expect(prev).toBeGreaterThanOrEqual(curr)
      }
    })

    it('retorna 404 se BeachRegion não existe', async () => {
      const response = await app.inject({
        method: 'GET',
        url: `/simulations/${UNKNOWN_REGION_ID}/history`,
      })

      expect(response.statusCode).toBe(404)
      const body = response.json<{ error: string }>()
      expect(body.error).toContain(UNKNOWN_REGION_ID)
    })

    it('retorna 400 se beachRegionId não é UUID válido', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/simulations/nao-e-uuid/history',
      })

      expect(response.statusCode).toBe(400)
    })
  })
})
