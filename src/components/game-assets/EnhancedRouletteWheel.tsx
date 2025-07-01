import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface EnhancedRouletteWheelProps {
  isSpinning: boolean
  winningNumber?: number | null
  onSpin: () => void
}

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

export default function EnhancedRouletteWheel({ isSpinning, winningNumber, onSpin }: EnhancedRouletteWheelProps) {
  const [rotation, setRotation] = useState(0)
  const [ballPosition, setBallPosition] = useState(0)
  const [glowIntensity, setGlowIntensity] = useState(1)

  useEffect(() => {
    if (isSpinning) {
      const interval = setInterval(() => {
        setGlowIntensity(prev => prev === 1 ? 1.8 : 1)
      }, 150)
      return () => clearInterval(interval)
    }
  }, [isSpinning])

  const getNumberColor = (num: number) => {
    if (num === 0) return '#059669' // green
    return RED_NUMBERS.includes(num) ? '#dc2626' : '#1f2937' // red or black
  }

  const getNumberGlow = (num: number) => {
    if (num === 0) return '#10b981'
    return RED_NUMBERS.includes(num) ? '#ef4444' : '#374151'
  }

  return (
    <div className="relative flex items-center justify-center">
      {/* Wheel Base */}
      <div className="relative">
        {/* Outer Ring Shadow */}
        <div className="absolute inset-0 bg-black/40 rounded-full transform translate-y-2 blur-2xl scale-110"></div>
        
        {/* Outer Decorative Ring */}
        <div className="relative w-96 h-96 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full p-4 shadow-2xl">
          {/* Decorative Elements */}
          <div className="absolute inset-0 rounded-full border-8 border-yellow-300 opacity-50"></div>
          <div className="absolute inset-4 rounded-full border-4 border-yellow-200 opacity-30"></div>
          
          {/* Inner Wheel */}
          <motion.div
            className="relative w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-full border-4 border-yellow-400 overflow-hidden"
            animate={{ rotate: rotation }}
            transition={{ duration: isSpinning ? 3 : 0, ease: "easeOut" }}
          >
            {/* Wheel Numbers */}
            {ROULETTE_NUMBERS.map((number, index) => {
              const angle = (index * 360) / ROULETTE_NUMBERS.length
              const isWinning = winningNumber === number
              
              return (
                <motion.div
                  key={number}
                  className="absolute w-8 h-12 flex items-center justify-center"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${angle}deg) translateY(-140px) rotate(-${angle}deg)`,
                    transformOrigin: '50% 140px'
                  }}
                  animate={isWinning ? { 
                    scale: [1, 1.3, 1],
                    filter: ['brightness(1)', 'brightness(2)', 'brightness(1)']
                  } : {}}
                  transition={{ duration: 0.5, repeat: isWinning ? 3 : 0 }}
                >
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-bold text-sm rounded-md border-2 border-yellow-400 shadow-lg"
                    style={{
                      backgroundColor: getNumberColor(number),
                      boxShadow: isWinning 
                        ? `0 0 20px ${getNumberGlow(number)}, 0 0 40px ${getNumberGlow(number)}` 
                        : `0 0 10px ${getNumberGlow(number)}`,
                      transform: `scale(${isWinning ? glowIntensity : 1})`
                    }}
                  >
                    {number}
                  </div>
                </motion.div>
              )
            })}
            
            {/* Center Hub */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full border-4 border-yellow-300 shadow-xl">
              <div className="w-full h-full bg-gradient-to-br from-yellow-300/50 to-transparent rounded-full"></div>
            </div>
            
            {/* Wheel Sectors Background */}
            <div className="absolute inset-0 rounded-full">
              {ROULETTE_NUMBERS.map((number, index) => {
                const angle = (index * 360) / ROULETTE_NUMBERS.length
                const nextAngle = ((index + 1) * 360) / ROULETTE_NUMBERS.length
                
                return (
                  <div
                    key={`sector-${number}`}
                    className="absolute inset-0"
                    style={{
                      background: `conic-gradient(from ${angle}deg, ${getNumberColor(number)} 0deg, ${getNumberColor(number)} ${nextAngle - angle}deg, transparent ${nextAngle - angle}deg)`,
                      opacity: 0.3
                    }}
                  />
                )
              })}
            </div>
          </motion.div>
          
          {/* Ball */}
          <motion.div
            className="absolute w-4 h-4 bg-gradient-to-br from-white via-gray-100 to-gray-200 rounded-full border-2 border-gray-300 shadow-lg"
            style={{
              left: '50%',
              top: '50%',
              transform: `rotate(${ballPosition}deg) translateY(-160px)`,
              transformOrigin: '50% 160px'
            }}
            animate={isSpinning ? { 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            } : {}}
            transition={isSpinning ? { 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear",
              scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
            } : {}}
          >
            {/* Ball Glow */}
            <div className="absolute inset-0 bg-white rounded-full animate-pulse blur-sm"></div>
          </motion.div>
          
          {/* Wheel Pointer */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-yellow-300 shadow-lg"></div>
        </div>
        
        {/* Ambient Lighting */}
        <div className="absolute inset-0 rounded-full bg-gradient-radial from-yellow-400/20 via-transparent to-transparent animate-pulse scale-125"></div>
        
        {/* Spinning Effect Rings */}
        {isSpinning && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-yellow-400/60"
              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-2 border-yellow-300/40"
              animate={{ rotate: -360, scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </>
        )}
      </div>
      
      {/* Spin Button */}
      <motion.button
        onClick={onSpin}
        disabled={isSpinning}
        className="absolute bottom-[-80px] left-1/2 transform -translate-x-1/2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold text-lg px-8 py-3 rounded-full border-4 border-yellow-400 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
            <span className="relative z-10">
              {isSpinning ? (
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="inline-block"
                >
                  🎯
                </motion.span>
              ) : (
                'SPIN'
              )}
            </span>
          </div>
        </div>
      </motion.button>
    </div>
  )
}