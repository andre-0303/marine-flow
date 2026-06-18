import type { FastifyInstance } from 'fastify'
import type { BeachRegionController } from '../controllers/BeachRegionController.js'

export async function beachRegionRoutes(
  app: FastifyInstance,
  { controller }: { controller: BeachRegionController },
): Promise<void> {
  app.get('/beach-regions', controller.listAll.bind(controller))
}
