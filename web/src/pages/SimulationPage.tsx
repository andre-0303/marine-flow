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
  low:    { label: 'Baixo', bg: '#e1f5ee', color: '#0f6e56', badge: '#0f6e56', badgeBg: '#e1f5ee' },
  medium: { label: 'Médio', bg: '#faeeda', color: '#ba7517', badge: '#ba7517', badgeBg: '#faeeda' },
  high:   { label: 'Alto',  bg: '#fcebeb', color: '#a32d2d', badge: '#a32d2d', badgeBg: '#fcebeb' },
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
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
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
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: '#042c53' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base md:text-lg font-semibold" style={{ color: '#042c53' }}>
                Simulação Ambiental
              </h1>
              <p className="text-xs md:text-sm hidden sm:block" style={{ color: '#64748b' }}>
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
                  apiOnline ? '#22c55e' : '#e24b4a',
              }}
            />
            <span className="text-xs md:text-sm" style={{ color: '#64748b' }}>
              {apiOnline === null ? 'Verificando...' : apiOnline ? 'API conectada' : 'API desconectada'}
            </span>
          </div>
        </header>

        {/* Stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-4 md:px-8 py-4">
          <StatCard label="Regiões Monitoradas" value={regions.length.toString()} sub="ativas" color="#185fa5" />
          <StatCard
            label="Última Simulação"
            value={history[0] ? formatDate(history[0].createdAt).split(',')[0] : '—'}
            sub="data"
            color="#0f6e56"
          />
          <StatCard
            label="Risco Atual"
            value={history[0] ? RISK_CONFIG[history[0].riskLevel].label : '—'}
            sub={history[0] ? `score ${history[0].riskScore}` : 'sem dados'}
            color={history[0] ? RISK_CONFIG[history[0].riskLevel].color : '#64748b'}
          />
          <StatCard label="Simulações Totais" value={history.length.toString()} sub="nesta região" color="#ba7517" />
        </div>

        {/* Form + Result */}
        <div className="flex flex-col lg:flex-row gap-4 px-4 md:px-8 pb-4">
          {/* Form panel */}
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 md:p-6">
            <h2 className="text-base font-semibold mb-5" style={{ color: '#042c53' }}>
              Parâmetros da Simulação
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Region select — visible on mobile since sidebar is hidden */}
              <div className="lg:hidden">
                <label htmlFor="region-select" className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Região Costeira
                </label>
                <select
                  id="region-select"
                  value={selectedRegionId}
                  onChange={e => setSelectedRegionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2"
                  style={{ color: '#374151', backgroundColor: '#f8fafc' }}
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
                trackColor="#185fa5"
                onChange={setWindSpeed}
              />

              <SliderField
                label="Força da Corrente"
                value={currentStrength}
                min={0} max={10}
                unit="nós"
                trackColor="#185fa5"
                onChange={setCurrentStrength}
              />

              <SliderField
                label="Densidade de Resíduos"
                value={pollutionDensity}
                min={0} max={10}
                unit="/10"
                trackColor="#e24b4a"
                onChange={setPollutionDensity}
              />

              {/* Tide */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Nível da Maré
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {TIDE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setTideLevel(opt.value)}
                      className="flex-1 py-2 text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: tideLevel === opt.value ? '#185fa5' : '#f8fafc',
                        color: tideLevel === opt.value ? '#ffffff' : '#374151',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forecast hours */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  Horizonte de Previsão
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  {FORECAST_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForecastHours(opt.value)}
                      className="flex-1 py-2 text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: forecastHours === opt.value ? '#185fa5' : '#f8fafc',
                        color: forecastHours === opt.value ? '#ffffff' : '#374151',
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: '#fcebeb', color: '#a32d2d' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !selectedRegionId}
                className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-50 active:scale-[0.98]"
                style={{ backgroundColor: '#185fa5' }}
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
              style={riskCfg ? { borderColor: riskCfg.color } : { borderColor: '#e2e8f0' }}
            >
              <h2 className="text-base font-semibold" style={{ color: '#042c53' }}>
                Resultado da Simulação
              </h2>

              {result && riskCfg ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Nível de Risco</p>
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
                        style={{ backgroundColor: riskCfg.badgeBg, color: riskCfg.badge }}
                      >
                        {riskCfg.label}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium mb-1" style={{ color: '#64748b' }}>Score</p>
                      <p className="text-3xl font-bold" style={{ color: riskCfg.color }}>
                        {result.riskScore}
                      </p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full" style={{ backgroundColor: '#e2e8f0' }}>
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

                  <div className="flex justify-between text-xs" style={{ color: '#64748b' }}>
                    <span>Previsão: {result.forecastHours}h</span>
                    <span>{formatDate(result.createdAt)}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-3" style={{ color: '#94a3b8' }}>
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
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#042c53' }}>
                Regiões Monitoradas
              </h3>
              <div className="flex flex-col gap-1">
                {regions.map(r => (
                  <button
                    key={r.id}
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors"
                    style={{ backgroundColor: r.id === selectedRegionId ? '#eaf5fb' : 'transparent' }}
                    onClick={() => setSelectedRegionId(r.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: r.status === 'active' ? '#22c55e' : '#6b7280' }}
                      />
                      <span className="text-sm" style={{ color: '#374151' }}>{r.name}</span>
                    </div>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>{r.city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* History table */}
        <div className="mx-4 md:mx-8 mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold" style={{ color: '#042c53' }}>
              Histórico de Simulações
            </h2>
          </div>
          {history.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm" style={{ color: '#94a3b8' }}>
              Nenhuma simulação encontrada para esta região.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    {['Data', 'Previsão', 'Score', 'Risco', 'Explicação'].map(h => (
                      <th
                        key={h}
                        className="px-4 md:px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: '#64748b' }}
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
                        <td className="px-4 md:px-6 py-3 whitespace-nowrap" style={{ color: '#374151' }}>
                          {formatDate(p.createdAt)}
                        </td>
                        <td className="px-4 md:px-6 py-3" style={{ color: '#374151' }}>
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
                        <td
                          className="px-4 md:px-6 py-3 max-w-xs truncate"
                          style={{ color: '#64748b' }}
                        >
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
      <p className="text-xs font-medium mb-1 truncate" style={{ color: '#64748b' }}>{label}</p>
      <p className="text-xl md:text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{sub}</p>
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
        <label htmlFor={id} className="text-sm font-medium" style={{ color: '#374151' }}>{label}</label>
        <span className="text-sm font-semibold tabular-nums" style={{ color: trackColor }}>
          {value} {unit}
        </span>
      </div>
      <div className="relative h-2 rounded-full" style={{ backgroundColor: '#e2e8f0' }}>
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
