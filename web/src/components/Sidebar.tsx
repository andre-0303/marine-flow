import { useNavigate, useLocation } from 'react-router-dom'
import type { BeachRegion } from '@/types'

interface SidebarProps {
  regions: BeachRegion[]
  selectedId: string
  onSelect: (id: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ regions, selectedId, onSelect, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleSelect(id: string) {
    onSelect(id)
    onClose()
  }

  return (
    <>
      {/* Overlay — mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          'flex flex-col w-[220px] shrink-0 bg-ocean-900',
          'lg:relative lg:translate-x-0 lg:h-full lg:overflow-y-auto',
          'max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-full max-lg:z-30',
          'max-lg:transition-transform max-lg:duration-300',
          isOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full',
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <span className="text-white font-bold text-lg tracking-tight">Marine Flow</span>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white p-1 rounded"
            aria-label="Fechar menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3">
          <button
            onClick={() => { navigate('/simulation'); onClose() }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-white transition-colors ${
              pathname === '/simulation' ? 'bg-ocean-700/30' : 'hover:bg-white/5'
            }`}
          >
            <IconSimulation />
            Simulação
          </button>
          <button
            onClick={() => { navigate('/history'); onClose() }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left text-white transition-colors ${
              pathname === '/history' ? 'bg-ocean-700/30' : 'hover:bg-white/5'
            }`}
          >
            <IconHistory />
            Histórico
          </button>
        </nav>

        <div className="mt-6 px-3">
          <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            Regiões
          </p>
          <div className="flex flex-col gap-0.5">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => handleSelect(region.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  selectedId === region.id
                    ? 'bg-ocean-700/30 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    region.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                {region.name}
              </button>
            ))}
          </div>
        </div>
      </aside>
    </>
  )
}

function IconSimulation() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function IconHistory() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
