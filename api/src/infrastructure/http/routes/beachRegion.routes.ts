import type { FastifyInstance } from 'fastify'
import type { BeachRegionController } from '../controllers/BeachRegionController.js'

export async function beachRegionRoutes(
  app: FastifyInstance,
  { controller }: { controller: BeachRegionController },
): Promise<void> {
  app.get('/beach-regions', {
    schema: {
      tags: ['Beach Regions'],
      summary: 'Lista todas as regiões costeiras',
      response: {
        200: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: 'BeachRegion#' } },
          },
        },
      },
    },
  }, controller.listAll.bind(controller))
}
