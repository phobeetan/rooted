import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Startups from './pages/Startups.jsx'
import Forum from './pages/Forum.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/startups" element={<Startups />} />
      <Route path="/forum" element={<Forum />} />
    </Routes>
  )
}

export default App
