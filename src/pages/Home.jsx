import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Shield, ArrowRight, CheckCircle, Users, Lock, Sparkles } from 'lucide-react'

const Home = () => {
  const { login, isLoginForm, setIsLoginForm } = useAuth()

  const features = [
    {
      icon: Shield,
      title: 'Full Parental Control',
      description: 'Parents decide who can view every image or video of their child'
    },
    {
      icon: Lock,
      title: 'Secure Hosting',
      description: 'Hosted securely in Norway with full GDPR compliance'
    },
    {
      icon: Sparkles,
      title: 'ClassVault™ AI',
      description: 'Proprietary AI technology for identity masking and background restoration'
    },
    {
      icon: Users,
      title: 'Cross-Platform',
      description: 'Works seamlessly across desktop and mobile devices'
    }
  ]

  const benefits = [
    'Replace messy email threads',
    'Secure cloud storage',
    'Real-time notifications',
    'Detailed tracking',
    'Time-limited sharing',
    'Private, trusted environment'
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content and CTA */}
            <div className="text-left pl-8">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Trust. Control.{' '}
                <span className="text-kindrid-600">Memories</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-lg">
                Secure, AI-powered platform for sharing school photos and videos with full parental control.
                Powered by ClassVault™ technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsLoginForm(true)}
                  className="btn-primary text-lg px-8 py-3 bg-kindrid-600 hover:bg-kindrid-700"
                >
                  Get Started
                </button>
                <button className="btn-secondary text-lg px-8 py-3 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
                  Learn More
                </button>
              </div>
            </div>

            {/* Right Column - App Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src="/kindrid (1).png"
                  alt="Kindrid App Interface - Group Photo Management"
                  className="w-full max-w-md h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Kindrid?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with families in mind, Kindrid provides the security and control you need
              while making school photo sharing simple and beautiful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-kindrid-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-kindrid-200 transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-kindrid-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                A Better Way to Share School Memories
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Kindrid replaces the chaos of email threads and unsecured cloud folders with
                a private, trusted digital environment designed specifically for schools and families.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-kindrid-600 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center text-kindrid-600 hover:text-kindrid-700 font-semibold group"
                >
                  Explore the Platform
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-kindrid rounded-2xl p-8 text-white">
                <div className="text-center">
                  <Shield className="w-16 h-16 mx-auto mb-6 opacity-90" />
                  <h3 className="text-2xl font-bold mb-4">
                    ClassVault™ Technology
                  </h3>
                  <p className="text-lg opacity-90 leading-relaxed">
                    Our proprietary AI layer handles group photos with care, masking identities
                    without consent and seamlessly restoring backgrounds for a natural look.
                  </p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-kindrid-200 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-kindrid-300 rounded-full opacity-30"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join schools and families who trust Kindrid to keep their memories safe and secure.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsLoginForm(true)}
              className="btn-primary text-lg px-8 py-3 bg-kindrid-600 hover:bg-kindrid-700"
            >
              Start Your Free Trial
            </button>
            <Link
              to="/dashboard"
              className="btn-outline text-lg px-8 py-3 border-kindrid-600 text-kindrid-600 hover:bg-kindrid-50"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Kindrid</h3>
              <p className="text-gray-400 text-sm">
                Secure, AI-powered platform for sharing school photos and videos with full parental control.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Platform
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/gallery" className="hover:text-white transition-colors">Photo Gallery</Link></li>
                <li><Link to="/ai-tools" className="hover:text-white transition-colors">AI Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Kindrid. All rights reserved. Powered by ClassVault™ technology.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
