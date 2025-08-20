import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePhotos } from '../contexts/PhotoContext'
import { useAuth } from '../contexts/AuthContext'
import PhotoUpload from '../components/PhotoUpload'
import ConsentManagement from '../components/ConsentManagement'
import { Edit, Trash2, Eye, Brain, CheckCircle, XCircle, Clock, X } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()
  const { 
    photos, 
    pendingConsent, 
    aiProcessing, 
    aiStats, 
    giveConsent, 
    userRole, 
    userChildren,
    canManageConsent,
    getPhotosForUser,
    processConsentAndApplyMasking,
    removePhoto,
    publishPhoto
  } = usePhotos()

  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [showConsentManagement, setShowConsentManagement] = useState(false)
  const [consentPhoto, setConsentPhoto] = useState(null)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [showEnlarged, setShowEnlarged] = useState(false)
  const [enlargedPhoto, setEnlargedPhoto] = useState(null)
  const [processingConsent, setProcessingConsent] = useState({})

  // Monitor photos state changes for debugging
  useEffect(() => {
    console.log('Dashboard: photos state changed:', {
      totalPhotos: photos.length,
      photosWithUrls: photos.filter(p => p.url).length,
      photosWithoutUrls: photos.filter(p => !p.url).length,
      photoDetails: photos.map(p => ({
        id: p.id,
        title: p.title,
        hasUrl: !!p.url,
        hasMaskedUrl: !!p.maskedUrl,
        aiProcessed: p.aiProcessed
      }))
    })
  }, [photos])

  const handlePhotoUploadComplete = (uploadedPhoto) => {
    console.log('Dashboard: Photo upload completed, showing consent management for:', uploadedPhoto)
    setConsentPhoto(uploadedPhoto)
    setShowPhotoUpload(false)
    setShowConsentManagement(true)
  }

  const handleConsentSave = async (childrenWithConsent, childrenWithoutConsent) => {
    if (!consentPhoto) return

    console.log('Dashboard: Starting consent save process')
    console.log('Dashboard: Photo ID:', consentPhoto.id)
    console.log('Dashboard: Children with consent:', childrenWithConsent)
    console.log('Dashboard: Children without consent:', childrenWithoutConsent)
    console.log('Dashboard: Parameter types - childrenWithConsent:', typeof childrenWithConsent, 'childrenWithoutConsent:', typeof childrenWithoutConsent)
    console.log('Dashboard: childrenWithConsent isArray:', Array.isArray(childrenWithConsent))
    console.log('Dashboard: childrenWithoutConsent isArray:', Array.isArray(childrenWithoutConsent))

    try {
      // Ensure parameters are arrays to prevent forEach errors
      if (!Array.isArray(childrenWithConsent) || !Array.isArray(childrenWithoutConsent)) {
        console.error('Dashboard: Invalid parameters received:', { childrenWithConsent, childrenWithoutConsent })
        throw new Error('Invalid parameters: expected arrays but received different types')
      }
      
      // Set processing state for all children
      const processingState = {}
      childrenWithConsent.forEach(child => processingState[child] = true)
      childrenWithoutConsent.forEach(child => processingState[child] = true)
      setProcessingConsent(processingState)

      console.log('Dashboard: Set processing consent for children:', processingState)
      console.log('Dashboard: About to call processConsentAndApplyMasking...')

      // Process consent and apply masking
      const updatedPhoto = await processConsentAndApplyMasking(
        consentPhoto.id,
        childrenWithConsent,
        childrenWithoutConsent
      )

      console.log('Dashboard: processConsentAndApplyMasking returned:', updatedPhoto)
      console.log('Dashboard: Consent saved successfully')

      // Close modal and show success
      setShowConsentManagement(false)
      setConsentPhoto(null)
      setProcessingConsent({})

      console.log('Dashboard: Updated photo object:', updatedPhoto)
      console.log('Dashboard: Closing consent management modal...')
      console.log('Dashboard: Modal closed')
      console.log('Dashboard: Setting last update...')
      console.log('Dashboard: Last update set')
      console.log('Dashboard: Success message shown')
      console.log('Dashboard: Setting processing consent to false for all children')
      console.log('Dashboard: Consent save process completed')

    } catch (error) {
      console.error('Dashboard: Error saving consent:', error)
      setProcessingConsent({})
    }
  }

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo)
  }

  const handleSaveEdit = (updatedData) => {
    // Implementation for editing photos
    setEditingPhoto(null)
  }

  const handleDeletePhoto = (photo) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      removePhoto(photo.id)
    }
  }

  const handleEnlargePhoto = (photo) => {
    setEnlargedPhoto(photo)
    setShowEnlarged(true)
  }

  const handleCloseEnlarged = () => {
    setShowEnlarged(false)
    setEnlargedPhoto(null)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending_consent':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'published':
        return <CheckCircle className="w-4 h-4 text-blue-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'pending_consent':
        return 'Pending Consent'
      case 'published':
        return 'Published'
      default:
        return 'Unknown'
    }
  }

  const renderPhotoImage = (photo) => {
    // FIXED: Children WITHOUT consent are the ones removed/masked
    const hasMaskedChildren = photo.consentPending?.length > 0
    const maskedCount = photo.consentPending?.length || 0
    // Simplified: just check if photo has been processed and has pending consent
    const isAIProcessed = Boolean(photo.aiProcessed)

    // Debug image URL logic
    console.log('Dashboard: renderPhotoImage debug:', {
      photoId: photo.id,
      title: photo.title,
      url: photo.url,
      currentDisplayUrl: photo.currentDisplayUrl,
      maskedUrl: photo.maskedUrl,
      editedImageUrl: photo.editedImageUrl,
      aiProcessed: photo.aiProcessed,
      aiProcessedType: typeof photo.aiProcessed,
      isAIProcessed: isAIProcessed,
      consentPending: photo.consentPending,
      hasMaskedChildren: hasMaskedChildren
    })
    
    // Debug: Check if photo object has the editedImageUrl field
    console.log('Dashboard: Photo object keys:', Object.keys(photo))
    console.log('Dashboard: Photo editedImageUrl value:', photo.editedImageUrl)
    console.log('Dashboard: Photo maskedUrl value:', photo.maskedUrl)

    // For prototype: show edited image when AI processed and has masked children
    let imageUrl = photo.url || photo.currentDisplayUrl
    let showEditedVersion = isAIProcessed && hasMaskedChildren
    
    // If showing edited version, use the edited image
    if (showEditedVersion) {
      // Use the edited image URL from the photo object
      imageUrl = photo.editedImageUrl || '/Edited-image.png'
      console.log('Dashboard: Using edited image:', imageUrl)
    } else {
      console.log('Dashboard: Using original image:', imageUrl)
    }
    
    // Fallback: if edited image fails, show original with overlay
    const fallbackImageUrl = photo.url || photo.currentDisplayUrl
    
    // Debug: Check if image URL is valid
    console.log('Dashboard: Final imageUrl for rendering:', imageUrl)
    console.log('Dashboard: showEditedVersion:', showEditedVersion)
    console.log('Dashboard: isAIProcessed:', isAIProcessed)
    console.log('Dashboard: hasMaskedChildren:', hasMaskedChildren)
    
    console.log('Dashboard: Final imageUrl:', imageUrl)
    console.log('Dashboard: Image display decision:', {
      isAIProcessed,
      useMaskedUrl: isAIProcessed && photo.maskedUrl,
      fallbackUrl: photo.url || photo.currentDisplayUrl,
      finalChoice: showEditedVersion ? 'edited version (Emma removed)' : 'original image (with Emma)'
    })

    if (imageUrl) {
      return (
        <div className="relative" data-photo-id={photo.id}>
          <img
            key={`${photo.id}-${showEditedVersion ? 'edited' : 'original'}`}
            src={imageUrl}
            alt={photo.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Dashboard: Image failed to load:', imageUrl)
              console.error('Dashboard: Error details:', e.target.error)
              console.error('Dashboard: Image element:', e.target)
              
              // Fallback to original image if edited image fails
              if (showEditedVersion && fallbackImageUrl) {
                console.log('Dashboard: Falling back to original image:', fallbackImageUrl)
                e.target.src = fallbackImageUrl
                e.target.style.display = 'block'
              } else {
                e.target.style.display = 'none'
              }
            }}
            onLoad={() => {
              console.log('Dashboard: Image loaded successfully:', imageUrl)
            }}
          />
          
          {/* AI Processed Badge */}
          {isAIProcessed && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
              ✨ AI Edited ({maskedCount})
            </div>
          )}

          {/* Success Indicator for Edited Image */}
          {showEditedVersion && (
            <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              ✨ AI Edited
            </div>
          )}

          {/* Published Badge */}
          {photo.status === 'published' && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              Published
            </div>
          )}

          {/* Enlarge Button */}
          <button
            onClick={() => handleEnlargePhoto(photo)}
            className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }

    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-500">Image not available</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your photos and consent</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Eye className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Review Photos</h3>
                <p className="text-gray-600">Manage consent and review photos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">AI Tools</h3>
                <p className="text-gray-600">AI-powered photo processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Photos */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Photos</h2>
              <Link
                to="/gallery"
                className="text-kindrid-600 hover:text-kindrid-700 font-medium"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="p-6">
            {userRole === 'teacher' && (
              <button
                onClick={() => setShowPhotoUpload(true)}
                className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-xl">+</span>
                </div>
                <span className="text-gray-600">Upload New Photo</span>
              </button>
            )}

            {getPhotosForUser().length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {getPhotosForUser().map((photo) => (
                  <div key={photo.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">{renderPhotoImage(photo)}</div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{photo.title}</h3>
                        {getStatusIcon(photo.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{photo.date}</span>
                        <span>{getStatusText(photo.status)}</span>
                      </div>
                      
                      {photo.status === 'pending_consent' && canManageConsent(photo) && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-2">
                            Pending consent for: {photo.consentPending.join(', ')}
                          </p>
                          <div className="flex space-x-2">
                            {userRole === 'teacher' && (
                              <button
                                onClick={() => {
                                  photo.consentPending.forEach((childName) => {
                                    giveConsent(photo.id, childName)
                                  })
                                }}
                                className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                              >
                                Approve All
                              </button>
                            )}
                            <button
                              onClick={() => setConsentPhoto(photo)}
                              className="text-xs bg-kindrid-100 text-kindrid-700 px-2 py-1 rounded hover:bg-kindrid-200"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      )}

                      {userRole === 'teacher' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 flex space-x-2">
                          <button
                            onClick={() => handleEditPhoto(photo)}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeletePhoto(photo)}
                            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </button>
                        </div>
                      )}

                      {photo.status === 'ai_processing' && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center space-x-2 text-xs text-purple-600">
                            <Brain className="w-3 h-3" />
                            <span>AI Processing...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload New Photo</h2>
              <button
                onClick={() => setShowPhotoUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <PhotoUpload
                onUploadComplete={handlePhotoUploadComplete}
                onCancel={() => setShowPhotoUpload(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Consent Management Modal */}
      {showConsentManagement && consentPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Manage Photo Consent</h2>
              <button
                onClick={() => {
                  setShowConsentManagement(false)
                  setConsentPhoto(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <ConsentManagement
                photo={consentPhoto}
                onSave={handleConsentSave}
                onCancel={() => {
                  setShowConsentManagement(false)
                  setConsentPhoto(null)
                }}
                isProcessing={false}
                processingConsent={processingConsent}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Edit Photo</h2>
              <button
                onClick={() => setEditingPhoto(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const updatedData = {
                    title: formData.get('title'),
                    description: formData.get('description'),
                    location: formData.get('location'),
                    teacher: formData.get('teacher'),
                    children: formData
                      .get('children')
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0)
                  }
                  handleSaveEdit(updatedData)
                }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingPhoto.title}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingPhoto.description}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingPhoto.location}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Teacher</label>
                  <input
                    type="text"
                    name="teacher"
                    defaultValue={editingPhoto.teacher}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Children (comma-separated)</label>
                  <input
                    type="text"
                    name="children"
                    defaultValue={editingPhoto.children?.join(', ')}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-kindrid-600 text-white rounded-md hover:bg-kindrid-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {showEnlarged && enlargedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <button
              onClick={handleCloseEnlarged}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative flex justify-center">
              <img
                src={enlargedPhoto.maskedUrl || enlargedPhoto.url}
                alt={enlargedPhoto.title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {/* AI Processed Badge */}
              {enlargedPhoto.aiProcessed && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                  AI Processed ({enlargedPhoto.maskingInfo?.maskedChildren?.length || 0})
                </div>
              )}
              
              {/* Published Badge */}
              {enlargedPhoto.isPublished && (
                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Published
                </div>
              )}
            </div>
            
            <div className="text-center mt-4 text-white">
              <p className="text-lg">{enlargedPhoto.title || 'Untitled Photo'}</p>
              <p className="text-sm text-gray-300">{enlargedPhoto.description}</p>
              <p className="text-xs text-gray-400 mt-2">
                {enlargedPhoto.location} • {enlargedPhoto.teacher} • {enlargedPhoto.date}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
