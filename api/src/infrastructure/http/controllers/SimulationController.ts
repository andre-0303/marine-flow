import type { FastifyRequest, FastifyReply } from 'fastify'
import type { CreateSimulationUseCase, CreateSimulationInput } from '../../../domain/ports/in/CreateSimulationUseCase.js'
import type { GetPredictionHistoryUseCase } from '../../../domain/ports/in/GetPredictionHistoryUseCase.js'

export class SimulationController {
  constructor(
    private readonly createSimulation: CreateSimulationUseCase,
    private readonly getPredictionHistory: GetPredictionHistoryUseCase,
  ) {}

  async create(
    req: FastifyRequest<{ Body: CreateSimulationInput }>,
    reply: FastifyReply,
  ): Promise<void> {
    const result = await this.createSimulation.execute(req.body)
    reply.status(201).send({ data: result })
  }

  async history(
    req: FastifyRequest<{ Params: { beachRegionId: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const predictions = await this.getPredictionHistory.execute(req.params.beachRegionId)
    reply.send({ data: predictions })
  }
}
