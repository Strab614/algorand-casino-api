import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Wallet, User, Settings } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isConnected, address, balance, chipBalance, connectWallet, disconnectWallet } = useWallet()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Games', href: '/games' },
    { name: 'Profile', href: '/profile' },
  ]

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return (
    <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-sm border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-algorand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-xl font-bold text-white">Algorand Casino</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-algorand-400 bg-algorand-900/20'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-300">
                    {formatAddress(address!)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {balance.toFixed(2)} ALGO | {chipBalance.toFixed(0)} CHIPS
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-slate-800 border-t border-slate-700"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.href
                    ? 'text-algorand-400 bg-algorand-900/20'
                    : 'text-gray-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Mobile Wallet Section */}
            <div className="pt-4 border-t border-slate-700">
              {isConnected ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-gray-300">
                    {formatAddress(address!)}
                  </div>
                  <div className="px-3 py-1 text-xs text-gray-400">
                    {balance.toFixed(2)} ALGO | {chipBalance.toFixed(0)} CHIPS
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  )
}