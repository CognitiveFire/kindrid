import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import PhotoGallery from './pages/PhotoGallery'
import AITools from './pages/AITools'
import ParentalControls from './pages/ParentalControls'
import Settings from './pages/Settings'
import { AuthProvider } from './contexts/AuthContext'
import { PhotoProvider } from './contexts/PhotoContext'

function App() {
  console.log('App component is rendering!')
  
  return (
    <AuthProvider>
      <PhotoProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/health" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold text-green-600">✅ Healthy</h1><p className="text-gray-600">Kindrid app is running successfully</p></div>} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/gallery" element={<PhotoGallery />} />
                <Route path="/ai-tools" element={<AITools />} />
                <Route path="/controls" element={<ParentalControls />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </PhotoProvider>
    </AuthProvider>
  )
}

export default App
