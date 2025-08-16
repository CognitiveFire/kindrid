import React, { useState, useRef } from 'react'
import { 
  Wand2, 
  Users, 
  Eye, 
  EyeOff, 
  Download, 
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  Shield,
  Sparkles
} from 'lucide-react'
import aiService from '../services/aiService'

const AIPhotoEditor = ({ photo, onPhotoUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [editResult, setEditResult] = useState(null)
  const [showOriginal, setShowOriginal] = useState(false)
  const canvasRef = useRef(null)

  if (!photo || !photo.aiFeatures) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Photo is still being processed by AI</p>
      </div>
    )
  }

  const handlePersonSelect = (person) => {
    setSelectedPerson(person)
    setIsEditing(true)
  }

  const handleRemovePerson = async () => {
    if (!selectedPerson) return

    setIsProcessing(true)
    try {
      const result = await aiService.removePersonAndRebuildBackground(
        photo.id, 
        selectedPerson.id
      )
      
      setEditResult(result)
      
      // Simulate photo update
      if (onPhotoUpdate) {
        onPhotoUpdate({
          ...photo,
          editedVersions: [
            ...(photo.editedVersions || []),
            {
              personId: selectedPerson.id,
              personName: selectedPerson.name,
              result: result,
              timestamp: new Date().toISOString()
            }
          ]
        })
      }
    } catch (error) {
      console.error('Error removing person:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetEditor = () => {
    setSelectedPerson(null)
    setIsEditing(false)
    setEditResult(null)
    setShowOriginal(false)
  }

  const renderPersonOverlay = () => {
    if (!photo.aiFeatures?.personDetection) return null

    return photo.aiFeatures.personDetection.map((person) => {
      const hasConsent = photo.consentGiven.includes(person.name)
      const isSelected = selectedPerson?.id === person.id
      
      return (
        <div
          key={person.id}
          className={`absolute border-2 cursor-pointer transition-all ${
            hasConsent 
              ? 'border-green-400 bg-green-100 bg-opacity-30' 
              : 'border-red-400 bg-red-100 bg-opacity-30'
          } ${
            isSelected ? 'border-blue-500 bg-blue-100 bg-opacity-50' : ''
          }`}
          style={{
            left: `${person.bbox[0]}px`,
            top: `${person.bbox[1]}px`,
            width: `${person.bbox[2]}px`,
            height: `${person.bbox[3]}px`
          }}
          onClick={() => handlePersonSelect(person)}
        >
          <div className="absolute -top-6 left-0 bg-white px-2 py-1 rounded text-xs font-medium shadow-sm">
            {person.name} ({Math.round(person.confidence * 100)}%)
            {hasConsent ? (
              <CheckCircle className="inline w-3 h-3 text-green-500 ml-1" />
            ) : (
              <AlertTriangle className="inline w-3 h-3 text-red-500 ml-1" />
            )}
          </div>
        </div>
      )
    })
  }

  const renderBackgroundAnalysis = () => {
    if (!photo.aiFeatures?.backgroundAnalysis) return null

    const { type, elements, complexity, reconstructionDifficulty } = photo.aiFeatures.backgroundAnalysis

    return (
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Background Analysis</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Type:</span>
            <span className="ml-2 font-medium capitalize">{type.replace('_', ' ')}</span>
          </div>
          <div>
            <span className="text-gray-600">Complexity:</span>
            <span className="ml-2 font-medium capitalize">{complexity}</span>
          </div>
          <div>
            <span className="text-gray-600">Reconstruction:</span>
            <span className="ml-2 font-medium capitalize">{reconstructionDifficulty}</span>
          </div>
          <div>
            <span className="text-gray-600">Elements:</span>
            <span className="ml-2 font-medium">{elements.slice(0, 3).join(', ')}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Photo Display */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative">
          {/* Show actual photo if available, otherwise placeholder */}
          {photo.url && photo.url.startsWith('blob:') ? (
            <img 
              src={photo.url} 
              alt={photo.title}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-blue-200 to-purple-200 flex items-center justify-center">
              <div className="text-center">
                <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <p className="text-blue-800 font-medium">{photo.title}</p>
                <p className="text-blue-600 text-sm">{photo.description}</p>
              </div>
            </div>
          )}
          
          {/* Person detection overlays */}
          {renderPersonOverlay()}
        </div>

        {/* AI Processing indicator */}
        {photo.status === 'ai_processing' && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-lg font-medium">AI Processing...</p>
              <p className="text-sm opacity-90">Analyzing photo content</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Features Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Person Detection */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Person Detection</h3>
          </div>
          
          <div className="space-y-3">
            {photo.aiFeatures?.personDetection?.map((person) => {
              const hasConsent = photo.consentGiven.includes(person.name)
              
              return (
                <div
                  key={person.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPerson?.id === person.id
                      ? 'border-blue-500 bg-blue-50'
                      : hasConsent
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                  onClick={() => handlePersonSelect(person)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{person.name}</p>
                      <p className="text-sm text-gray-600">
                        Confidence: {Math.round(person.confidence * 100)}%
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {hasConsent ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      {selectedPerson?.id === person.id && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Background Analysis */}
        <div className="card">
          <div className="flex items-center space-x-2 mb-4">
            <Eye className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Background Analysis</h3>
          </div>
          
          {renderBackgroundAnalysis()}
        </div>
      </div>

      {/* AI Editing Controls */}
      {selectedPerson && (
        <div className="card bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              AI Photo Editor - Remove {selectedPerson.name}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Selected Person:</p>
              <div className="bg-white p-3 rounded-lg border">
                <p className="font-medium">{selectedPerson.name}</p>
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(selectedPerson.confidence * 100)}%
                </p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">AI Action:</p>
              <div className="bg-white p-3 rounded-lg border">
                <p className="font-medium text-blue-600">Remove Person + Rebuild Background</p>
                <p className="text-sm text-gray-600">Using ClassVault™ AI</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleRemovePerson}
              disabled={isProcessing}
              className="btn-primary flex items-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>
                {isProcessing ? 'Processing...' : 'Remove & Rebuild Background'}
              </span>
            </button>
            
            <button
              onClick={resetEditor}
              className="btn-secondary flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Edit Results */}
      {editResult && (
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              AI Editing Complete!
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Processing Time:</p>
              <p className="font-medium">{editResult.processingTime}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">AI Model:</p>
              <p className="font-medium">{editResult.aiModel}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Background Quality:</p>
              <p className="font-medium capitalize">{editResult.backgroundReconstruction.quality}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-2">Seamless:</p>
              <p className="font-medium">{editResult.backgroundReconstruction.seamless ? 'Yes' : 'No'}</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button className="btn-primary flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Download Edited Photo</span>
            </button>
            
            <button className="btn-secondary flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>View Before/After</span>
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">How ClassVault™ AI Works</h4>
        </div>
        
        <div className="text-sm text-blue-800 space-y-2">
          <p>• <strong>Person Detection:</strong> AI identifies all people in the photo with confidence scores</p>
          <p>• <strong>Consent Check:</strong> Only people with parental consent are visible</p>
          <p>• <strong>Background Analysis:</strong> AI analyzes the background complexity and reconstruction difficulty</p>
          <p>• <strong>Seamless Removal:</strong> Remove people without consent and AI rebuilds the background</p>
          <p>• <strong>High Quality:</strong> Results look natural with minimal artifacts</p>
        </div>
      </div>
    </div>
  )
}

export default AIPhotoEditor
