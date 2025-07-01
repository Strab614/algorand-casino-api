import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Users, BarChart3, Shield, AlertTriangle, DollarSign } from 'lucide-react'

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'games', name: 'Game Management', icon: Settings },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'finance', name: 'Finance', icon: DollarSign },
  ]

  const mockStats = {
    totalUsers: 1250,
    activeUsers: 340,
    totalGames: 15420,
    totalVolume: 2500000,
    houseEdge: 2.5,
    totalProfit: 62500
  }

  return (
    <div className="min-h-screen bg-slate-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Admin Dashboard</h1>
          <p className="text-gray-400">
            Manage your casino operations and monitor performance
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-slate-800 rounded-xl p-2 mb-8"
        >
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-algorand-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Users</h3>
                    <Users className="w-6 h-6 text-algorand-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.totalUsers.toLocaleString()}</div>
                  <div className="text-sm text-green-400">+12% from last month</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Active Users</h3>
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.activeUsers}</div>
                  <div className="text-sm text-green-400">+8% from yesterday</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Games</h3>
                    <BarChart3 className="w-6 h-6 text-casino-gold" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.totalGames.toLocaleString()}</div>
                  <div className="text-sm text-green-400">+156 today</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Volume</h3>
                    <DollarSign className="w-6 h-6 text-algorand-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.totalVolume.toLocaleString()} CHIPS</div>
                  <div className="text-sm text-green-400">+5.2% from last week</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">House Edge</h3>
                    <BarChart3 className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.houseEdge}%</div>
                  <div className="text-sm text-gray-400">Target: 2.5%</div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Total Profit</h3>
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">{mockStats.totalProfit.toLocaleString()} CHIPS</div>
                  <div className="text-sm text-green-400">+18% from last month</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { type: 'win', user: 'Player #1234', amount: 500, game: 'Slots', time: '2 minutes ago' },
                    { type: 'deposit', user: 'Player #5678', amount: 100, game: 'Deposit', time: '5 minutes ago' },
                    { type: 'win', user: 'Player #9012', amount: 250, game: 'Blackjack', time: '8 minutes ago' },
                    { type: 'loss', user: 'Player #3456', amount: 75, game: 'Roulette', time: '12 minutes ago' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.type === 'win' ? 'bg-green-400' :
                          activity.type === 'deposit' ? 'bg-blue-400' : 'bg-red-400'
                        }`}></div>
                        <div>
                          <div className="text-white font-medium">{activity.user}</div>
                          <div className="text-sm text-gray-400">{activity.game} • {activity.time}</div>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        activity.type === 'win' ? 'text-green-400' :
                        activity.type === 'deposit' ? 'text-blue-400' : 'text-red-400'
                      }`}>
                        {activity.type === 'loss' ? '-' : '+'}{activity.amount} CHIPS
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Game Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Slots RTP</label>
                    <input
                      type="number"
                      defaultValue="96.5"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Max Bet (CHIPS)</label>
                    <input
                      type="number"
                      defaultValue="1000"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">Min Bet (CHIPS)</label>
                    <input
                      type="number"
                      defaultValue="1"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">House Edge (%)</label>
                    <input
                      type="number"
                      defaultValue="2.5"
                      step="0.1"
                      className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600"
                    />
                  </div>
                </div>
                <button className="btn-primary mt-6">Save Configuration</button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">User Management</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-white font-medium py-3">Address</th>
                        <th className="text-white font-medium py-3">Balance</th>
                        <th className="text-white font-medium py-3">Games Played</th>
                        <th className="text-white font-medium py-3">Status</th>
                        <th className="text-white font-medium py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { address: 'ABCD...1234', balance: 1250, games: 45, status: 'Active' },
                        { address: 'EFGH...5678', balance: 890, games: 23, status: 'Active' },
                        { address: 'IJKL...9012', balance: 0, games: 12, status: 'Inactive' },
                      ].map((user, index) => (
                        <tr key={index} className="border-b border-slate-700">
                          <td className="text-gray-400 py-3">{user.address}</td>
                          <td className="text-white py-3">{user.balance} CHIPS</td>
                          <td className="text-white py-3">{user.games}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.status === 'Active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <button className="text-algorand-400 hover:text-algorand-300 text-sm">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Security Monitoring</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Shield className="w-5 h-5 text-green-400 mr-2" />
                      <span className="text-white font-medium">System Status</span>
                    </div>
                    <div className="text-green-400">All systems operational</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400 mr-2" />
                      <span className="text-white font-medium">Suspicious Activity</span>
                    </div>
                    <div className="text-yellow-400">2 flagged transactions</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="space-y-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-6">Financial Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">2,500,000</div>
                    <div className="text-gray-400">Total CHIPS in Circulation</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">125,000</div>
                    <div className="text-gray-400">House Balance</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">62,500</div>
                    <div className="text-gray-400">Total Profit</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}