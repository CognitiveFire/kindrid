import React, { useState, useEffect } from 'react'
import { X, Save, Eye, EyeOff } from 'lucide-react'

const ConsentManagement = ({ photo, onClose, onSave, processingConsent }) => {
  const [consentStatus, setConsentStatus] = useState({})
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize all children to "Remove" (no consent) by default
  useEffect(() => {
    if (photo?.children) {
      const initialStatus = {}
      photo.children.forEach(child => {
        initialStatus[child] = false // false = "Remove", true = "Visible"
      })
      setConsentStatus(initialStatus)
    }
  }, [photo])

  const toggleConsent = (childName) => {
    setConsentStatus(prev => ({
      ...prev,
      [childName]: !prev[childName]
    }))
  }

  const handleSave = async () => {
    if (isProcessing) return
    
    console.log('ConsentManagement: Save button clicked!')
    console.log('ConsentManagement: Current consent status:', consentStatus)
    console.log('ConsentManagement: Photo ID:', photo.id)
    
    setIsProcessing(true)
    console.log('ConsentManagement: Set isProcessing to true')
    
    try {
      // Collect children with and without consent
      const childrenWithConsent = Object.keys(consentStatus).filter(child => consentStatus[child])
      const childrenWithoutConsent = Object.keys(consentStatus).filter(child => !consentStatus[child])
      
      console.log('ConsentManagement: Children with consent:', childrenWithConsent)
      console.log('ConsentManagement: Children without consent:', childrenWithoutConsent)
      console.log('ConsentManagement: About to call onSave...')
      
      // Call parent save function
      await onSave(photo.id, childrenWithConsent, childrenWithoutConsent)
      
      console.log('ConsentManagement: onSave completed successfully')
    } catch (error) {
      console.error('ConsentManagement: Error in handleSave:', error)
    } finally {
      console.log('ConsentManagement: Setting isProcessing to false')
      setIsProcessing(false)
      console.log('ConsentManagement: handleSave function completed')
    }
  }

  if (!photo) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Photo Consent</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Photo Preview */}
          <div className="mb-6">
            <img
              src={photo.url}
              alt={photo.title || 'Photo'}
              className="w-full max-h-64 object-cover rounded-lg shadow-md"
              data-photo-id={photo.id}
            />
            <div className="mt-2">
              <h3 className="font-semibold text-gray-800">{photo.title || 'Untitled Photo'}</h3>
              <p className="text-gray-600 text-sm">{photo.description || 'No description'}</p>
            </div>
          </div>

          {/* Consent Management */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Set consent for each child in the photo:
            </h3>
            <div className="space-y-3">
              {photo.children?.map(child => (
                <div key={child} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-gray-800">{child}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleConsent(child)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        consentStatus[child]
                          ? 'bg-green-500 text-white hover:bg-green-600'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {consentStatus[child] ? 'Visible' : 'Remove'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>How it works:</strong> Children marked as "Remove" will be completely removed from the photo 
              using AI technology. The background will be reconstructed to look natural. 
              Children marked as "Visible" will remain in the photo.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                console.log('ConsentManagement: Save button clicked!')
                console.log('ConsentManagement: Button state - isProcessing:', isProcessing, 'processingConsent:', processingConsent)
                console.log('ConsentManagement: processingConsent type:', typeof processingConsent)
                console.log('ConsentManagement: Object.values(processingConsent):', Object.values(processingConsent || {}))
                console.log('ConsentManagement: Object.values(processingConsent).some(Boolean):', Object.values(processingConsent || {}).some(Boolean))
                handleSave()
              }}
              disabled={isProcessing || (processingConsent && Object.values(processingConsent).some(Boolean))}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing || (processingConsent && Object.values(processingConsent).some(Boolean)) ? 'Processing...' : 'Save Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentManagement
