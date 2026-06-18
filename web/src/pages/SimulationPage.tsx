import { useState, useEffect, useCallback } from 'react'
import type { BeachRegion, SimulationOutput, Prediction, ForecastHours } from '@/types'
import { fetchBeachRegions, createSimulation, fetchHistory } from '@/services/api'
import Sidebar from '@/components/Sidebar'

const TIDE_OPTIONS = [
  { label: 'Baixa', value: -1 },
  { label: 'Média', value: 0 },
  { label: 'Alta', value: 1 },
]

const FORECAST_OPTIONS: { label: string; value: ForecastHours }[] = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '72h', value: 72 },
]

const RISK_CONFIG = {
  low:    { label: 'Baixo', bg: 'var(--color-teal-50)',  color: 'var(--color-teal-700)', badge: 'var(--color-teal-700)', badgeBg: 'var(--color-teal-50)' },
  medium: { label: 'Médio', bg: 'var(--color-warn-50)',  color: 'var(--color-warn-600)', badge: 'var(--color-warn-600)', badgeBg: 'var(--color-warn-50)' },
  high:   { label: 'Alto',  bg: 'var(--color-risk-50)',  color: 'var(--color-risk-600)', badge: 'var(--color-risk-600)', badgeBg: 'var(--color-risk-50)' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function SimulationPage() {
  const [regions, setRegions] = useState<BeachRegion[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [windSpeed, setWindSpeed] = useState(30)
  const [currentStrength, setCurrentStrength] = useState(3)
  const [tideLevel, setTideLevel] = useState(0)
  const [pollutionDensity, setPollutionDensity] = useState(5)
  const [forecastHours, setForecastHours] = useState<ForecastHours>(24)
  const [result, setResult] = useState<SimulationOutput | null>(null)
  const [history, setHistory] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [apiOnline, setApiOnline] = useState<boolean | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health')
        setApiOnline(res.ok)
      } catch {
        setApiOnline(false)
      }
    }
    checkHealth()
    const id = setInterval(checkHealth, 10000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    fetchBeachRegions()
      .then(data => {
        setRegions(data)
        if (data.length > 0) setSelectedRegionId(data[0].id)
      })
      .catch(() => {})
  }, [])

  const loadHistory = useCallback((regionId: string) => {
    if (!regionId) return
    fetchHistory(regionId).then(setHistory).catch(() => setHistory([]))
  }, [])

  useEffect(() => {
    loadHistory(selectedRegionId)
  }, [selectedRegionId, loadHistory])

  const selectedRegion = regions.find(r => r.id === selectedRegionId)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRegionId) return
    setLoading(true)
    setError(null)
    try {
      const output = await createSimulation({
        beachRegionId: selectedRegionId,
        windSpeed,
        currentStrength,
        tideLevel,
        pollutionDensity: pollutionDensity * 10,
        forecastHours,
      })
      setResult(output)
      loadHistory(selectedRegionId)
    } catch {
      setError('Erro ao executar simulação. Verifique se o servidor está rodando.')
    } finally {
      setLoading(false)
    }
  }

  const riskCfg = result ? RISK_CONFIG[result.riskLevel] : null

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg-page)]">
      <Sidebar
        regions={regions}
        selectedId={selectedRegionId}
        onSelect={setSelectedRegionId}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-ocean-900"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base md:text-lg font-semibold text-ocean-900">
                Simulação Ambiental
              </h1>
              <p className="text-xs md:text-sm hidden sm:block text-slate-500">
                {selectedRegion ? `${selectedRegion.name} — ${selectedRegion.city}` : 'Selecione uma região'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{
                backgroundColor:
                  apiOnline === null ? '#f59e0b' :
                  apiOnline ? '#22c55e' : 'var(--color-risk-400)',
              }}
            />
            <span className="text-xs md:text-sm text-slate-500">
              {apiOnline === null ? 'Verificando...' : apiOnline ? 'API conectada' : 'API desconectada'}
            </span>
          </div>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-8 py-4">
          <StatCard label="Regiões Monitoradas" value={regions.length.toString()} sub="ativas" color="var(--color-ocean-700)" />
          <StatCard
            label="Última Simulação"
            value={history[0] ? formatDate(history[0].createdAt).split(',')[0] : '—'}
            sub="data"
            color="var(--color-teal-700)"
          />
          <StatCard
            label="Risco Atual"
            value={history[0] ? RISK_CONFIG[history[0].riskLevel].label : '—'}
            sub={history[0] ? `score ${history[0].riskScore}` : 'sem dados'}
            color={history[0] ? RISK_CONFIG[history[0].riskLevel].color : 'var(--color-text-muted)'}
          />
          <StatCard label="Simulações Totais" value={history.length.toString()} sub="nesta região" color="var(--color-warn-600)" />
        </div>

        {/* Form + Result */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 md:px-8 pb-4">
          {/* Form panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-base font-semibold mb-5 text-ocean-900">
              Parâmetros da Simulação
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Region select — visible on mobile since sidebar is hidden */}
              <div className="lg:hidden">
                <label htmlFor="region-select" className="block text-sm font-medium mb-2 text-gray-700">
                  Região Costeira
                </label>
                <select
                  id="region-select"
                  value={selectedRegionId}
                  onChange={e => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-slate-50 focus:outline-none focus:ring-2"
                >
                  <option value="" disabled>Selecione uma região</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id}>{r.name} — {r.city}</option>
                  ))}
                </select>
              </div>

              <SliderField
                label="Velocidade do Vento"
                value={windSpeed}
                min={0} max={100}
                unit="km/h"
                trackColor="var(--color-ocean-700)"
                onChange={setWindSpeed}
              />

              <SliderField
                label="Força da Corrente"
                value={currentStrength}
                min={0} max={10}
                unit="nós"
                trackColor="var(--color-ocean-700)"
                onChange={setCurrentStrength}
              />

              <SliderField
                label="Densidade de Resíduos"
                value={pollutionDensity}
                min={0} max={10}
                unit="/10"
                trackColor="var(--color-risk-400)"
                onChange={setPollutionDensity}
              />

              {/* Tide */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nível da Maré
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {TIDE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTideLevel(opt.value)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        tideLevel === opt.value
                          ? 'bg-ocean-700 text-white'
                          : 'bg-slate-50 text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forecast hours */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Horizonte de Previsão
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {FORECAST_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForecastHours(opt.value)}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        forecastHours === opt.value
                          ? 'bg-ocean-700 text-white'
                          : 'bg-slate-50 text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm rounded-lg px-3 py-2 bg-risk-50 text-risk-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !selectedRegionId}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white bg-ocean-700 transition-opacity disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                    Simulando...
                  </span>
                ) : 'Executar Simulação'}
              </button>
            </form>
          </div>

          {/* Result panel */}
          <div className="flex flex-col gap-4 lg:w-[380px] lg:shrink-0">
            {/* Result card */}
            <div
              className="bg-white rounded-xl border p-4 md:p-6 flex flex-col gap-4 transition-all duration-300"
              style={riskCfg ? { borderColor: riskCfg.color } : { borderColor: 'var(--color-border-subtle)' }}
            >
              <h2 className="text-base font-semibold text-ocean-900">
                Resultado da Simulação
              </h2>

              {result && riskCfg ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium mb-1 text-slate-500">Nível de Risco</p>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: riskCfg.badgeBg, color: riskCfg.badge }}
                      >
                        {riskCfg.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium mb-1 text-slate-500">Score</p>
                      <p className="text-3xl font-bold" style={{ color: riskCfg.color }}>
                        {result.riskScore}
                      </p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${result.riskScore}%`, backgroundColor: riskCfg.color }}
                    />
                  </div>

                  <div className="rounded-lg p-3" style={{ backgroundColor: riskCfg.bg }}>
                    <p className="text-sm leading-relaxed" style={{ color: riskCfg.color }}>
                      {result.explanation}
                    </p>
                  </div>

                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Previsão: {result.forecastHours}h</span>
                    <span>{formatDate(result.createdAt)}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-slate-400">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  <p className="text-sm text-center">Execute uma simulação para ver os resultados</p>
                </div>
              )}
            </div>

            {/* Monitored regions — hidden on mobile (sidebar already handles this) */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4 flex-1">
              <h3 className="text-sm font-semibold mb-3 text-ocean-900">
                Regiões Monitoradas
              </h3>
              <div className="flex flex-col gap-1">
                {regions.map(r => (
                  <button
                    key={r.id}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors ${
                      r.id === selectedRegionId ? 'bg-ocean-50' : ''
                    }`}
                    onClick={() => setSelectedRegionId(r.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          r.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700">{r.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">{r.city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="mx-4 md:mx-8 mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-ocean-900">
              Histórico de Simulações
            </h2>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-slate-400">
              Nenhuma simulação encontrada para esta região.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50">
                    {['Data', 'Previsão', 'Score', 'Risco', 'Explicação'].map(h => (
                      <th
                        key={h}
                        className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map(p => {
                    const cfg = RISK_CONFIG[p.riskLevel]
                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 md:px-6 py-3 whitespace-nowrap text-gray-700">
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-3 text-gray-700">
                          {p.forecastHours}h
                        </td>
                        <td className="px-4 md:px-6 py-3 font-semibold" style={{ color: cfg.color }}>
                          {p.riskScore}
                        </td>
                        <td className="px-4 md:px-6 py-3">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                            style={{ backgroundColor: cfg.badgeBg, color: cfg.badge }}
                          >
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 md:px-6 py-3 max-w-xs truncate text-slate-500">
                          {p.explanation}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string
  sub: string
  color: string
}

function StatCard({ label, value, sub, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 md:px-5 py-4">
      <p className="text-xs font-medium mb-1 truncate text-slate-500">{label}</p>
      <p className="text-xl md:text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5 text-slate-400">{sub}</p>
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  trackColor: string
  onChange: (v: number) => void
}

function SliderField({ label, value, min, max, unit, trackColor, onChange }: SliderFieldProps) {
  const pct = ((value - min) / (max - min)) * 100
  const id = `slider-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm font-semibold tabular-nums" style={{ color: trackColor }}>
          {value} {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full bg-slate-200">
        <div
          className="absolute h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: trackColor }}
        />
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer h-2"
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: trackColor }}
        />
      </div>
    </div>
  )
}
