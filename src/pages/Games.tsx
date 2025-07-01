import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Star, TrendingUp, Clock } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

export default function Games() {
  const { isConnected } = useWallet()

  const gameCategories = [
    {
      title: 'Slots',
      description: 'Spin to win with our collection of themed slot machines',
      games: [
        {
          name: 'Classic Slots',
          players: 1250,
          jackpot: '50,000 CHIPS',
          rtp: '96.5%',
          href: '/games/slots',
          featured: true
        }
      ]
    },
    {
      title: 'Table Games',
      description: 'Classic casino table games with perfect odds',
      games: [
        {
          name: 'Blackjack',
          players: 890,
          jackpot: 'N/A',
          rtp: '99.5%',
          href: '/games/blackjack',
          featured: false
        },
        {
          name: 'Roulette',
          players: 650,
          jackpot: 'N/A',
          rtp: '97.3%',
          href: '/games/roulette',
          featured: false
        }
      ]
    },
    {
      title: 'Card Games',
      description: 'Skill-based card games and tournaments',
      games: [
        {
          name: 'Texas Hold\'em',
          players: 420,
          jackpot: '25,000 CHIPS',
          rtp: '98.0%',
          href: '/games/poker',
          featured: true
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Casino Games
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose from our selection of provably fair games. All games are powered by 
            smart contracts on the Algorand blockchain for maximum transparency.
          </p>
        </motion.div>

        {/* Featured Games */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16"
        >
          <div className="flex items-center mb-8">
            <Star className="w-6 h-6 text-casino-gold mr-2" />
            <h2 className="text-2xl font-bold text-white">Featured Games</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameCategories.flatMap(category => 
              category.games.filter(game => game.featured)
            ).map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link to={game.href}>
                  <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-xl p-6 border border-casino-gold/20 hover:border-casino-gold/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white">{game.name}</h3>
                      <Star className="w-5 h-5 text-casino-gold" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Players Online</span>
                        <span className="text-algorand-400 font-medium">{game.players}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Jackpot</span>
                        <span className="text-casino-gold font-medium">{game.jackpot}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">RTP</span>
                        <span className="text-green-400 font-medium">{game.rtp}</span>
                      </div>
                    </div>
                    
                    <button className="w-full mt-6 btn-primary flex items-center justify-center space-x-2">
                      <Play className="w-4 h-4" />
                      <span>Play Now</span>
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Game Categories */}
        <div className="space-y-12">
          {gameCategories.map((category, categoryIndex) => (
            <motion.section
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 + categoryIndex * 0.2 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{category.title}</h2>
                <p className="text-gray-400">{category.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.games.map((game, gameIndex) => (
                  <motion.div
                    key={game.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: gameIndex * 0.1 }}
                    className="group"
                  >
                    <Link to={game.href}>
                      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-algorand-500 transition-all duration-300 group-hover:transform group-hover:scale-105">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                          {game.featured && <Star className="w-4 h-4 text-casino-gold" />}
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-400">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            <span>{game.players} players online</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>RTP: {game.rtp}</span>
                          </div>
                        </div>
                        
                        {game.jackpot !== 'N/A' && (
                          <div className="bg-gradient-to-r from-casino-gold/20 to-casino-gold/10 rounded-lg p-3 mb-4">
                            <div className="text-xs text-casino-gold font-medium">JACKPOT</div>
                            <div className="text-lg font-bold text-white">{game.jackpot}</div>
                          </div>
                        )}
                        
                        <button 
                          className="w-full btn-primary flex items-center justify-center space-x-2"
                          disabled={!isConnected}
                        >
                          <Play className="w-4 h-4" />
                          <span>{isConnected ? 'Play Now' : 'Connect Wallet'}</span>
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Connect Wallet CTA */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-16 text-center bg-gradient-to-r from-algorand-600/20 to-algorand-800/20 rounded-xl p-8 border border-algorand-500/30"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Connect Your Wallet to Start Playing
            </h3>
            <p className="text-gray-400 mb-6">
              Connect your Algorand wallet to access all games and start winning CHIPS
            </p>
            <button className="btn-gold text-lg px-8 py-4">
              Connect Wallet
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}