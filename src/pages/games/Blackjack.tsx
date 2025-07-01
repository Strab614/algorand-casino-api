import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Plus, Minus } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useGame } from '../../contexts/GameContext'
import toast from 'react-hot-toast'

interface Card {
  suit: string
  value: string
  numValue: number
}

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export default function Blackjack() {
  const { isConnected, chipBalance } = useWallet()
  const { gameState, placeBet, endGame, resetGame } = useGame()
  
  const [deck, setDeck] = useState<Card[]>([])
  const [playerHand, setPlayerHand] = useState<Card[]>([])
  const [dealerHand, setDealerHand] = useState<Card[]>([])
  const [gamePhase, setGamePhase] = useState<'betting' | 'playing' | 'dealer' | 'finished'>('betting')
  const [betAmount, setBetAmount] = useState(10)
  const [showDealerCard, setShowDealerCard] = useState(false)

  const createDeck = (): Card[] => {
    const newDeck: Card[] = []
    for (const suit of SUITS) {
      for (const value of VALUES) {
        let numValue = parseInt(value)
        if (value === 'A') numValue = 11
        else if (['J', 'Q', 'K'].includes(value)) numValue = 10
        
        newDeck.push({ suit, value, numValue })
      }
    }
    return shuffleDeck(newDeck)
  }

  const shuffleDeck = (deck: Card[]): Card[] => {
    const shuffled = [...deck]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const calculateHandValue = (hand: Card[]): number => {
    let value = 0
    let aces = 0
    
    for (const card of hand) {
      if (card.value === 'A') {
        aces++
        value += 11
      } else {
        value += card.numValue
      }
    }
    
    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10
      aces--
    }
    
    return value
  }

  const dealCard = (currentDeck: Card[]): { card: Card; remainingDeck: Card[] } => {
    const card = currentDeck[0]
    const remainingDeck = currentDeck.slice(1)
    return { card, remainingDeck }
  }

  const startNewGame = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    const canBet = await placeBet(betAmount, 'blackjack')
    if (!canBet) return

    const newDeck = createDeck()
    let currentDeck = newDeck

    // Deal initial cards
    const { card: playerCard1, remainingDeck: deck1 } = dealCard(currentDeck)
    const { card: dealerCard1, remainingDeck: deck2 } = dealCard(deck1)
    const { card: playerCard2, remainingDeck: deck3 } = dealCard(deck2)
    const { card: dealerCard2, remainingDeck: finalDeck } = dealCard(deck3)

    setDeck(finalDeck)
    setPlayerHand([playerCard1, playerCard2])
    setDealerHand([dealerCard1, dealerCard2])
    setGamePhase('playing')
    setShowDealerCard(false)

    // Check for blackjack
    const playerValue = calculateHandValue([playerCard1, playerCard2])
    const dealerValue = calculateHandValue([dealerCard1, dealerCard2])

    if (playerValue === 21) {
      if (dealerValue === 21) {
        // Push
        endGame('push', betAmount)
        setGamePhase('finished')
        setShowDealerCard(true)
      } else {
        // Player blackjack
        endGame('win', betAmount * 2.5)
        setGamePhase('finished')
        setShowDealerCard(true)
      }
    }
  }

  const hit = () => {
    if (gamePhase !== 'playing') return

    const { card, remainingDeck } = dealCard(deck)
    const newPlayerHand = [...playerHand, card]
    setPlayerHand(newPlayerHand)
    setDeck(remainingDeck)

    const playerValue = calculateHandValue(newPlayerHand)
    if (playerValue > 21) {
      // Bust
      endGame('lose', 0)
      setGamePhase('finished')
      setShowDealerCard(true)
    }
  }

  const stand = () => {
    if (gamePhase !== 'playing') return
    
    setGamePhase('dealer')
    setShowDealerCard(true)
    dealerPlay()
  }

  const dealerPlay = () => {
    let currentDealerHand = [...dealerHand]
    let currentDeck = [...deck]
    
    const dealerInterval = setInterval(() => {
      const dealerValue = calculateHandValue(currentDealerHand)
      
      if (dealerValue < 17) {
        const { card, remainingDeck } = dealCard(currentDeck)
        currentDealerHand = [...currentDealerHand, card]
        currentDeck = remainingDeck
        setDealerHand(currentDealerHand)
        setDeck(currentDeck)
      } else {
        clearInterval(dealerInterval)
        
        // Determine winner
        const playerValue = calculateHandValue(playerHand)
        const finalDealerValue = calculateHandValue(currentDealerHand)
        
        if (finalDealerValue > 21) {
          // Dealer bust
          endGame('win', betAmount * 2)
        } else if (playerValue > finalDealerValue) {
          // Player wins
          endGame('win', betAmount * 2)
        } else if (playerValue < finalDealerValue) {
          // Dealer wins
          endGame('lose', 0)
        } else {
          // Push
          endGame('push', betAmount)
        }
        
        setGamePhase('finished')
      }
    }, 1000)
  }

  const resetHand = () => {
    setPlayerHand([])
    setDealerHand([])
    setGamePhase('betting')
    setShowDealerCard(false)
    resetGame()
  }

  const playerValue = calculateHandValue(playerHand)
  const dealerValue = calculateHandValue(dealerHand)

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
          <h1 className="text-4xl font-bold text-white mb-4">Blackjack</h1>
          <p className="text-gray-400">
            Get as close to 21 as possible without going over. Beat the dealer to win!
          </p>
        </motion.div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white">{chipBalance.toFixed(0)}</div>
            <div className="text-sm text-gray-400">CHIPS Balance</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-algorand-400">{betAmount}</div>
            <div className="text-sm text-gray-400">Bet Amount</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-casino-gold">
              {gameState.gameHistory.filter(g => g.result === 'win').length}
            </div>
            <div className="text-sm text-gray-400">Wins</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {gameState.totalWinnings.toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Total Won</div>
          </div>
        </div>

        {/* Game Table */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="game-table mx-auto p-8 mb-8 max-w-4xl"
        >
          {/* Dealer Section */}
          <div className="mb-12">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                Dealer {showDealerCard && `(${dealerValue})`}
              </h3>
            </div>
            <div className="flex justify-center space-x-2">
              {dealerHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className={`card w-16 h-24 flex flex-col items-center justify-center text-lg font-bold ${
                    index === 1 && !showDealerCard
                      ? 'bg-slate-700 text-slate-500'
                      : card.suit === '♥' || card.suit === '♦'
                      ? 'text-red-500'
                      : 'text-black'
                  }`}
                >
                  {index === 1 && !showDealerCard ? (
                    <div className="text-2xl">?</div>
                  ) : (
                    <>
                      <div>{card.value}</div>
                      <div>{card.suit}</div>
                    </>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Player Section */}
          <div>
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-white mb-2">
                Player {playerHand.length > 0 && `(${playerValue})`}
              </h3>
            </div>
            <div className="flex justify-center space-x-2 mb-6">
              {playerHand.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className={`card w-16 h-24 flex flex-col items-center justify-center text-lg font-bold ${
                    card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'
                  }`}
                >
                  <div>{card.value}</div>
                  <div>{card.suit}</div>
                </motion.div>
              ))}
            </div>

            {/* Game Controls */}
            <div className="text-center space-y-4">
              {gamePhase === 'betting' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setBetAmount(Math.max(1, betAmount - 5))}
                      className="btn-primary p-2"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-bold text-xl">
                      Bet: {betAmount} CHIPS
                    </span>
                    <button
                      onClick={() => setBetAmount(betAmount + 5)}
                      className="btn-primary p-2"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={startNewGame}
                    disabled={!isConnected || betAmount > chipBalance}
                    className="btn-gold text-xl px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deal Cards
                  </button>
                </div>
              )}

              {gamePhase === 'playing' && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={hit}
                    className="btn-primary text-lg px-6 py-3"
                  >
                    Hit
                  </button>
                  <button
                    onClick={stand}
                    className="btn-gold text-lg px-6 py-3"
                  >
                    Stand
                  </button>
                </div>
              )}

              {gamePhase === 'dealer' && (
                <div className="text-white text-lg">
                  Dealer is playing...
                </div>
              )}

              {gamePhase === 'finished' && (
                <div className="space-y-4">
                  <div className="text-2xl font-bold text-white">
                    {playerValue > 21 ? 'Bust! You lose.' :
                     dealerValue > 21 ? 'Dealer busts! You win!' :
                     playerValue > dealerValue ? 'You win!' :
                     playerValue < dealerValue ? 'Dealer wins.' :
                     'Push! It\'s a tie.'}
                  </div>
                  <button
                    onClick={resetHand}
                    className="btn-primary text-lg px-6 py-3 flex items-center space-x-2 mx-auto"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>New Hand</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">Objective</h4>
              <p>Get as close to 21 as possible without going over, and beat the dealer's hand.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Card Values</h4>
              <p>Number cards = face value, Face cards = 10, Aces = 1 or 11</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Blackjack</h4>
              <p>21 with your first two cards pays 2.5:1</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Dealer Rules</h4>
              <p>Dealer must hit on 16 and stand on 17</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}