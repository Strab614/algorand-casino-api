import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Games from './pages/Games'
import Slots from './pages/games/Slots'
import Poker from './pages/games/Poker'
import Blackjack from './pages/games/Blackjack'
import Roulette from './pages/games/Roulette'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import { WalletProvider } from './contexts/WalletContext'
import { GameProvider } from './contexts/GameContext'

function App() {
  return (
    <WalletProvider>
      <GameProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Navbar />
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="pt-16"
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/games" element={<Games />} />
                <Route path="/games/slots" element={<Slots />} />
                <Route path="/games/poker" element={<Poker />} />
                <Route path="/games/blackjack" element={<Blackjack />} />
                <Route path="/games/roulette" element={<Roulette />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<Admin />} />
              </Routes>
            </motion.main>
            <Footer />
          </div>
        </Router>
      </GameProvider>
    </WalletProvider>
  )
}

export default App