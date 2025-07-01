import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useWallet } from './WalletContext'
import toast from 'react-hot-toast'

interface GameState {
  isPlaying: boolean
  currentBet: number
  gameHistory: GameResult[]
  totalWinnings: number
  totalLosses: number
}

interface GameResult {
  id: string
  game: string
  bet: number
  result: 'win' | 'lose' | 'push'
  payout: number
  timestamp: Date
  txHash?: string
}

interface GameContextType {
  gameState: GameState
  placeBet: (amount: number, game: string) => Promise<boolean>
  endGame: (result: 'win' | 'lose' | 'push', payout: number, txHash?: string) => void
  resetGame: () => void
  getGameStats: () => { winRate: number; totalGames: number; netProfit: number }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export function GameProvider({ children }: { children: ReactNode }) {
  const { chipBalance, refreshBalance } = useWallet()
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    currentBet: 0,
    gameHistory: [],
    totalWinnings: 0,
    totalLosses: 0
  })

  const placeBet = async (amount: number, game: string): Promise<boolean> => {
    if (amount > chipBalance) {
      toast.error('Insufficient CHIPS balance')
      return false
    }

    if (amount <= 0) {
      toast.error('Bet amount must be greater than 0')
      return false
    }

    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      currentBet: amount
    }))

    return true
  }

  const endGame = (result: 'win' | 'lose' | 'push', payout: number, txHash?: string) => {
    const gameResult: GameResult = {
      id: Date.now().toString(),
      game: 'current', // This should be passed from the specific game
      bet: gameState.currentBet,
      result,
      payout,
      timestamp: new Date(),
      txHash
    }

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentBet: 0,
      gameHistory: [gameResult, ...prev.gameHistory.slice(0, 99)], // Keep last 100 games
      totalWinnings: result === 'win' ? prev.totalWinnings + payout : prev.totalWinnings,
      totalLosses: result === 'lose' ? prev.totalLosses + prev.currentBet : prev.totalLosses
    }))

    // Refresh wallet balance after game
    refreshBalance()

    // Show result toast
    if (result === 'win') {
      toast.success(`You won ${payout} CHIPS!`)
    } else if (result === 'lose') {
      toast.error(`You lost ${gameState.currentBet} CHIPS`)
    } else {
      toast('Push - Bet returned')
    }
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      currentBet: 0
    }))
  }

  const getGameStats = () => {
    const totalGames = gameState.gameHistory.length
    const wins = gameState.gameHistory.filter(game => game.result === 'win').length
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0
    const netProfit = gameState.totalWinnings - gameState.totalLosses

    return { winRate, totalGames, netProfit }
  }

  const value = {
    gameState,
    placeBet,
    endGame,
    resetGame,
    getGameStats
  }

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}