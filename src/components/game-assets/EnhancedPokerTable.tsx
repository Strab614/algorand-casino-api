import React from 'react'
import { motion } from 'framer-motion'

interface Card {
  suit: string
  value: string
  faceUp?: boolean
}

interface Player {
  id: string
  name: string
  chips: number
  hand: Card[]
  position: { x: number; y: number }
  isActive?: boolean
  isDealer?: boolean
}

interface EnhancedPokerTableProps {
  players: Player[]
  communityCards: Card[]
  pot: number
  currentPlayer?: string
}

export default function EnhancedPokerTable({ players, communityCards, pot, currentPlayer }: EnhancedPokerTableProps) {
  const getSuitColor = (suit: string) => {
    return suit === '♥' || suit === '♦' ? '#dc2626' : '#1f2937'
  }

  const getSuitGlow = (suit: string) => {
    return suit === '♥' || suit === '♦' ? '#ef4444' : '#374151'
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Enhanced Table Surface */}
      <div className="relative">
        {/* Table Shadow */}
        <div className="absolute inset-0 bg-black/30 rounded-full transform translate-y-4 blur-xl"></div>
        
        {/* Main Table */}
        <div className="relative bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-full border-8 border-yellow-600 shadow-2xl overflow-hidden">
          {/* Table Texture */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-green-600/50 via-transparent to-green-900/50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]"></div>
          </div>
          
          {/* Felt Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)`
            }}></div>
          </div>
          
          <div className="relative p-16 min-h-[600px]">
            {/* Center Pot Area */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Pot Display */}
              <motion.div
                className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 rounded-full p-6 shadow-xl border-4 border-yellow-300"
                animate={{ scale: pot > 0 ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 2, repeat: pot > 0 ? Infinity : 0 }}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-900 mb-1">POT</div>
                  <div className="text-3xl font-bold text-yellow-900">{pot}</div>
                  <div className="text-sm text-yellow-800">CHIPS</div>
                </div>
                
                {/* Pot Glow */}
                <div className="absolute inset-0 bg-yellow-400/50 rounded-full animate-pulse blur-lg"></div>
              </motion.div>
              
              {/* Community Cards */}
              <div className="flex justify-center space-x-3 mt-8">
                {Array.from({ length: 5 }).map((_, index) => {
                  const card = communityCards[index]
                  return (
                    <motion.div
                      key={index}
                      className="relative"
                      initial={{ opacity: 0, y: -20, rotateY: 180 }}
                      animate={{ 
                        opacity: card ? 1 : 0.3,
                        y: 0,
                        rotateY: card ? 0 : 180
                      }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                    >
                      <div className={`w-16 h-24 rounded-lg border-2 shadow-lg ${
                        card 
                          ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300' 
                          : 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 border-blue-700'
                      }`}>
                        {card ? (
                          <div className="p-2 h-full flex flex-col justify-between">
                            <div 
                              className="text-lg font-bold"
                              style={{ 
                                color: getSuitColor(card.suit),
                                textShadow: `0 0 10px ${getSuitGlow(card.suit)}`
                              }}
                            >
                              {card.value}
                            </div>
                            <div 
                              className="text-center text-2xl"
                              style={{ 
                                color: getSuitColor(card.suit),
                                filter: `drop-shadow(0 0 5px ${getSuitGlow(card.suit)})`
                              }}
                            >
                              {card.suit}
                            </div>
                            <div 
                              className="text-lg font-bold transform rotate-180 self-end"
                              style={{ 
                                color: getSuitColor(card.suit),
                                textShadow: `0 0 10px ${getSuitGlow(card.suit)}`
                              }}
                            >
                              {card.value}
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-8 h-8 border-2 border-blue-400 rounded-lg opacity-50"></div>
                          </div>
                        )}
                        
                        {/* Card Glow Effect */}
                        {card && (
                          <div 
                            className="absolute inset-0 rounded-lg opacity-30 animate-pulse"
                            style={{ 
                              boxShadow: `0 0 20px ${getSuitGlow(card.suit)}`
                            }}
                          ></div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
            
            {/* Players */}
            {players.map((player, index) => (
              <motion.div
                key={player.id}
                className="absolute"
                style={{
                  left: `${player.position.x}%`,
                  top: `${player.position.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                animate={player.isActive ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 1, repeat: player.isActive ? Infinity : 0 }}
              >
                {/* Player Area */}
                <div className={`relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-xl p-4 border-2 shadow-xl ${
                  player.id === currentPlayer 
                    ? 'border-yellow-400 shadow-yellow-400/50' 
                    : 'border-slate-600'
                }`}>
                  {/* Active Player Glow */}
                  {player.id === currentPlayer && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-xl animate-pulse"></div>
                  )}
                  
                  {/* Player Info */}
                  <div className="relative z-10 text-center mb-3">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <span className="text-white font-semibold">{player.name}</span>
                      {player.isDealer && (
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-xs font-bold text-yellow-900">
                          D
                        </div>
                      )}
                    </div>
                    <div className="text-yellow-400 font-bold">{player.chips} CHIPS</div>
                  </div>
                  
                  {/* Player Cards */}
                  <div className="flex justify-center space-x-2">
                    {player.hand.map((card, cardIndex) => (
                      <motion.div
                        key={cardIndex}
                        className="relative"
                        initial={{ opacity: 0, rotateY: 180 }}
                        animate={{ opacity: 1, rotateY: card.faceUp !== false ? 0 : 180 }}
                        transition={{ duration: 0.6, delay: cardIndex * 0.1 }}
                      >
                        <div className={`w-12 h-18 rounded-md border shadow-md ${
                          card.faceUp !== false
                            ? 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border-gray-300'
                            : 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 border-blue-700'
                        }`}>
                          {card.faceUp !== false ? (
                            <div className="p-1 h-full flex flex-col justify-between">
                              <div 
                                className="text-xs font-bold"
                                style={{ color: getSuitColor(card.suit) }}
                              >
                                {card.value}
                              </div>
                              <div 
                                className="text-center text-lg"
                                style={{ color: getSuitColor(card.suit) }}
                              >
                                {card.suit}
                              </div>
                              <div 
                                className="text-xs font-bold transform rotate-180 self-end"
                                style={{ color: getSuitColor(card.suit) }}
                              >
                                {card.value}
                              </div>
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-4 h-4 border border-blue-400 rounded opacity-50"></div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Table Edge Lighting */}
          <div className="absolute inset-0 rounded-full border-4 border-yellow-400/30 animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}