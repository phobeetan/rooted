import { useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Crypto from './pages/Crypto.jsx'
import Donations from './pages/Donations.jsx'
import Forum from './pages/Forum.jsx'
import Home from './pages/Home.jsx'
import InvestmentChatbot from './pages/InvestmentChatbot.jsx'
import MockFidelity from './pages/MockFidelity.jsx'
import MockImportPreview from './pages/MockImportPreview.jsx'
import PaperTrading from './pages/PaperTrading.jsx'
import SalaryNegotiation from './pages/SalaryNegotiation.jsx'
import Startups from './pages/Startups.jsx'
import './App.css'

function App() {
  const location = useLocation()
  const [isBudOpen, setIsBudOpen] = useState(() => window.location.pathname === '/investment-chatbot')
  const [initialBudPrompt] = useState(() => (
    window.location.pathname === '/investment-chatbot'
      ? new URLSearchParams(window.location.search).get('prompt') || ''
      : ''
  ))

  return (
    <div className="app-shell">
      <div className="app-content">
        <Navigation />
        <div className="page-transition" key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/investment-chatbot" element={<Navigate replace to="/" />} />
            <Route path="/salary-negotiation" element={<SalaryNegotiation />} />
            <Route path="/startups" element={<Startups />} />
            <Route path="/trade" element={<PaperTrading />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/paper-trading" element={<Navigate replace to="/trade" />} />
            <Route path="/mock-fidelity" element={<MockFidelity />} />
            <Route path="/rooted/mock-fidelity-received" element={<MockImportPreview />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </div>
      </div>
      <InvestmentChatbot
        isOpen={isBudOpen}
        initialPrompt={initialBudPrompt}
        onClose={() => setIsBudOpen(false)}
        onOpen={() => setIsBudOpen(true)}
      />
    </div>
  )
}

export default App
