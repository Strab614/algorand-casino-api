import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, DollarSign, Clock, Target } from 'lucide-react'

interface GameStats {
  balance: number
  totalWon: number
  totalLost: number
  gamesPlayed: number
  winRate: number
  currentStreak: number
  streakType: 'win' | 'loss'
}

interface EnhancedGameUIProps {
  stats: GameStats
  currentBet?: number
  isPlaying?: boolean
  gameType: string
}

export default function EnhancedGameUI({ stats, currentBet, isPlaying, gameType }: EnhancedGameUIProps) {
  const netProfit = stats.totalWon - stats.totalLost

  return (
    <div className="w-full max-w-6xl mx-auto mb-8">
      {/* Main Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {/* Balance */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: '#3b82f6' }}
        >
          <div className="flex items-center mb-2">
            <DollarSign className="w-5 h-5 text-green-400 mr-2" />
            <span className="text-sm text-gray-400 font-medium">Balance</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.balance.toFixed(0)}</div>
          <div className="text-xs text-gray-400">CHIPS</div>
        </motion.div>

        {/* Current Bet */}
        {currentBet !== undefined && (
          <motion.div
            className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
            whileHover={{ scale: 1.02, borderColor: '#f59e0b' }}
            animate={isPlaying ? { borderColor: ['#f59e0b', '#ef4444', '#f59e0b'] } : {}}
            transition={{ duration: 1, repeat: isPlaying ? Infinity : 0 }}
          >
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-sm text-gray-400 font-medium">Current Bet</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{currentBet}</div>
            <div className="text-xs text-gray-400">CHIPS</div>
          </motion.div>
        )}

        {/* Net Profit */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: netProfit >= 0 ? '#10b981' : '#ef4444' }}
        >
          <div className="flex items-center mb-2">
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
            )}
            <span className="text-sm text-gray-400 font-medium">Net Profit</span>
          </div>
          <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}{netProfit.toFixed(0)}
          </div>
          <div className="text-xs text-gray-400">CHIPS</div>
        </motion.div>

        {/* Games Played */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: '#8b5cf6' }}
        >
          <div className="flex items-center mb-2">
            <Clock className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-sm text-gray-400 font-medium">Games</span>
          </div>
          <div className="text-2xl font-bold text-white">{stats.gamesPlayed}</div>
          <div className="text-xs text-gray-400">Played</div>
        </motion.div>

        {/* Win Rate */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: '#06b6d4' }}
        >
          <div className="flex items-center mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400 mr-2" />
            <span className="text-sm text-gray-400 font-medium">Win Rate</span>
          </div>
          <div className="text-2xl font-bold text-cyan-400">{stats.winRate.toFixed(1)}%</div>
          <div className="text-xs text-gray-400">Success</div>
        </motion.div>

        {/* Current Streak */}
        <motion.div
          className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
          whileHover={{ scale: 1.02, borderColor: stats.streakType === 'win' ? '#10b981' : '#ef4444' }}
        >
          <div className="flex items-center mb-2">
            {stats.streakType === 'win' ? (
              <TrendingUp className="w-5 h-5 text-green-400 mr-2" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 mr-2" />
            )}
            <span className="text-sm text-gray-400 font-medium">Streak</span>
          </div>
          <div className={`text-2xl font-bold ${stats.streakType === 'win' ? 'text-green-400' : 'text-red-400'}`}>
            {stats.currentStreak}
          </div>
          <div className="text-xs text-gray-400 capitalize">{stats.streakType}s</div>
        </motion.div>
      </div>

      {/* Game Type Header */}
      <motion.div
        className="bg-gradient-to-r from-algorand-600 via-algorand-700 to-algorand-800 rounded-xl p-6 border-2 border-algorand-500 shadow-xl mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{gameType}</h2>
            <p className="text-algorand-200">
              {gameType === 'Slots' && 'Match symbols to win big prizes!'}
              {gameType === 'Blackjack' && 'Get as close to 21 as possible without going over!'}
              {gameType === 'Roulette' && 'Place your bets and watch the wheel spin!'}
              {gameType === 'Poker' && 'Make the best hand to win the pot!'}
            </p>
          </div>
          
          {/* Game Status Indicator */}
          <div className="flex items-center space-x-3">
            <div className={`w-4 h-4 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-white font-medium">
              {isPlaying ? 'Playing' : 'Ready'}
            </span>
          </div>
        </div>
        
        {/* Progress Bar for Current Session */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-algorand-200 mb-2">
            <span>Session Progress</span>
            <span>{stats.gamesPlayed} games</span>
          </div>
          <div className="w-full bg-algorand-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-algorand-400 to-algorand-300 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((stats.gamesPlayed / 50) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-gray-400">Total Won</div>
          <div className="text-lg font-bold text-green-400">{stats.totalWon.toFixed(0)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-gray-400">Total Lost</div>
          <div className="text-lg font-bold text-red-400">{stats.totalLost.toFixed(0)}</div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-gray-400">Biggest Win</div>
          <div className="text-lg font-bold text-yellow-400">
            {Math.max(...(stats.gamesPlayed > 0 ? [stats.totalWon / Math.max(stats.gamesPlayed, 1)] : [0])).toFixed(0)}
          </div>
        </div>
        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
          <div className="text-sm text-gray-400">Avg Bet</div>
          <div className="text-lg font-bold text-blue-400">
            {stats.gamesPlayed > 0 ? ((stats.totalWon + stats.totalLost) / stats.gamesPlayed).toFixed(0) : '0'}
          </div>
        </div>
      </div>
    </div>
  )
}