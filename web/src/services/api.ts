import axios from 'axios'
import type { BeachRegion, SimulationInput, SimulationOutput, Prediction } from '@/types'

const client = axios.create({ baseURL: '/api' })

export async function fetchBeachRegions(): Promise<BeachRegion[]> {
  const { data } = await client.get<{ data: BeachRegion[] }>('/beach-regions')
  return data.data
}

export async function createSimulation(input: SimulationInput): Promise<SimulationOutput> {
  const { data } = await client.post<{ data: SimulationOutput }>('/simulations', input)
  return data.data
}

export async function fetchHistory(beachRegionId: string): Promise<Prediction[]> {
  const { data } = await client.get<{ data: Prediction[] }>(`/simulations/${beachRegionId}/history`)
  return data.data
}
