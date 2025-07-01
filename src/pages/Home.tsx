import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Shield, Zap, Award, TrendingUp, Users, DollarSign } from 'lucide-react'
import { useWallet } from '../contexts/WalletContext'

export default function Home() {
  const { isConnected, connectWallet } = useWallet()

  const features = [
    {
      icon: Shield,
      title: 'Provably Fair',
      description: 'Every game outcome is cryptographically verifiable on the Algorand blockchain'
    },
    {
      icon: Zap,
      title: 'Instant Payouts',
      description: 'Lightning-fast transactions with minimal fees thanks to Algorand technology'
    },
    {
      icon: Award,
      title: 'Licensed & Secure',
      description: 'Fully regulated platform with enterprise-grade security measures'
    }
  ]

  const games = [
    {
      name: 'Slots',
      image: 'https://images.pexels.com/photos/6664189/pexels-photo-6664189.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Classic slot machines with progressive jackpots',
      href: '/games/slots'
    },
    {
      name: 'Poker',
      image: 'https://images.pexels.com/photos/1871508/pexels-photo-1871508.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Texas Hold\'em and other poker variants',
      href: '/games/poker'
    },
    {
      name: 'Blackjack',
      image: 'https://images.pexels.com/photos/1871508/pexels-photo-1871508.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Classic 21 with perfect basic strategy',
      href: '/games/blackjack'
    },
    {
      name: 'Roulette',
      image: 'https://images.pexels.com/photos/6664189/pexels-photo-6664189.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'European and American roulette tables',
      href: '/games/roulette'
    }
  ]

  const stats = [
    { label: 'Total Players', value: '10,000+', icon: Users },
    { label: 'Games Played', value: '1M+', icon: Play },
    { label: 'Total Winnings', value: '$2.5M+', icon: DollarSign },
    { label: 'Uptime', value: '99.9%', icon: TrendingUp }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-algorand-900">
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6664189/pexels-photo-6664189.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              The Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-algorand-400 to-casino-gold neon-text">
                {' '}Gaming
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience provably fair gaming on the Algorand blockchain. 
              Fast, secure, and transparent casino games with instant payouts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isConnected ? (
                <Link to="/games" className="btn-gold text-lg px-8 py-4 inline-flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Start Playing</span>
                </Link>
              ) : (
                <button onClick={connectWallet} className="btn-gold text-lg px-8 py-4 inline-flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Connect & Play</span>
                </button>
              )}
              <Link to="/games" className="btn-primary text-lg px-8 py-4">
                View Games
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-8 h-8 text-algorand-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Algorand Casino?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Built on cutting-edge blockchain technology to provide the most fair, 
              fast, and secure gaming experience possible.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="bg-slate-800 rounded-xl p-8 border border-slate-700 hover:border-algorand-500 transition-colors"
              >
                <feature.icon className="w-12 h-12 text-algorand-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Preview */}
      <section className="py-20 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Popular Games
            </h2>
            <p className="text-xl text-gray-400">
              Choose from our selection of classic casino games
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <Link to={game.href} className="block">
                  <div className="bg-slate-700 rounded-xl overflow-hidden border border-slate-600 hover:border-algorand-500 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className="aspect-video bg-gradient-to-br from-algorand-600 to-algorand-800 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">{game.name}</span>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-white mb-2">{game.name}</h3>
                      <p className="text-gray-400 text-sm">{game.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/games" className="btn-primary text-lg px-8 py-4">
              View All Games
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-algorand-600 to-algorand-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Playing?
            </h2>
            <p className="text-xl text-algorand-100 mb-8">
              Join thousands of players enjoying fair and transparent gaming on Algorand
            </p>
            {isConnected ? (
              <Link to="/games" className="btn-gold text-lg px-8 py-4 inline-flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Play Now</span>
              </Link>
            ) : (
              <button onClick={connectWallet} className="btn-gold text-lg px-8 py-4 inline-flex items-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Connect Wallet & Play</span>
              </button>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  )
}