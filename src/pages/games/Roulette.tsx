import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useGame } from '../../contexts/GameContext'
import toast from 'react-hot-toast'

const NUMBERS = Array.from({ length: 37 }, (_, i) => i) // 0-36
const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const BLACK_NUMBERS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]

interface Bet {
  type: string
  numbers: number[]
  amount: number
  payout: number
}

export default function Roulette() {
  const { isConnected, chipBalance } = useWallet()
  const { gameState, placeBet, endGame, resetGame } = useGame()
  
  const [bets, setBets] = useState<Bet[]>([])
  const [chipValue, setChipValue] = useState(5)
  const [isSpinning, setIsSpinning] = useState(false)
  const [winningNumber, setWinningNumber] = useState<number | null>(null)
  const [ballPosition, setBallPosition] = useState(0)

  const getNumberColor = (num: number) => {
    if (num === 0) return 'green'
    return RED_NUMBERS.includes(num) ? 'red' : 'black'
  }

  const placeBetOnNumber = (number: number) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (chipValue > chipBalance) {
      toast.error('Insufficient CHIPS balance')
      return
    }

    const existingBet = bets.find(bet => bet.type === 'straight' && bet.numbers[0] === number)
    if (existingBet) {
      setBets(bets.map(bet => 
        bet === existingBet 
          ? { ...bet, amount: bet.amount + chipValue }
          : bet
      ))
    } else {
      setBets([...bets, {
        type: 'straight',
        numbers: [number],
        amount: chipValue,
        payout: 35
      }])
    }
  }

  const placeBetOnColor = (color: 'red' | 'black') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (chipValue > chipBalance) {
      toast.error('Insufficient CHIPS balance')
      return
    }

    const numbers = color === 'red' ? RED_NUMBERS : BLACK_NUMBERS
    const existingBet = bets.find(bet => bet.type === color)
    
    if (existingBet) {
      setBets(bets.map(bet => 
        bet === existingBet 
          ? { ...bet, amount: bet.amount + chipValue }
          : bet
      ))
    } else {
      setBets([...bets, {
        type: color,
        numbers,
        amount: chipValue,
        payout: 1
      }])
    }
  }

  const placeBetOnEvenOdd = (type: 'even' | 'odd') => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (chipValue > chipBalance) {
      toast.error('Insufficient CHIPS balance')
      return
    }

    const numbers = NUMBERS.filter(n => n !== 0 && (type === 'even' ? n % 2 === 0 : n % 2 === 1))
    const existingBet = bets.find(bet => bet.type === type)
    
    if (existingBet) {
      setBets(bets.map(bet => 
        bet === existingBet 
          ? { ...bet, amount: bet.amount + chipValue }
          : bet
      ))
    } else {
      setBets([...bets, {
        type,
        numbers,
        amount: chipValue,
        payout: 1
      }])
    }
  }

  const getTotalBetAmount = () => {
    return bets.reduce((total, bet) => total + bet.amount, 0)
  }

  const spin = async () => {
    if (bets.length === 0) {
      toast.error('Please place at least one bet')
      return
    }

    const totalBet = getTotalBetAmount()
    const canBet = await placeBet(totalBet, 'roulette')
    if (!canBet) return

    setIsSpinning(true)
    
    // Generate winning number
    const winning = Math.floor(Math.random() * 37)
    setWinningNumber(winning)

    // Animate ball spinning
    const spinDuration = 3000
    const spinInterval = setInterval(() => {
      setBallPosition(prev => (prev + 1) % 37)
    }, 50)

    setTimeout(() => {
      clearInterval(spinInterval)
      setBallPosition(winning)
      
      // Calculate winnings
      let totalWinnings = 0
      bets.forEach(bet => {
        if (bet.numbers.includes(winning)) {
          totalWinnings += bet.amount * (bet.payout + 1) // +1 for original bet
        }
      })

      const result = totalWinnings > 0 ? 'win' : 'lose'
      endGame(result, totalWinnings)
      
      setIsSpinning(false)
    }, spinDuration)
  }

  const clearBets = () => {
    setBets([])
    resetGame()
  }

  const getBetAmount = (type: string, numbers?: number[]) => {
    if (type === 'straight' && numbers) {
      const bet = bets.find(b => b.type === 'straight' && b.numbers[0] === numbers[0])
      return bet ? bet.amount : 0
    }
    const bet = bets.find(b => b.type === type)
    return bet ? bet.amount : 0
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Roulette</h1>
          <p className="text-gray-400">
            Place your bets and watch the wheel spin! European roulette with single zero.
          </p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{chipBalance.toFixed(0)}</div>
            <div className="text-sm text-gray-400">CHIPS Balance</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-algorand-400">{getTotalBetAmount()}</div>
            <div className="text-sm text-gray-400">Total Bet</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-casino-gold">
              {winningNumber !== null ? winningNumber : '-'}
            </div>
            <div className="text-sm text-gray-400">Last Number</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {gameState.totalWinnings.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Won</div>
          </div>
        </div>

        {/* Roulette Wheel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-casino-gold to-yellow-600 rounded-full w-80 h-80 mx-auto mb-8 relative flex items-center justify-center"
        >
          <div className="bg-slate-900 rounded-full w-72 h-72 relative">
            {/* Wheel numbers */}
            {NUMBERS.map((num, index) => {
              const angle = (index * 360) / 37
              const isWinning = winningNumber === num
              return (
                <div
                  key={num}
                  className={`absolute w-8 h-8 flex items-center justify-center text-xs font-bold rounded-full transform -translate-x-1/2 -translate-y-1/2 ${
                    getNumberColor(num) === 'red' ? 'bg-red-600 text-white' :
                    getNumberColor(num) === 'black' ? 'bg-gray-900 text-white' :
                    'bg-green-600 text-white'
                  } ${isWinning ? 'ring-4 ring-casino-gold' : ''}`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${angle}deg) translateY(-120px) rotate(-${angle}deg)`
                  }}
                >
                  {num}
                </div>
              )
            })}
            
            {/* Ball */}
            <motion.div
              className="absolute w-4 h-4 bg-white rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: `rotate(${ballPosition * (360 / 37)}deg) translateY(-130px)`
              }}
              animate={isSpinning ? { rotate: 360 } : {}}
              transition={isSpinning ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
            />
          </div>
        </motion.div>

        {/* Betting Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 mb-8"
        >
          {/* Chip Value Selector */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Chip Value</h3>
            <div className="flex space-x-2">
              {[1, 5, 10, 25, 50, 100].map(value => (
                <button
                  key={value}
                  onClick={() => setChipValue(value)}
                  className={`chip w-12 h-12 flex items-center justify-center text-white font-bold text-sm ${
                    chipValue === value ? 'ring-2 ring-casino-gold' : ''
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Number Grid */}
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-3">Numbers</h3>
            <div className="grid grid-cols-13 gap-1 mb-4">
              {/* Zero */}
              <button
                onClick={() => placeBetOnNumber(0)}
                disabled={isSpinning}
                className="col-span-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-2 rounded relative"
              >
                0
                {getBetAmount('straight', [0]) > 0 && (
                  <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getBetAmount('straight', [0])}
                  </div>
                )}
              </button>
              
              {/* Numbers 1-36 */}
              {Array.from({ length: 36 }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => placeBetOnNumber(num)}
                  disabled={isSpinning}
                  className={`py-3 px-2 rounded font-bold text-white relative hover:opacity-80 ${
                    getNumberColor(num) === 'red' ? 'bg-red-600' : 'bg-gray-900'
                  }`}
                >
                  {num}
                  {getBetAmount('straight', [num]) > 0 && (
                    <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getBetAmount('straight', [num])}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Outside Bets */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <button
              onClick={() => placeBetOnColor('red')}
              disabled={isSpinning}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded relative"
            >
              Red
              {getBetAmount('red') > 0 && (
                <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getBetAmount('red')}
                </div>
              )}
            </button>
            
            <button
              onClick={() => placeBetOnColor('black')}
              disabled={isSpinning}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-4 rounded relative"
            >
              Black
              {getBetAmount('black') > 0 && (
                <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getBetAmount('black')}
                </div>
              )}
            </button>
            
            <button
              onClick={() => placeBetOnEvenOdd('even')}
              disabled={isSpinning}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded relative"
            >
              Even
              {getBetAmount('even') > 0 && (
                <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getBetAmount('even')}
                </div>
              )}
            </button>
            
            <button
              onClick={() => placeBetOnEvenOdd('odd')}
              disabled={isSpinning}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded relative"
            >
              Odd
              {getBetAmount('odd') > 0 && (
                <div className="absolute -top-2 -right-2 bg-casino-gold text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getBetAmount('odd')}
                </div>
              )}
            </button>
            
            <button
              onClick={spin}
              disabled={isSpinning || !isConnected || bets.length === 0}
              className="btn-gold font-bold py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isSpinning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Spinning...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Spin</span>
                </>
              )}
            </button>
            
            <button
              onClick={clearBets}
              disabled={isSpinning}
              className="btn-primary font-bold py-3 px-4"
            >
              Clear Bets
            </button>
          </div>
        </motion.div>

        {/* Betting Summary */}
        {bets.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-slate-800 rounded-xl p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">Current Bets</h3>
            <div className="space-y-2">
              {bets.map((bet, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-slate-700">
                  <span className="text-gray-400">
                    {bet.type === 'straight' ? `Number ${bet.numbers[0]}` : 
                     bet.type.charAt(0).toUpperCase() + bet.type.slice(1)}
                  </span>
                  <span className="text-white font-medium">
                    {bet.amount} CHIPS (pays {bet.payout}:1)
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-bold">
                <span className="text-white">Total Bet:</span>
                <span className="text-casino-gold">{getTotalBetAmount()} CHIPS</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}