import type { FastifyInstance } from 'fastify'
import type { SimulationController } from '../controllers/SimulationController.js'

const createSimulationSchema = {
  tags: ['Simulations'],
  summary: 'Cria simulação e retorna predição de risco',
  body: {
    type: 'object',
    required: ['beachRegionId', 'windSpeed', 'currentStrength', 'tideLevel', 'pollutionDensity', 'forecastHours'],
    additionalProperties: false,
    properties: {
      beachRegionId: { type: 'string', format: 'uuid' },
      windSpeed: { type: 'number', minimum: 0, description: 'Velocidade do vento em km/h' },
      currentStrength: { type: 'number', minimum: 0, description: 'Força da corrente em nós' },
      tideLevel: { type: 'number', description: 'Nível da maré em metros (negativo = maré baixa)' },
      pollutionDensity: { type: 'number', minimum: 0, maximum: 100, description: 'Densidade de poluição (0–100)' },
      forecastHours: { type: 'number', enum: [24, 48, 72], description: 'Janela de previsão em horas' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: { data: { $ref: 'SimulationOutput#' } },
    },
    404: { $ref: 'ApiError#' },
    422: { $ref: 'ApiError#' },
  },
}

const historySchema = {
  tags: ['Simulations'],
  summary: 'Histórico de predições de uma região costeira',
  params: {
    type: 'object',
    required: ['beachRegionId'],
    properties: {
      beachRegionId: { type: 'string', format: 'uuid', description: 'ID da região costeira' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: { data: { type: 'array', items: { $ref: 'Prediction#' } } },
    },
    404: { $ref: 'ApiError#' },
  },
}

export async function simulationRoutes(
  app: FastifyInstance,
  { controller }: { controller: SimulationController },
): Promise<void> {
  app.post('/simulations', { schema: createSimulationSchema }, controller.create.bind(controller))
  app.get('/simulations/:beachRegionId/history', { schema: historySchema }, controller.history.bind(controller))
}
