import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SlotSymbol {
  symbol: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  glow: string
}

const ENHANCED_SYMBOLS: SlotSymbol[] = [
  { symbol: '🍒', rarity: 'common', glow: '#ff6b6b' },
  { symbol: '🍋', rarity: 'common', glow: '#ffd93d' },
  { symbol: '🍊', rarity: 'common', glow: '#ff8c42' },
  { symbol: '🍇', rarity: 'rare', glow: '#9b59b6' },
  { symbol: '⭐', rarity: 'epic', glow: '#f1c40f' },
  { symbol: '💎', rarity: 'legendary', glow: '#3498db' },
  { symbol: '🔔', rarity: 'epic', glow: '#e74c3c' },
  { symbol: '7️⃣', rarity: 'legendary', glow: '#2ecc71' }
]

interface EnhancedSlotMachineProps {
  reels: string[]
  isSpinning: boolean
  onSpin: () => void
  disabled?: boolean
}

export default function EnhancedSlotMachine({ reels, isSpinning, onSpin, disabled }: EnhancedSlotMachineProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([])
  const [glowIntensity, setGlowIntensity] = useState(1)

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => prev === 1 ? 1.5 : 1)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isSpinning])

  const getSymbolData = (symbol: string) => {
    return ENHANCED_SYMBOLS.find(s => s.symbol === symbol) || ENHANCED_SYMBOLS[0]
  }

  const createWinParticles = () => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 400,
      y: Math.random() * 300
    }))
    setParticles(newParticles)
    setTimeout(() => setParticles([]), 2000)
  }

  return (
    <div className="relative">
      {/* Enhanced Machine Frame */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-3xl p-8 shadow-2xl">
        {/* Decorative Elements */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-4 left-4 w-6 h-6 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
        <div className="absolute top-4 right-4 w-6 h-6 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
        
        {/* Enhanced Display */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-inner">
          {/* Ambient Lighting */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-radial from-blue-500/20 via-transparent to-transparent animate-pulse"></div>
          
          {/* Reels Container */}
          <div className="flex justify-center space-x-6 mb-8 relative z-10">
            {reels.map((symbol, index) => {
              const symbolData = getSymbolData(symbol)
              return (
                <motion.div
                  key={index}
                  className="relative"
                  animate={isSpinning ? { 
                    y: [0, -20, 0],
                    rotateX: [0, 360, 0]
                  } : {}}
                  transition={{ 
                    duration: 0.3,
                    repeat: isSpinning ? Infinity : 0,
                    delay: index * 0.1
                  }}
                >
                  {/* Enhanced Reel Frame */}
                  <div className="relative w-28 h-28 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-xl border-4 border-yellow-400 shadow-xl overflow-hidden">
                    {/* Inner Glow */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-60"
                      style={{
                        background: `radial-gradient(circle, ${symbolData.glow}40 0%, transparent 70%)`,
                        transform: `scale(${glowIntensity})`
                      }}
                    ></div>
                    
                    {/* Symbol */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-5xl"
                      animate={isSpinning ? { 
                        scale: [1, 1.2, 1],
                        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                      } : {}}
                      transition={{ duration: 0.5, repeat: isSpinning ? Infinity : 0 }}
                      style={{
                        textShadow: `0 0 20px ${symbolData.glow}, 0 0 40px ${symbolData.glow}`,
                        filter: `drop-shadow(0 0 10px ${symbolData.glow})`
                      }}
                    >
                      {symbol}
                    </motion.div>
                    
                    {/* Rarity Indicator */}
                    <div className={`absolute top-1 right-1 w-3 h-3 rounded-full ${
                      symbolData.rarity === 'legendary' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      symbolData.rarity === 'epic' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                      symbolData.rarity === 'rare' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      'bg-gradient-to-r from-gray-400 to-gray-600'
                    } shadow-lg animate-pulse`}></div>
                    
                    {/* Reflection Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-lg"></div>
                  </div>
                  
                  {/* Spinning Trail Effect */}
                  {isSpinning && (
                    <motion.div
                      className="absolute inset-0 rounded-xl"
                      animate={{
                        background: [
                          `conic-gradient(from 0deg, transparent, ${symbolData.glow}60, transparent)`,
                          `conic-gradient(from 360deg, transparent, ${symbolData.glow}60, transparent)`
                        ]
                      }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    ></motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
          
          {/* Enhanced Spin Button */}
          <div className="text-center">
            <motion.button
              onClick={onSpin}
              disabled={disabled || isSpinning}
              className="relative group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold text-xl px-12 py-4 rounded-full border-4 border-yellow-400 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                {/* Button Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/50 to-red-600/50 rounded-full animate-pulse"></div>
                <span className="relative z-10">
                  {isSpinning ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      ⚡
                    </motion.span>
                  ) : (
                    'SPIN'
                  )}
                </span>
              </div>
            </motion.button>
          </div>
        </div>
        
        {/* Side Decorations */}
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
          ))}
        </div>
      </div>
      
      {/* Win Particles */}
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none"
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              y: particle.y - 100,
              scale: [0, 1, 0],
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}