import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { AppShell } from './components/layout/AppShell'

import Overview from './pages/Overview'
import TextScanner from './pages/TextScanner'
import CodeScanner from './pages/CodeScanner'
import ImageScanner from './pages/ImageScanner'
import ScanHistory from './pages/ScanHistory'
import ScanDetails from './pages/ScanDetails'
import ThreatExplorer from './pages/ThreatExplorer'
import Policies from './pages/Policies'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/scanner/text" element={<TextScanner />} />
              <Route path="/scanner/code" element={<CodeScanner />} />
              <Route path="/scanner/image" element={<ImageScanner />} />
              <Route path="/history" element={<ScanHistory />} />
              <Route path="/history/:scanId" element={<ScanDetails />} />
              <Route path="/threats" element={<ThreatExplorer />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  )
}
