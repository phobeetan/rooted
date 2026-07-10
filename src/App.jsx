import { Route, Routes } from 'react-router-dom'
import Navigation from './components/Navigation.jsx'
import Forum from './pages/Forum.jsx'
import Home from './pages/Home.jsx'
import InvestmentChatbot from './pages/InvestmentChatbot.jsx'
import MockFidelity from './pages/MockFidelity.jsx'
import MockImportPreview from './pages/MockImportPreview.jsx'
import PaperTrading from './pages/PaperTrading.jsx'
import './App.css'

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/investment-chatbot" element={<InvestmentChatbot />} />
        <Route path="/paper-trading" element={<PaperTrading />} />
        <Route path="/mock-fidelity" element={<MockFidelity />} />
        <Route path="/rooted/mock-fidelity-received" element={<MockImportPreview />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </>
  )
}

export default App
