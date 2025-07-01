import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface ParticleEffectsProps {
  trigger: boolean
  type: 'win' | 'jackpot' | 'coins' | 'stars' | 'confetti'
  intensity?: 'low' | 'medium' | 'high'
  duration?: number
}

export default function ParticleEffects({ 
  trigger, 
  type, 
  intensity = 'medium', 
  duration = 3000 
}: ParticleEffectsProps) {
  const [particles, setParticles] = useState<Particle[]>([])

  const getParticleConfig = (effectType: string) => {
    const configs = {
      win: {
        colors: ['#ffd700', '#ffed4e', '#fbbf24', '#f59e0b'],
        symbols: ['✨', '⭐', '💫', '🌟'],
        count: intensity === 'high' ? 50 : intensity === 'medium' ? 30 : 15
      },
      jackpot: {
        colors: ['#ff6b6b', '#ffd93d', '#6bcf7f', '#4d96ff', '#9c88ff'],
        symbols: ['💎', '👑', '🎉', '🏆', '💰'],
        count: intensity === 'high' ? 80 : intensity === 'medium' ? 50 : 25
      },
      coins: {
        colors: ['#ffd700', '#ffed4e', '#fbbf24'],
        symbols: ['🪙', '💰', '💵'],
        count: intensity === 'high' ? 40 : intensity === 'medium' ? 25 : 12
      },
      stars: {
        colors: ['#ffffff', '#ffd700', '#87ceeb', '#dda0dd'],
        symbols: ['⭐', '✨', '🌟', '💫'],
        count: intensity === 'high' ? 60 : intensity === 'medium' ? 35 : 18
      },
      confetti: {
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'],
        symbols: ['🎊', '🎉', '🎈', '🎁'],
        count: intensity === 'high' ? 70 : intensity === 'medium' ? 45 : 22
      }
    }
    return configs[effectType] || configs.win
  }

  const createParticles = () => {
    const config = getParticleConfig(type)
    const newParticles: Particle[] = []

    for (let i = 0; i < config.count; i++) {
      const particle: Particle = {
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + 50,
        vx: (Math.random() - 0.5) * 10,
        vy: -(Math.random() * 15 + 10),
        life: 0,
        maxLife: Math.random() * 2000 + 1000,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: Math.random() * 20 + 10
      }
      newParticles.push(particle)
    }

    setParticles(newParticles)
  }

  const updateParticles = () => {
    setParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.5, // gravity
          life: particle.life + 16 // assuming 60fps
        }))
        .filter(particle => 
          particle.life < particle.maxLife && 
          particle.y < window.innerHeight + 100 &&
          particle.x > -100 && 
          particle.x < window.innerWidth + 100
        )
    )
  }

  useEffect(() => {
    if (trigger) {
      createParticles()
      
      const interval = setInterval(updateParticles, 16) // 60fps
      const timeout = setTimeout(() => {
        clearInterval(interval)
        setParticles([])
      }, duration)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [trigger, type, intensity, duration])

  const getParticleSymbol = (particleType: string) => {
    const config = getParticleConfig(particleType)
    return config.symbols[Math.floor(Math.random() * config.symbols.length)]
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute text-2xl font-bold"
            style={{
              left: particle.x,
              top: particle.y,
              color: particle.color,
              fontSize: particle.size,
              textShadow: `0 0 10px ${particle.color}`,
              filter: `drop-shadow(0 0 5px ${particle.color})`
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ 
              opacity: 1 - (particle.life / particle.maxLife),
              scale: [0, 1, 0.8],
              rotate: [0, 360]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: particle.maxLife / 1000,
              ease: "easeOut"
            }}
          >
            {getParticleSymbol(type)}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Fireworks Effect Component
export function FireworksEffect({ trigger, duration = 5000 }: { trigger: boolean; duration?: number }) {
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; color: string }>>([])

  useEffect(() => {
    if (trigger) {
      const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#ffd93d']
      const newFireworks = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * (window.innerHeight / 2) + 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      }))
      
      setFireworks(newFireworks)
      
      const timeout = setTimeout(() => {
        setFireworks([])
      }, duration)

      return () => clearTimeout(timeout)
    }
  }, [trigger, duration])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {fireworks.map(firework => (
          <motion.div
            key={firework.id}
            className="absolute"
            style={{ left: firework.x, top: firework.y }}
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1, 0] }}
            exit={{ scale: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Firework Burst */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180)
              const distance = 100
              return (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{ backgroundColor: firework.color }}
                  initial={{ x: 0, y: 0, opacity: 1 }}
                  animate={{
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )
            })}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}