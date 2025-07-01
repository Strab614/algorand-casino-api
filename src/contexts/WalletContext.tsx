import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import algosdk from 'algosdk'
import { PeraWalletConnect } from '@perawallet/connect'
import toast from 'react-hot-toast'

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: number
  chipBalance: number
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signTransaction: (txn: any) => Promise<any>
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const peraWallet = new PeraWalletConnect({
  shouldShowSignTxnToast: false
})

// Algorand configuration
const algodClient = new algosdk.Algodv2(
  '',
  'https://testnet-api.algonode.cloud',
  ''
)

const indexerClient = new algosdk.Indexer(
  '',
  'https://testnet-idx.algonode.cloud',
  ''
)

const CHIP_ASSET_ID = 388592191 // Your CHIPS ASA ID

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState(0)
  const [chipBalance, setChipBalance] = useState(0)

  useEffect(() => {
    // Check if wallet was previously connected
    const savedAddress = localStorage.getItem('walletAddress')
    if (savedAddress) {
      setAddress(savedAddress)
      setIsConnected(true)
      refreshBalance()
    }

    // Listen for wallet disconnect
    peraWallet.connector?.on('disconnect', () => {
      disconnectWallet()
    })
  }, [])

  const connectWallet = async () => {
    try {
      const accounts = await peraWallet.connect()
      const userAddress = accounts[0]
      
      setAddress(userAddress)
      setIsConnected(true)
      localStorage.setItem('walletAddress', userAddress)
      
      await refreshBalance()
      toast.success('Wallet connected successfully!')
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    peraWallet.disconnect()
    setIsConnected(false)
    setAddress(null)
    setBalance(0)
    setChipBalance(0)
    localStorage.removeItem('walletAddress')
    toast.success('Wallet disconnected')
  }

  const refreshBalance = async () => {
    if (!address) return

    try {
      // Get ALGO balance
      const accountInfo = await algodClient.accountInformation(address).do()
      setBalance(accountInfo.amount / 1000000) // Convert microAlgos to Algos

      // Get CHIPS balance
      const assets = accountInfo.assets || []
      const chipAsset = assets.find((asset: any) => asset['asset-id'] === CHIP_ASSET_ID)
      setChipBalance(chipAsset ? chipAsset.amount / 10 : 0) // Assuming 1 decimal place for CHIPS
    } catch (error) {
      console.error('Failed to refresh balance:', error)
    }
  }

  const signTransaction = async (txn: any) => {
    try {
      const signedTxn = await peraWallet.signTransaction([txn])
      return signedTxn
    } catch (error) {
      console.error('Failed to sign transaction:', error)
      throw error
    }
  }

  const value = {
    isConnected,
    address,
    balance,
    chipBalance,
    connectWallet,
    disconnectWallet,
    signTransaction,
    refreshBalance
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}