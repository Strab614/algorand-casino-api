import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Users, Trophy } from 'lucide-react'
import { useWallet } from '../../contexts/WalletContext'
import { useGame } from '../../contexts/GameContext'
import toast from 'react-hot-toast'

interface Card {
  suit: string
  value: string
  numValue: number
}

interface Player {
  id: string
  name: string
  chips: number
  hand: Card[]
  bet: number
  folded: boolean
  isDealer: boolean
  isUser: boolean
}

const SUITS = ['♠', '♥', '♦', '♣']
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

export default function Poker() {
  const { isConnected, chipBalance } = useWallet()
  const { gameState, placeBet, endGame, resetGame } = useGame()
  
  const [deck, setDeck] = useState<Card[]>([])
  const [communityCards, setCommunityCards] = useState<Card[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [gamePhase, setGamePhase] = useState<'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'>('waiting')
  const [pot, setPot] = useState(0)
  const [currentBet, setCurrentBet] = useState(0)
  const [buyIn, setBuyIn] = useState(100)

  const createDeck = (): Card[] => {
    const newDeck: Card[] = []
    for (const suit of SUITS) {
      for (let i = 0; i < VALUES.length; i++) {
        const value = VALUES[i]
        let numValue = i + 2
        if (value === 'A') numValue = 14
        
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

  const dealCard = (currentDeck: Card[]): { card: Card; remainingDeck: Card[] } => {
    const card = currentDeck[0]
    const remainingDeck = currentDeck.slice(1)
    return { card, remainingDeck }
  }

  const joinTable = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (buyIn > chipBalance) {
      toast.error('Insufficient CHIPS balance')
      return
    }

    const canBet = await placeBet(buyIn, 'poker')
    if (!canBet) return

    // Create AI players
    const aiPlayers: Player[] = [
      { id: 'ai1', name: 'Alice', chips: 1000, hand: [], bet: 0, folded: false, isDealer: false, isUser: false },
      { id: 'ai2', name: 'Bob', chips: 1000, hand: [], bet: 0, folded: false, isDealer: true, isUser: false },
      { id: 'ai3', name: 'Charlie', chips: 1000, hand: [], bet: 0, folded: false, isDealer: false, isUser: false }
    ]

    const userPlayer: Player = {
      id: 'user',
      name: 'You',
      chips: buyIn,
      hand: [],
      bet: 0,
      folded: false,
      isDealer: false,
      isUser: true
    }

    setPlayers([userPlayer, ...aiPlayers])
    startNewHand([userPlayer, ...aiPlayers])
  }

  const startNewHand = (gamePlayers: Player[]) => {
    const newDeck = createDeck()
    let currentDeck = newDeck

    // Deal hole cards
    const updatedPlayers = gamePlayers.map(player => {
      const { card: card1, remainingDeck: deck1 } = dealCard(currentDeck)
      const { card: card2, remainingDeck: deck2 } = dealCard(deck1)
      currentDeck = deck2
      
      return {
        ...player,
        hand: [card1, card2],
        bet: 0,
        folded: false
      }
    })

    setDeck(currentDeck)
    setPlayers(updatedPlayers)
    setCommunityCards([])
    setGamePhase('preflop')
    setCurrentPlayer(0)
    setPot(0)
    setCurrentBet(10) // Small blind
  }

  const playerAction = (action: 'fold' | 'call' | 'raise', raiseAmount?: number) => {
    const player = players[currentPlayer]
    if (!player.isUser) return

    let newBet = 0
    let newChips = player.chips

    switch (action) {
      case 'fold':
        setPlayers(players.map((p, i) => 
          i === currentPlayer ? { ...p, folded: true } : p
        ))
        break
      case 'call':
        newBet = currentBet
        newChips = player.chips - (currentBet - player.bet)
        break
      case 'raise':
        if (raiseAmount) {
          newBet = currentBet + raiseAmount
          newChips = player.chips - newBet
          setCurrentBet(newBet)
        }
        break
    }

    if (action !== 'fold') {
      setPlayers(players.map((p, i) => 
        i === currentPlayer ? { ...p, bet: newBet, chips: newChips } : p
      ))
      setPot(pot + newBet)
    }

    // Move to next player
    nextPlayer()
  }

  const nextPlayer = () => {
    let next = (currentPlayer + 1) % players.length
    while (players[next].folded && next !== currentPlayer) {
      next = (next + 1) % players.length
    }
    
    if (next === currentPlayer) {
      // Round complete, move to next phase
      nextPhase()
    } else {
      setCurrentPlayer(next)
      
      // AI player action
      if (!players[next].isUser) {
        setTimeout(() => {
          aiPlayerAction(next)
        }, 1000)
      }
    }
  }

  const aiPlayerAction = (playerIndex: number) => {
    const player = players[playerIndex]
    const actions = ['fold', 'call', 'raise']
    const action = actions[Math.floor(Math.random() * actions.length)]
    
    // Simple AI logic
    if (action === 'fold' && Math.random() > 0.3) {
      setPlayers(players.map((p, i) => 
        i === playerIndex ? { ...p, folded: true } : p
      ))
    } else if (action === 'raise' && Math.random() > 0.7) {
      const raiseAmount = Math.floor(Math.random() * 50) + 10
      const newBet = currentBet + raiseAmount
      setPlayers(players.map((p, i) => 
        i === playerIndex ? { ...p, bet: newBet, chips: p.chips - newBet } : p
      ))
      setCurrentBet(newBet)
      setPot(pot + newBet)
    } else {
      // Call
      const newBet = currentBet
      setPlayers(players.map((p, i) => 
        i === playerIndex ? { ...p, bet: newBet, chips: p.chips - (newBet - p.bet) } : p
      ))
      setPot(pot + (newBet - player.bet))
    }
    
    nextPlayer()
  }

  const nextPhase = () => {
    let currentDeck = deck
    
    switch (gamePhase) {
      case 'preflop':
        // Deal flop (3 cards)
        const flop: Card[] = []
        for (let i = 0; i < 3; i++) {
          const { card, remainingDeck } = dealCard(currentDeck)
          flop.push(card)
          currentDeck = remainingDeck
        }
        setCommunityCards(flop)
        setDeck(currentDeck)
        setGamePhase('flop')
        break
      case 'flop':
        // Deal turn (1 card)
        const { card: turnCard, remainingDeck: afterTurn } = dealCard(currentDeck)
        setCommunityCards([...communityCards, turnCard])
        setDeck(afterTurn)
        setGamePhase('turn')
        break
      case 'turn':
        // Deal river (1 card)
        const { card: riverCard, remainingDeck: afterRiver } = dealCard(currentDeck)
        setCommunityCards([...communityCards, riverCard])
        setDeck(afterRiver)
        setGamePhase('river')
        break
      case 'river':
        setGamePhase('showdown')
        determineWinner()
        break
    }
    
    setCurrentPlayer(0)
    setCurrentBet(0)
  }

  const determineWinner = () => {
    const activePlayers = players.filter(p => !p.folded)
    
    if (activePlayers.length === 1) {
      // Only one player left
      const winner = activePlayers[0]
      if (winner.isUser) {
        endGame('win', pot)
      } else {
        endGame('lose', 0)
      }
    } else {
      // Simplified winner determination (random for demo)
      const winner = activePlayers[Math.floor(Math.random() * activePlayers.length)]
      if (winner.isUser) {
        endGame('win', pot)
      } else {
        endGame('lose', 0)
      }
    }
  }

  const leaveTable = () => {
    setPlayers([])
    setGamePhase('waiting')
    resetGame()
  }

  const userPlayer = players.find(p => p.isUser)
  const isUserTurn = userPlayer && currentPlayer === players.indexOf(userPlayer)

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
          <h1 className="text-4xl font-bold text-white mb-4">Texas Hold'em Poker</h1>
          <p className="text-gray-400">
            Play against AI opponents in this classic poker variant
          </p>
        </motion.div>

        {gamePhase === 'waiting' ? (
          /* Join Table */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-slate-800 rounded-xl p-8 text-center max-w-md mx-auto"
          >
            <Users className="w-16 h-16 text-algorand-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Join Poker Table</h2>
            <div className="mb-6">
              <label className="block text-white font-medium mb-2">Buy-in Amount</label>
              <select
                value={buyIn}
                onChange={(e) => setBuyIn(Number(e.target.value))}
                className="bg-slate-700 text-white rounded px-4 py-2 border border-slate-600 w-full"
              >
                <option value={50}>50 CHIPS</option>
                <option value={100}>100 CHIPS</option>
                <option value={250}>250 CHIPS</option>
                <option value={500}>500 CHIPS</option>
              </select>
            </div>
            <button
              onClick={joinTable}
              disabled={!isConnected || buyIn > chipBalance}
              className="btn-gold text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Join Table
            </button>
          </motion.div>
        ) : (
          /* Game Table */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="game-table mx-auto p-8 max-w-5xl"
          >
            {/* Pot and Community Cards */}
            <div className="text-center mb-8">
              <div className="bg-slate-800 rounded-lg p-4 inline-block mb-4">
                <div className="text-casino-gold font-bold text-2xl">{pot} CHIPS</div>
                <div className="text-gray-400">Pot</div>
              </div>
              
              {/* Community Cards */}
              <div className="flex justify-center space-x-2">
                {communityCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -20 }}
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
                
                {/* Placeholder cards */}
                {Array.from({ length: 5 - communityCards.length }).map((_, index) => (
                  <div
                    key={`placeholder-${index}`}
                    className="w-16 h-24 bg-slate-700 rounded-lg border-2 border-dashed border-slate-600"
                  />
                ))}
              </div>
            </div>

            {/* Players */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className={`bg-slate-800 rounded-lg p-4 text-center ${
                    currentPlayer === index ? 'ring-2 ring-algorand-400' : ''
                  } ${player.folded ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-white font-medium">{player.name}</span>
                    {player.isDealer && <span className="ml-2 text-casino-gold">D</span>}
                  </div>
                  <div className="text-algorand-400 font-bold">{player.chips} CHIPS</div>
                  {player.bet > 0 && (
                    <div className="text-casino-gold text-sm">Bet: {player.bet}</div>
                  )}
                  
                  {/* Player Cards */}
                  {player.isUser ? (
                    <div className="flex justify-center space-x-1 mt-2">
                      {player.hand.map((card, cardIndex) => (
                        <div
                          key={cardIndex}
                          className={`card w-8 h-12 flex flex-col items-center justify-center text-xs font-bold ${
                            card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'
                          }`}
                        >
                          <div>{card.value}</div>
                          <div>{card.suit}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-center space-x-1 mt-2">
                      {player.hand.length > 0 && (
                        <>
                          <div className="w-8 h-12 bg-slate-700 rounded border"></div>
                          <div className="w-8 h-12 bg-slate-700 rounded border"></div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Player Actions */}
            {isUserTurn && gamePhase !== 'showdown' && (
              <div className="text-center space-x-4">
                <button
                  onClick={() => playerAction('fold')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded"
                >
                  Fold
                </button>
                <button
                  onClick={() => playerAction('call')}
                  className="btn-primary py-2 px-6"
                >
                  Call {currentBet}
                </button>
                <button
                  onClick={() => playerAction('raise', 20)}
                  className="btn-gold py-2 px-6"
                >
                  Raise 20
                </button>
              </div>
            )}

            {/* Game Phase Info */}
            <div className="text-center mt-4">
              <div className="text-white font-medium">
                Phase: {gamePhase.charAt(0).toUpperCase() + gamePhase.slice(1)}
              </div>
              {!isUserTurn && gamePhase !== 'showdown' && (
                <div className="text-gray-400">
                  Waiting for {players[currentPlayer]?.name}...
                </div>
              )}
            </div>

            {/* Leave Table */}
            <div className="text-center mt-6">
              <button
                onClick={leaveTable}
                className="btn-primary py-2 px-6 flex items-center space-x-2 mx-auto"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Leave Table</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Game Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-slate-800 rounded-xl p-6 mt-8"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            How to Play Texas Hold'em
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">Objective</h4>
              <p>Make the best 5-card hand using your 2 hole cards and 5 community cards.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Betting Rounds</h4>
              <p>Pre-flop, Flop (3 cards), Turn (1 card), River (1 card), then Showdown.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Actions</h4>
              <p>Fold (give up), Call (match bet), or Raise (increase bet).</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Winning</h4>
              <p>Best hand wins the pot. If all others fold, last player wins.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}