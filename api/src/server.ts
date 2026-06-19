import { config } from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../../.env') })

import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { PgBeachRegionRepository } from './infrastructure/database/repositories/PgBeachRegionRepository.js'
import { PgOceanConditionRepository } from './infrastructure/database/repositories/PgOceanConditionRepository.js'
import { PgPredictionRepository } from './infrastructure/database/repositories/PgPredictionRepository.js'
import { RiskCalculatorServiceImpl } from './domain/services/RiskCalculatorService.js'
import { CreateSimulationUseCaseImpl } from './application/use-cases/CreateSimulationUseCase.js'
import { GetPredictionHistoryUseCaseImpl } from './application/use-cases/GetPredictionHistoryUseCase.js'
import { BeachRegionController } from './infrastructure/http/controllers/BeachRegionController.js'
import { SimulationController } from './infrastructure/http/controllers/SimulationController.js'
import { beachRegionRoutes } from './infrastructure/http/routes/beachRegion.routes.js'
import { simulationRoutes } from './infrastructure/http/routes/simulation.routes.js'
import { NotFoundError } from './shared/errors/NotFoundError.js'
import { DomainError } from './shared/errors/DomainError.js'

const app = Fastify({ logger: true })

// --- Composition root ---
const beachRegionRepo = new PgBeachRegionRepository()
const oceanConditionRepo = new PgOceanConditionRepository()
const predictionRepo = new PgPredictionRepository()
const riskCalculator = new RiskCalculatorServiceImpl()

const createSimulation = new CreateSimulationUseCaseImpl(
  beachRegionRepo,
  oceanConditionRepo,
  predictionRepo,
  riskCalculator,
)
const getPredictionHistory = new GetPredictionHistoryUseCaseImpl(beachRegionRepo, predictionRepo)

const beachRegionController = new BeachRegionController(beachRegionRepo)
const simulationController = new SimulationController(createSimulation, getPredictionHistory)

// --- Error handler ---
app.setErrorHandler((error, _req, reply) => {
  if (error instanceof NotFoundError) {
    return reply.status(404).send({ error: error.message })
  }
  if (error instanceof DomainError) {
    return reply.status(422).send({ error: error.message })
  }
  if (error.validation) {
    return reply.status(400).send({ error: 'Validation error', details: error.validation })
  }
  app.log.error(error)
  return reply.status(500).send({ error: 'Internal server error' })
})

// --- Swagger ---
app.register(swagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'MarineFlow API',
      description: 'Plataforma preditiva de monitoramento costeiro — previsão de acúmulo de resíduos marinhos no litoral do Rio de Janeiro.',
      version: '1.0.0',
    },
    tags: [
      { name: 'Health', description: 'Verificação de disponibilidade da API' },
      { name: 'Beach Regions', description: 'Regiões costeiras monitoradas' },
      { name: 'Simulations', description: 'Simulações de risco e histórico de predições' },
    ],
  },
})

app.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list', deepLinking: false },
})

// --- Shared schemas ---
app.addSchema({
  $id: 'BeachRegion',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string' },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
    city: { type: 'string' },
    status: { type: 'string', enum: ['active', 'inactive'] },
  },
})

app.addSchema({
  $id: 'Prediction',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    beachRegionId: { type: 'string', format: 'uuid' },
    oceanConditionId: { type: 'string', format: 'uuid' },
    riskScore: { type: 'number', minimum: 0, maximum: 100 },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    explanation: { type: 'string' },
    forecastHours: { type: 'number', enum: [24, 48, 72] },
    createdAt: { type: 'string', format: 'date-time' },
  },
})

app.addSchema({
  $id: 'SimulationOutput',
  type: 'object',
  properties: {
    predictionId: { type: 'string', format: 'uuid' },
    beachRegionId: { type: 'string', format: 'uuid' },
    riskScore: { type: 'number', minimum: 0, maximum: 100 },
    riskLevel: { type: 'string', enum: ['low', 'medium', 'high'] },
    explanation: { type: 'string' },
    forecastHours: { type: 'number', enum: [24, 48, 72] },
    createdAt: { type: 'string', format: 'date-time' },
  },
})

app.addSchema({
  $id: 'ApiError',
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
})

// --- Routes ---
app.get('/health', {
  schema: {
    tags: ['Health'],
    summary: 'Health check',
    response: {
      200: {
        type: 'object',
        properties: { status: { type: 'string' } },
      },
    },
  },
}, async () => ({ status: 'ok' }))

app.register(beachRegionRoutes, { controller: beachRegionController })
app.register(simulationRoutes, { controller: simulationController })

// --- Start ---
const port = Number(process.env.PORT) || 3333

app.listen({ port, host: '0.0.0.0' }, (err) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
})
