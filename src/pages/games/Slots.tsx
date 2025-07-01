import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Settings, TrendingUp } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useGame } from '../../contexts/GameContext'
import toast from 'react-hot-toast'

const SYMBOLS = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣']
const PAYOUTS = {
  '🍒🍒🍒': 5,
  '🍋🍋🍋': 10,
  '🍊🍊🍊': 15,
  '🍇🍇🍇': 20,
  '⭐⭐⭐': 50,
  '💎💎💎': 100,
  '🔔🔔🔔': 200,
  '7️⃣7️⃣7️⃣': 500
}

export default function Slots() {
  const { isConnected, chipBalance } = useWallet()
  const { gameState, placeBet, endGame, resetGame } = useGame()
  const [reels, setReels] = useState(['🍒', '🍋', '🍊'])
  const [isSpinning, setIsSpinning] = useState(false)
  const [betAmount, setBetAmount] = useState(10)
  const [autoPlay, setAutoPlay] = useState(false)
  const [spinCount, setSpinCount] = useState(0)

  const generateRandomSymbol = () => {
    return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  }

  const checkWin = (result: string[]) => {
    const combination = result.join('')
    return PAYOUTS[combination] || 0
  }

  const spin = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (isSpinning || gameState.isPlaying) return

    const canBet = await placeBet(betAmount, 'slots')
    if (!canBet) return

    setIsSpinning(true)
    setSpinCount(prev => prev + 1)

    // Animate reels spinning
    const spinDuration = 2000 + Math.random() * 1000
    const spinInterval = setInterval(() => {
      setReels([generateRandomSymbol(), generateRandomSymbol(), generateRandomSymbol()])
    }, 100)

    setTimeout(() => {
      clearInterval(spinInterval)
      
      // Generate final result
      const finalResult = [generateRandomSymbol(), generateRandomSymbol(), generateRandomSymbol()]
      setReels(finalResult)
      
      // Check for win
      const payout = checkWin(finalResult)
      const result = payout > 0 ? 'win' : 'lose'
      
      endGame(result, payout)
      setIsSpinning(false)
    }, spinDuration)
  }

  const handleAutoPlay = () => {
    setAutoPlay(!autoPlay)
  }

  useEffect(() => {
    if (autoPlay && !isSpinning && !gameState.isPlaying) {
      const timer = setTimeout(() => {
        spin()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, isSpinning, gameState.isPlaying, spinCount])

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Slot Machine</h1>
          <p className="text-gray-400">
            Match three symbols to win! Higher value symbols pay more.
          </p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{chipBalance.toFixed(0)}</div>
            <div className="text-sm text-gray-400">CHIPS Balance</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-algorand-400">{betAmount}</div>
            <div className="text-sm text-gray-400">Bet Amount</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-casino-gold">{spinCount}</div>
            <div className="text-sm text-gray-400">Spins</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {gameState.totalWinnings.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Won</div>
          </div>
        </div>

        {/* Slot Machine */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-casino-gold to-yellow-600 rounded-2xl p-8 mb-8 shadow-2xl"
        >
          <div className="bg-slate-900 rounded-xl p-8">
            {/* Reels */}
            <div className="flex justify-center space-x-4 mb-8">
              {reels.map((symbol, index) => (
                <motion.div
                  key={index}
                  className={`w-24 h-24 bg-white rounded-lg flex items-center justify-center text-4xl border-4 border-casino-gold ${
                    isSpinning ? 'slot-spin' : ''
                  }`}
                  animate={isSpinning ? { y: [0, -10, 0] } : {}}
                  transition={{ duration: 0.1, repeat: isSpinning ? Infinity : 0 }}
                >
                  {symbol}
                </motion.div>
              ))}
            </div>

            {/* Bet Controls */}
            <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <label className="text-white font-medium">Bet:</label>
                <select
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={isSpinning || gameState.isPlaying}
                  className="bg-slate-700 text-white rounded px-3 py-1 border border-slate-600"
                >
                  <option value={1}>1 CHIPS</option>
                  <option value={5}>5 CHIPS</option>
                  <option value={10}>10 CHIPS</option>
                  <option value={25}>25 CHIPS</option>
                  <option value={50}>50 CHIPS</option>
                  <option value={100}>100 CHIPS</option>
                </select>
              </div>

              <button
                onClick={handleAutoPlay}
                disabled={isSpinning || !isConnected}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  autoPlay
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                {autoPlay ? 'Stop Auto' : 'Auto Play'}
              </button>
            </div>

            {/* Spin Button */}
            <div className="text-center">
              <button
                onClick={spin}
                disabled={isSpinning || !isConnected || gameState.isPlaying || betAmount > chipBalance}
                className="btn-gold text-xl px-12 py-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
              >
                {isSpinning ? (
                  <>
                    <RotateCcw className="w-6 h-6 animate-spin" />
                    <span>Spinning...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span>SPIN</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Paytable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Paytable
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PAYOUTS).map(([combination, payout]) => (
              <div key={combination} className="bg-slate-700 rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{combination.replace(/(.)/g, '$1 ')}</div>
                <div className="text-casino-gold font-bold">{payout}x</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Game History */}
        {gameState.gameHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 bg-slate-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Recent Spins</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {gameState.gameHistory.slice(0, 10).map((game) => (
                <div key={game.id} className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-gray-400">
                    Bet: {game.bet} CHIPS
                  </span>
                  <span className={`font-medium ${
                    game.result === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.result === 'win' ? `+${game.payout}` : `-${game.bet}`} CHIPS
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}