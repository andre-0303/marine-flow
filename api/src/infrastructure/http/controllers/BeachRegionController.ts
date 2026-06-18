import type { FastifyRequest, FastifyReply } from 'fastify'
import type { BeachRegionRepository } from '../../../domain/ports/out/BeachRegionRepository.js'

export class BeachRegionController {
  constructor(private readonly beachRegionRepository: BeachRegionRepository) {}

  async listAll(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const regions = await this.beachRegionRepository.findAll()
    reply.send({ data: regions })
  }
}
