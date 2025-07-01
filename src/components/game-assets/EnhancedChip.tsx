import React from 'react'
import { motion } from 'framer-motion'

interface EnhancedChipProps {
  value: number
  color?: 'red' | 'blue' | 'green' | 'black' | 'purple' | 'orange' | 'gold'
  size?: 'small' | 'medium' | 'large'
  isAnimated?: boolean
  onClick?: () => void
  count?: number
}

export default function EnhancedChip({ 
  value, 
  color = 'red', 
  size = 'medium', 
  isAnimated = false,
  onClick,
  count = 1
}: EnhancedChipProps) {
  const getChipColors = (chipColor: string) => {
    const colors = {
      red: {
        primary: 'from-red-500 via-red-600 to-red-700',
        secondary: 'from-red-400 to-red-500',
        border: 'border-red-300',
        glow: '#ef4444'
      },
      blue: {
        primary: 'from-blue-500 via-blue-600 to-blue-700',
        secondary: 'from-blue-400 to-blue-500',
        border: 'border-blue-300',
        glow: '#3b82f6'
      },
      green: {
        primary: 'from-green-500 via-green-600 to-green-700',
        secondary: 'from-green-400 to-green-500',
        border: 'border-green-300',
        glow: '#10b981'
      },
      black: {
        primary: 'from-gray-800 via-gray-900 to-black',
        secondary: 'from-gray-700 to-gray-800',
        border: 'border-gray-600',
        glow: '#374151'
      },
      purple: {
        primary: 'from-purple-500 via-purple-600 to-purple-700',
        secondary: 'from-purple-400 to-purple-500',
        border: 'border-purple-300',
        glow: '#8b5cf6'
      },
      orange: {
        primary: 'from-orange-500 via-orange-600 to-orange-700',
        secondary: 'from-orange-400 to-orange-500',
        border: 'border-orange-300',
        glow: '#f97316'
      },
      gold: {
        primary: 'from-yellow-400 via-yellow-500 to-yellow-600',
        secondary: 'from-yellow-300 to-yellow-400',
        border: 'border-yellow-200',
        glow: '#eab308'
      }
    }
    return colors[chipColor]
  }

  const getSizeClasses = (chipSize: string) => {
    const sizes = {
      small: 'w-12 h-12 text-xs',
      medium: 'w-16 h-16 text-sm',
      large: 'w-20 h-20 text-base'
    }
    return sizes[chipSize]
  }

  const chipColors = getChipColors(color)
  const sizeClasses = getSizeClasses(size)

  return (
    <div className="relative">
      {/* Chip Stack Effect */}
      {count > 1 && (
        <>
          {Array.from({ length: Math.min(count - 1, 5) }).map((_, index) => (
            <div
              key={index}
              className={`absolute ${sizeClasses} rounded-full bg-gradient-to-br ${chipColors.primary} border-4 ${chipColors.border} shadow-lg`}
              style={{
                transform: `translate(${(index + 1) * 2}px, ${(index + 1) * -2}px)`,
                zIndex: -(index + 1),
                opacity: 0.8 - (index * 0.1)
              }}
            />
          ))}
        </>
      )}
      
      {/* Main Chip */}
      <motion.div
        className={`relative ${sizeClasses} cursor-pointer group`}
        onClick={onClick}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.95 }}
        animate={isAnimated ? {
          y: [0, -5, 0],
          rotate: [0, 5, -5, 0]
        } : {}}
        transition={isAnimated ? {
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        } : {}}
      >
        {/* Chip Shadow */}
        <div 
          className={`absolute inset-0 rounded-full blur-lg opacity-50`}
          style={{ 
            background: chipColors.glow,
            transform: 'translateY(4px) scale(0.9)'
          }}
        />
        
        {/* Main Chip Body */}
        <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${chipColors.primary} border-4 ${chipColors.border} shadow-xl overflow-hidden`}>
          {/* Inner Ring */}
          <div className={`absolute inset-2 rounded-full border-2 border-white/30`} />
          
          {/* Center Circle */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br ${chipColors.secondary} border-2 border-white/50 flex items-center justify-center`}>
            <span className="text-white font-bold text-xs">{value}</span>
          </div>
          
          {/* Decorative Patterns */}
          <div className="absolute inset-0 rounded-full">
            {/* Edge Dots */}
            {Array.from({ length: 8 }).map((_, index) => {
              const angle = (index * 45) - 22.5
              return (
                <div
                  key={index}
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${angle}deg) translateY(-${size === 'large' ? '32' : size === 'medium' ? '24' : '18'}px) rotate(-${angle}deg) translate(-50%, -50%)`
                  }}
                />
              )
            })}
          </div>
          
          {/* Chip Reflection */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-transparent" />
          
          {/* Hover Glow */}
          <div 
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"
            style={{ 
              boxShadow: `inset 0 0 20px ${chipColors.glow}`
            }}
          />
        </div>
        
        {/* Chip Count Badge */}
        {count > 1 && (
          <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center border-2 border-yellow-300 shadow-lg">
            {count > 99 ? '99+' : count}
          </div>
        )}
        
        {/* Animated Glow Ring */}
        {isAnimated && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 opacity-60"
            style={{ borderColor: chipColors.glow }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 0.2, 0.6]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </div>
  )
}