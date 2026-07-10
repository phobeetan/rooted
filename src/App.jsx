import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Startups from './pages/Startups.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/startups" element={<Startups />} />
    </Routes>
  )
}

export default App
