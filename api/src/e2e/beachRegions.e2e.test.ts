import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '../app.js'

describe('GET /beach-regions', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = buildApp()
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('retorna 200 com shape { data: array }', async () => {
    const response = await app.inject({ method: 'GET', url: '/beach-regions' })

    expect(response.statusCode).toBe(200)
    const body = response.json<{ data: unknown[] }>()
    expect(body).toHaveProperty('data')
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('cada região tem os campos esperados', async () => {
    const response = await app.inject({ method: 'GET', url: '/beach-regions' })
    const { data } = response.json<{ data: Record<string, unknown>[] }>()

    if (data.length === 0) return // DB vazio é válido em ambiente de test

    const region = data[0]
    expect(region).toHaveProperty('id')
    expect(region).toHaveProperty('name')
    expect(region).toHaveProperty('latitude')
    expect(region).toHaveProperty('longitude')
    expect(region).toHaveProperty('city')
    expect(region).toHaveProperty('status')
  })
})
