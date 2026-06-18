import { useState, useEffect, useRef } from 'react'
import type { BeachRegion, Prediction } from '@/types'
import { fetchBeachRegions, fetchHistory } from '@/services/api'
import Sidebar from '@/components/Sidebar'

const RISK_CONFIG = {
  low:    { label: 'Baixo', color: 'var(--color-teal-700)', badgeBg: 'var(--color-teal-50)' },
  medium: { label: 'Médio', color: 'var(--color-warn-600)', badgeBg: 'var(--color-warn-50)' },
  high:   { label: 'Alto',  color: 'var(--color-risk-600)', badgeBg: 'var(--color-risk-50)' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function HistoryPage() {
  const [regions, setRegions] = useState<BeachRegion[]>([])
  const [selectedRegionId, setSelectedRegionId] = useState('')
  const [history, setHistory] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchBeachRegions()
      .then(data => {
        setRegions(data)
        if (data.length > 0) setSelectedRegionId(data[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedRegionId) return
    setLoading(true)
    fetchHistory(selectedRegionId)
      .then(data => {
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setHistory(sorted)
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [selectedRegionId])

  const selectedRegion = regions.find(r => r.id === selectedRegionId)

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
              aria-label="Abrir menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base md:text-lg font-semibold text-ocean-900">
                Histórico de Simulações
              </h1>
              <p className="text-xs md:text-sm hidden sm:block text-slate-500">
                {selectedRegion ? `${selectedRegion.name} — ${selectedRegion.city}` : 'Selecione uma região'}
              </p>
            </div>
          </div>
          <span className="text-xs md:text-sm text-slate-400">
            {history.length} {history.length === 1 ? 'registro' : 'registros'}
          </span>
        </header>

        <div className="px-4 md:px-8 py-4 flex flex-col gap-4">
          {/* Region select — mobile only */}
          <div className="lg:hidden">
            <RegionDropdown
              regions={regions}
              selectedId={selectedRegionId}
              onSelect={setSelectedRegionId}
            />
          </div>

          {/* Loading / empty state — shared */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 flex items-center justify-center py-16 gap-3 text-slate-400">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              <span className="text-sm">Carregando histórico...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
              </svg>
              <p className="text-sm">Nenhuma simulação encontrada para esta região.</p>
            </div>
          ) : (
            <>
              {/* Mobile: card list */}
              <div className="lg:hidden flex flex-col gap-3">
                {history.map(p => {
                  const cfg = RISK_CONFIG[p.riskLevel]
                  return (
                    <div
                      key={p.id}
                      className="bg-white rounded-xl border-l-4 border border-gray-200 p-4 flex flex-col gap-3"
                      style={{ borderLeftColor: cfg.color }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {formatDate(p.createdAt)}
                        </span>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: cfg.badgeBg, color: cfg.color }}
                        >
                          {cfg.label}
                        </span>
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs font-medium mb-0.5 text-slate-400">Score de risco</p>
                          <p className="text-3xl font-bold" style={{ color: cfg.color }}>{p.riskScore}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium mb-0.5 text-slate-400">Previsão</p>
                          <p className="text-lg font-semibold text-gray-700">{p.forecastHours}h</p>
                        </div>
                      </div>

                      <div className="h-1.5 rounded-full bg-slate-200">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${p.riskScore}%`, backgroundColor: cfg.color }}
                        />
                      </div>

                      <p className="text-sm leading-relaxed text-slate-500">
                        {p.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>

              {/* Desktop: table */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50">
                        {['Data', 'Previsão', 'Score', 'Risco', 'Explicação'].map(h => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
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
                            <td className="px-6 py-3 whitespace-nowrap text-gray-700">
                              {formatDate(p.createdAt)}
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              {p.forecastHours}h
                            </td>
                            <td className="px-6 py-3 font-semibold" style={{ color: cfg.color }}>
                              {p.riskScore}
                            </td>
                            <td className="px-6 py-3">
                              <span
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: cfg.badgeBg, color: cfg.color }}
                              >
                                {cfg.label}
                              </span>
                            </td>
                            <td className="px-6 py-3 max-w-xs truncate text-slate-500">
                              {p.explanation}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

interface RegionDropdownProps {
  regions: BeachRegion[]
  selectedId: string
  onSelect: (id: string) => void
}

function RegionDropdown({ regions, selectedId, onSelect }: RegionDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = regions.find(r => r.id === selectedId)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={ref} className="relative">
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-slate-400">
        Região Costeira
      </p>

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white border transition-all"
        style={{
          borderColor: open ? 'var(--color-ocean-700)' : 'var(--color-border-subtle)',
          boxShadow: open ? '0 0 0 3px rgba(24,95,165,0.12)' : '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {selected ? (
            <>
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${selected.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}
              />
              <span className="text-sm font-medium truncate text-ocean-900">
                {selected.name}
              </span>
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-full font-medium bg-[var(--color-bg-page)] text-slate-500">
                {selected.city}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-400">Selecione uma região</span>
          )}
        </div>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round"
          className="shrink-0 transition-transform duration-200 text-slate-400"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl border border-gray-200 overflow-hidden z-20"
          style={{ boxShadow: '0 8px 24px rgba(4,44,83,0.12)' }}
        >
          {regions.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-400">Carregando regiões...</p>
          ) : (
            <ul role="listbox" aria-label="Regiões costeiras">
              {regions.map((r, i) => {
                const isSelected = r.id === selectedId
                return (
                  <li key={r.id} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => { onSelect(r.id); setOpen(false) }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${isSelected ? 'bg-ocean-50' : 'hover:bg-slate-50'}`}
                      style={{ borderTop: i > 0 ? '1px solid #f1f5f9' : 'none' }}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}
                      />
                      <span className="flex-1 text-sm font-medium truncate text-ocean-900">
                        {r.name}
                      </span>
                      <span className="text-xs shrink-0 text-slate-400">{r.city}</span>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-ocean-700">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
