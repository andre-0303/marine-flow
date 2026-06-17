import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SimulationPage from '@/pages/SimulationPage'

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Navigate to="/simulation" replace />} />
        <Route path="/simulation" element={<SimulationPage />} />
      </Routes>
    </BrowserRouter>
  )
}
