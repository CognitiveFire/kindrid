import React, { useState } from 'react'
import { X, Save, Eye, EyeOff } from 'lucide-react'

const ConsentManagement = ({ photo, onSave, onClose }) => {
  const [consentStatus, setConsentStatus] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize consent status for all children
  React.useEffect(() => {
    if (photo && photo.children) {
      const initialStatus = {}
      photo.children.forEach(child => {
        // Default to no consent (will be masked)
        initialStatus[child] = false
      })
      setConsentStatus(initialStatus)
    }
  }, [photo])

  const handleConsentChange = (childName, hasConsent) => {
    setConsentStatus(prev => ({
      ...prev,
      [childName]: hasConsent
    }))
  }

  const handleSave = async () => {
    setIsProcessing(true)
    
    try {
      // Process consent changes
      const childrenWithConsent = Object.keys(consentStatus).filter(child => consentStatus[child])
      const childrenWithoutConsent = Object.keys(consentStatus).filter(child => !consentStatus[child])
      
      console.log('ConsentManagement: Saving consent:', {
        withConsent: childrenWithConsent,
        withoutConsent: childrenWithoutConsent
      })
      
      // Call the save function with consent data
      await onSave(photo.id, childrenWithConsent, childrenWithoutConsent)
      
    } catch (error) {
      console.error('ConsentManagement: Error saving consent:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!photo) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Photo Consent</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Photo Preview */}
          <div className="mb-6">
            <div className="relative">
              <img
                src={photo.url}
                alt={photo.title || 'Photo'}
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
                {photo.children?.length || 0} children
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p><strong>Title:</strong> {photo.title || 'Untitled'}</p>
              <p><strong>Description:</strong> {photo.description || 'No description'}</p>
            </div>
          </div>

          {/* Consent Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Set Consent for Each Child
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Children without consent will be automatically removed from the photo using AI.
            </p>
            
            <div className="space-y-3">
              {photo.children?.map((child) => (
                <div key={child} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold">
                        {child.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{child}</p>
                      <p className="text-sm text-gray-500">
                        {consentStatus[child] ? 'Will be visible' : 'Will be removed'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConsentChange(child, true)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        consentStatus[child]
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <Eye className="w-4 h-4 mr-2 inline" />
                      Visible
                    </button>
                    <button
                      onClick={() => handleConsentChange(child, false)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        !consentStatus[child]
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <EyeOff className="w-4 h-4 mr-2 inline" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isProcessing}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center ${
                isProcessing
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentManagement
