import type { FastifyInstance } from 'fastify'
import type { SimulationController } from '../controllers/SimulationController.js'

const createSimulationSchema = {
  body: {
    type: 'object',
    required: ['beachRegionId', 'windSpeed', 'currentStrength', 'tideLevel', 'pollutionDensity', 'forecastHours'],
    additionalProperties: false,
    properties: {
      beachRegionId: { type: 'string', format: 'uuid' },
      windSpeed: { type: 'number', minimum: 0 },
      currentStrength: { type: 'number', minimum: 0 },
      tideLevel: { type: 'number' },
      pollutionDensity: { type: 'number', minimum: 0, maximum: 100 },
      forecastHours: { type: 'number', enum: [24, 48, 72] },
    },
  },
}

export async function simulationRoutes(
  app: FastifyInstance,
  { controller }: { controller: SimulationController },
): Promise<void> {
  app.post('/simulations', { schema: createSimulationSchema }, controller.create.bind(controller))
  app.get('/simulations/:beachRegionId/history', controller.history.bind(controller))
}
