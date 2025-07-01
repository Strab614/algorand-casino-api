import React from 'react'
import { motion } from 'framer-motion'

interface Card {
  suit: string
  value: string
}

interface EnhancedBlackjackTableProps {
  playerHand: Card[]
  dealerHand: Card[]
  playerValue: number
  dealerValue: number
  showDealerCard: boolean
  gamePhase: 'betting' | 'playing' | 'dealer' | 'finished'
  onHit: () => void
  onStand: () => void
  onDeal: () => void
  disabled?: boolean
}

export default function EnhancedBlackjackTable({
  playerHand,
  dealerHand,
  playerValue,
  dealerValue,
  showDealerCard,
  gamePhase,
  onHit,
  onStand,
  onDeal,
  disabled
}: EnhancedBlackjackTableProps) {
  const getSuitColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? '#dc2626' : '#1f2937'
  }

  const getSuitGlow = (suit: string) => {
    return suit === '♥' || suit === '♦' ? '#ef4444' : '#374151'
  }

  const getHandGlow = (value: number) => {
    if (value === 21) return '#10b981' // green for 21
    if (value > 21) return '#ef4444' // red for bust
    return '#3b82f6' // blue for normal
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Table Surface */}
      <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-3xl border-8 border-yellow-600 shadow-2xl overflow-hidden">
        {/* Table Texture */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-green-600/50 via-transparent to-green-900/50"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
        </div>
        
        {/* Felt Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.1) 3px, rgba(255,255,255,0.1) 6px)`
          }}></div>
        </div>
        
        <div className="relative p-12 min-h-[500px]">
          {/* Dealer Section */}
          <div className="mb-16">
            <div className="text-center mb-6">
              <motion.div
                className="inline-block bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
                animate={gamePhase === 'dealer' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: gamePhase === 'dealer' ? Infinity : 0 }}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  DEALER {showDealerCard && `(${dealerValue})`}
                </h3>
                {showDealerCard && (
                  <div 
                    className="text-lg font-semibold"
                    style={{ 
                      color: getHandGlow(dealerValue),
                      textShadow: `0 0 10px ${getHandGlow(dealerValue)}`
                    }}
                  >
                    {dealerValue > 21 ? 'BUST!' : dealerValue === 21 ? 'BLACKJACK!' : ''}
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Dealer Cards */}
            <div className="flex justify-center space-x-4">
              {dealerHand.map((card, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: -50, rotateY: 180 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    rotateY: (index === 1 && !showDealerCard) ? 180 : 0 
                  }}
                  transition={{ duration: 0.6, delay: index * 0.3 }}
                >
                  <div className={`w-20 h-32 rounded-xl border-3 shadow-xl ${
                    index === 1 && !showDealerCard
                      ? 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 border-blue-700'
                      : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300'
                  }`}>
                    {index === 1 && !showDealerCard ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-12 h-16 border-2 border-blue-400 rounded-lg opacity-50 flex items-center justify-center">
                          <div className="text-blue-400 text-3xl">?</div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 h-full flex flex-col justify-between">
                        <div 
                          className="text-xl font-bold"
                          style={{ 
                            color: getSuitColor(card.suit),
                            textShadow: `0 0 8px ${getSuitGlow(card.suit)}`
                          }}
                        >
                          {card.value}
                        </div>
                        <div 
                          className="text-center text-4xl"
                          style={{ 
                            color: getSuitColor(card.suit),
                            filter: `drop-shadow(0 0 8px ${getSuitGlow(card.suit)})`
                          }}
                        >
                          {card.suit}
                        </div>
                        <div 
                          className="text-xl font-bold transform rotate-180 self-end"
                          style={{ 
                            color: getSuitColor(card.suit),
                            textShadow: `0 0 8px ${getSuitGlow(card.suit)}`
                          }}
                        >
                          {card.value}
                        </div>
                      </div>
                    )}
                    
                    {/* Card Glow */}
                    {!(index === 1 && !showDealerCard) && (
                      <div 
                        className="absolute inset-0 rounded-xl opacity-40 animate-pulse"
                        style={{ 
                          boxShadow: `0 0 20px ${getSuitGlow(card.suit)}`
                        }}
                      ></div>
                    )}
                    
                    {/* Card Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Player Section */}
          <div>
            <div className="text-center mb-6">
              <motion.div
                className="inline-block bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 border-slate-600 shadow-xl"
                animate={gamePhase === 'playing' ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: gamePhase === 'playing' ? Infinity : 0 }}
              >
                <h3 className="text-xl font-bold text-white mb-2">
                  PLAYER {playerHand.length > 0 && `(${playerValue})`}
                </h3>
                {playerHand.length > 0 && (
                  <div 
                    className="text-lg font-semibold"
                    style={{ 
                      color: getHandGlow(playerValue),
                      textShadow: `0 0 10px ${getHandGlow(playerValue)}`
                    }}
                  >
                    {playerValue > 21 ? 'BUST!' : playerValue === 21 ? 'BLACKJACK!' : ''}
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Player Cards */}
            <div className="flex justify-center space-x-4 mb-8">
              {playerHand.map((card, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 50, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.3 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <div className="w-20 h-32 bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl border-3 border-gray-300 shadow-xl">
                    <div className="p-3 h-full flex flex-col justify-between">
                      <div 
                        className="text-xl font-bold"
                        style={{ 
                          color: getSuitColor(card.suit),
                          textShadow: `0 0 8px ${getSuitGlow(card.suit)}`
                        }}
                      >
                        {card.value}
                      </div>
                      <div 
                        className="text-center text-4xl"
                        style={{ 
                          color: getSuitColor(card.suit),
                          filter: `drop-shadow(0 0 8px ${getSuitGlow(card.suit)})`
                        }}
                      >
                        {card.suit}
                      </div>
                      <div 
                        className="text-xl font-bold transform rotate-180 self-end"
                        style={{ 
                          color: getSuitColor(card.suit),
                          textShadow: `0 0 8px ${getSuitGlow(card.suit)}`
                        }}
                      >
                        {card.value}
                      </div>
                    </div>
                    
                    {/* Card Glow */}
                    <div 
                      className="absolute inset-0 rounded-xl opacity-40 animate-pulse"
                      style={{ 
                        boxShadow: `0 0 20px ${getSuitGlow(card.suit)}`
                      }}
                    ></div>
                    
                    {/* Card Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent rounded-xl"></div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="text-center space-x-6">
              {gamePhase === 'betting' && (
                <motion.button
                  onClick={onDeal}
                  disabled={disabled}
                  className="relative group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-green-600 to-green-700 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-bold text-xl px-8 py-4 rounded-xl border-4 border-yellow-400 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed">
                    DEAL CARDS
                  </div>
                </motion.button>
              )}
              
              {gamePhase === 'playing' && (
                <>
                  <motion.button
                    onClick={onHit}
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white font-bold text-lg px-6 py-3 rounded-xl border-3 border-yellow-400 shadow-xl">
                      HIT
                    </div>
                  </motion.button>
                  
                  <motion.button
                    onClick={onStand}
                    className="relative group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 text-white font-bold text-lg px-6 py-3 rounded-xl border-3 border-yellow-400 shadow-xl">
                      STAND
                    </div>
                  </motion.button>
                </>
              )}
              
              {gamePhase === 'dealer' && (
                <div className="text-white text-xl font-semibold animate-pulse">
                  Dealer is playing...
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Table Edge Lighting */}
        <div className="absolute inset-0 rounded-3xl border-4 border-yellow-400/30 animate-pulse"></div>
      </div>
    </div>
  )
}