import React, { useState } from 'react'
import { usePhotos } from '../contexts/PhotoContext'
import AIPhotoEditor from '../components/AIPhotoEditor'
import { 
  Wand2, 
  Shield, 
  Sparkles, 
  Users, 
  Eye, 
  Download,
  Clock,
  CheckCircle,
  AlertTriangle,
  Brain,
  Zap,
  Target
} from 'lucide-react'

const AITools = () => {
  const { photos, aiStats, getPhotosByStatus } = usePhotos()
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: Brain },
    { id: 'editor', name: 'Photo Editor', icon: Wand2 },
    { id: 'analytics', name: 'AI Analytics', icon: Target },
    { id: 'models', name: 'AI Models', icon: Zap }
  ]

  const aiProcessedPhotos = getPhotosByStatus('approved').filter(p => p.aiProcessed)
  const pendingPhotos = getPhotosByStatus('pending_consent').filter(p => p.aiProcessed)
  const processingPhotos = getPhotosByStatus('ai_processing')

  const renderAIOverview = () => (
    <div className="space-y-6">
      {/* AI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Brain className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{aiStats.processed}</div>
          <div className="text-sm text-gray-600">Photos Processed</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{aiStats.processed - aiStats.processing}</div>
          <div className="text-sm text-gray-600">AI Complete</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{aiStats.processing}</div>
          <div className="text-sm text-gray-600">Processing</div>
        </div>
        
        <div className="card text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {photos.reduce((acc, p) => acc + (p.aiFeatures?.personDetection?.length || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">People Detected</div>
        </div>
      </div>

      {/* ClassVault™ Technology */}
      <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ClassVault™ AI Technology</h2>
            <p className="text-gray-600">Proprietary AI-powered photo editing and privacy protection</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Person Detection</h3>
            <p className="text-sm text-gray-600">
              Advanced AI identifies all people in photos with high accuracy confidence scores
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Background Analysis</h3>
            <p className="text-sm text-gray-600">
              AI analyzes background complexity and determines reconstruction difficulty
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wand2 className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Seamless Editing</h3>
            <p className="text-sm text-gray-600">
              Remove people without consent and AI rebuilds backgrounds naturally
            </p>
          </div>
        </div>
      </div>

      {/* Recent AI Processing */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Processing</h3>
        
        <div className="space-y-3">
          {photos.slice(0, 5).map((photo) => (
            <div key={photo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{photo.title}</h4>
                  <p className="text-sm text-gray-600">{photo.date} • {photo.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {photo.status === 'ai_processing' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    Processing
                  </span>
                )}
                {photo.status === 'pending_consent' && photo.aiProcessed && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AI Complete
                  </span>
                )}
                {photo.status === 'approved' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </span>
                )}
                
                <button
                  onClick={() => setSelectedPhoto(photo)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPhotoEditor = () => (
    <div className="space-y-6">
      {/* Photo Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Photo for AI Editing</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {photos.filter(p => p.aiProcessed).map((photo) => (
            <button
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className={`p-4 border rounded-lg text-left transition-colors ${
                selectedPhoto?.id === photo.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="w-full h-32 bg-gray-100 rounded mb-3 overflow-hidden">
                {/* Show actual photo if available, otherwise placeholder */}
                {photo.url && photo.url.startsWith('blob:') ? (
                  <img 
                    src={photo.url} 
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <h4 className="font-medium text-gray-900 mb-1">{photo.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{photo.location}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{photo.children.length} children</span>
                <span className={`px-2 py-1 rounded-full ${
                  photo.status === 'approved' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {photo.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Photo Editor */}
      {selectedPhoto ? (
        <AIPhotoEditor 
          photo={selectedPhoto} 
          onPhotoUpdate={(updatedPhoto) => {
            // Handle photo updates
            console.log('Photo updated:', updatedPhoto)
          }}
        />
      ) : (
        <div className="card text-center py-12">
          <Wand2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Photo</h3>
          <p className="text-gray-500">
            Choose a photo from above to start AI editing with ClassVault™
          </p>
        </div>
      )}
    </div>
  )

  const renderAIAnalytics = () => (
    <div className="space-y-6">
      {/* AI Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Processing Performance</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Processing Success Rate</span>
                <span className="font-medium">98.5%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{width: '98.5%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Person Detection Accuracy</span>
                <span className="font-medium">96.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '96.2%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Background Reconstruction Quality</span>
                <span className="font-medium">94.8%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{width: '94.8%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Times</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Person Detection</span>
              <span className="font-medium">0.8s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Background Analysis</span>
              <span className="font-medium">1.2s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Person Removal</span>
              <span className="font-medium">2.3s</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Background Rebuild</span>
              <span className="font-medium">3.1s</span>
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Average</span>
                <span className="font-bold text-blue-600">7.4s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Model Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-2">ClassVault-2.1</div>
            <div className="text-sm text-gray-600">Current Model</div>
            <div className="text-xs text-gray-500 mt-1">Released: Jan 2024</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-2">1.2M+</div>
            <div className="text-sm text-gray-600">Photos Processed</div>
            <div className="text-xs text-gray-500 mt-1">Total Training Data</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-2">99.1%</div>
            <div className="text-sm text-gray-600">Privacy Compliance</div>
            <div className="text-xs text-gray-500 mt-1">GDPR & COPPA</div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAIModels = () => (
    <div className="space-y-6">
      {/* Current AI Models */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available AI Models</h3>
        
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ClassVault™ 2.1</h4>
                  <p className="text-sm text-gray-600">Latest production model</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Release Date:</span>
                <span className="ml-2 font-medium">January 2024</span>
              </div>
              <div>
                <span className="text-gray-600">Performance:</span>
                <span className="ml-2 font-medium">98.5% accuracy</span>
              </div>
              <div>
                <span className="text-gray-600">Processing Speed:</span>
                <span className="ml-2 font-medium">7.4s average</span>
              </div>
              <div>
                <span className="text-gray-600">Model Size:</span>
                <span className="ml-2 font-medium">2.1GB</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-2">Key Features:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Enhanced person detection with 96.2% accuracy</li>
                <li>• Improved background reconstruction algorithms</li>
                <li>• Faster processing times (30% improvement)</li>
                <li>• Better handling of complex backgrounds</li>
                <li>• Enhanced privacy masking techniques</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 rounded-lg opacity-60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">ClassVault™ 2.2</h4>
                  <p className="text-sm text-gray-600">Beta testing model</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Beta
              </span>
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Coming soon with improved accuracy and faster processing times.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Training */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Training & Updates</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Continuous Learning</h5>
              <p className="text-sm text-gray-600">Models improve with each photo processed</p>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Privacy-First Training</h5>
              <p className="text-sm text-gray-600">All training data is anonymized and secure</p>
            </div>
            <Shield className="w-5 h-5 text-blue-500" />
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium text-gray-900">Regular Updates</h5>
              <p className="text-sm text-gray-600">Monthly model updates with performance improvements</p>
            </div>
            <Zap className="w-5 h-5 text-purple-500" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderAIOverview()
      case 'editor':
        return renderPhotoEditor()
      case 'analytics':
        return renderAIAnalytics()
      case 'models':
        return renderAIModels()
      default:
        return renderAIOverview()
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Tools & ClassVault™</h1>
        <p className="text-gray-600">
          Advanced AI-powered photo editing, person detection, and privacy protection
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default AITools
