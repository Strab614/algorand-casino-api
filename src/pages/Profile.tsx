import React from 'react'
import { motion } from 'framer-motion'
import { User, Wallet, TrendingUp, Clock, Award, BarChart3 } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'
import { useGame } from '../contexts/GameContext'

export default function Profile() {
  const { isConnected, address, balance, chipBalance } = useWallet()
  const { gameState, getGameStats } = useGame()
  
  const stats = getGameStats()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Connect Your Wallet</h1>
            <p className="text-gray-400">
              Please connect your wallet to view your profile and gaming statistics.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`
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
          <h1 className="text-4xl font-bold text-white mb-4">Player Profile</h1>
          <p className="text-gray-400">
            Track your gaming performance and wallet statistics
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-8 mb-8 border border-slate-600"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-20 h-20 bg-algorand-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Player</h2>
              <p className="text-gray-400 mb-4">{formatAddress(address!)}</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-algorand-400">{balance.toFixed(2)}</div>
                  <div className="text-sm text-gray-400">ALGO Balance</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-casino-gold">{chipBalance.toFixed(0)}</div>
                  <div className="text-sm text-gray-400">CHIPS Balance</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Gaming Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-6 h-6 text-algorand-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Total Games</h3>
            </div>
            <div className="text-3xl font-bold text-white">{stats.totalGames}</div>
            <div className="text-sm text-gray-400">Games played</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Win Rate</h3>
            </div>
            <div className="text-3xl font-bold text-white">{stats.winRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-400">Success rate</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <Award className="w-6 h-6 text-casino-gold mr-2" />
              <h3 className="text-lg font-semibold text-white">Total Winnings</h3>
            </div>
            <div className="text-3xl font-bold text-white">{gameState.totalWinnings.toFixed(0)}</div>
            <div className="text-sm text-gray-400">CHIPS won</div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center mb-4">
              <TrendingUp className="w-6 h-6 text-red-400 mr-2" />
              <h3 className="text-lg font-semibold text-white">Net Profit</h3>
            </div>
            <div className={`text-3xl font-bold ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.netProfit >= 0 ? '+' : ''}{stats.netProfit.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">CHIPS profit/loss</div>
          </div>
        </motion.div>

        {/* Recent Games */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-algorand-400 mr-2" />
            <h3 className="text-xl font-bold text-white">Recent Games</h3>
          </div>

          {gameState.gameHistory.length > 0 ? (
            <div className="space-y-3">
              {gameState.gameHistory.slice(0, 10).map((game) => (
                <div
                  key={game.id}
                  className="flex items-center justify-between p-4 bg-slate-700 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      game.result === 'win' ? 'bg-green-400' :
                      game.result === 'lose' ? 'bg-red-400' : 'bg-yellow-400'
                    }`}></div>
                    <div>
                      <div className="text-white font-medium capitalize">{game.game}</div>
                      <div className="text-sm text-gray-400">
                        {game.timestamp.toLocaleDateString()} {game.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">Bet: {game.bet} CHIPS</div>
                    <div className={`text-sm font-medium ${
                      game.result === 'win' ? 'text-green-400' :
                      game.result === 'lose' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {game.result === 'win' ? `+${game.payout}` :
                       game.result === 'lose' ? `-${game.bet}` : '±0'} CHIPS
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">No games played yet</div>
              <p className="text-gray-500">Start playing to see your game history here!</p>
            </div>
          )}
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-slate-800 rounded-xl p-6 border border-slate-700 mt-8"
        >
          <div className="flex items-center mb-6">
            <Award className="w-6 h-6 text-casino-gold mr-2" />
            <h3 className="text-xl font-bold text-white">Achievements</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              stats.totalGames >= 1 ? 'border-casino-gold bg-casino-gold/10' : 'border-slate-600 bg-slate-700'
            }`}>
              <div className="text-center">
                <div className="text-2xl mb-2">🎮</div>
                <div className="font-semibold text-white">First Game</div>
                <div className="text-sm text-gray-400">Play your first game</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              stats.totalGames >= 10 ? 'border-casino-gold bg-casino-gold/10' : 'border-slate-600 bg-slate-700'
            }`}>
              <div className="text-center">
                <div className="text-2xl mb-2">🔥</div>
                <div className="font-semibold text-white">Getting Started</div>
                <div className="text-sm text-gray-400">Play 10 games</div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              gameState.totalWinnings >= 100 ? 'border-casino-gold bg-casino-gold/10' : 'border-slate-600 bg-slate-700'
            }`}>
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="font-semibold text-white">Big Winner</div>
                <div className="text-sm text-gray-400">Win 100+ CHIPS</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}