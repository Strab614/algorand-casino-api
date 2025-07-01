import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Discord, Shield, Award, Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-algorand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="text-xl font-bold text-white">Algorand Casino</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Experience the future of online gaming with Algorand's fast, secure, and sustainable blockchain technology. 
              Provably fair games with instant payouts.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-algorand-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-algorand-400 transition-colors">
                <Discord className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-algorand-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/games" className="text-gray-400 hover:text-white transition-colors">
                  Games
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  How to Play
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Responsible Gaming
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Features */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-algorand-400" />
              <div>
                <h4 className="text-white font-medium">Provably Fair</h4>
                <p className="text-gray-400 text-sm">Transparent and verifiable game outcomes</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Zap className="w-6 h-6 text-algorand-400" />
              <div>
                <h4 className="text-white font-medium">Instant Payouts</h4>
                <p className="text-gray-400 text-sm">Lightning-fast transactions on Algorand</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-algorand-400" />
              <div>
                <h4 className="text-white font-medium">Licensed & Secure</h4>
                <p className="text-gray-400 text-sm">Fully regulated and audited platform</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Algorand Casino. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-2 md:mt-0">
            Powered by Algorand Blockchain
          </p>
        </div>
      </div>
    </footer>
  )
}