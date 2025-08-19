import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePhotos } from '../contexts/PhotoContext'
import PhotoUpload from '../components/PhotoUpload'
import ConsentManagement from '../components/ConsentManagement'
import {
  Camera,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Brain,
  Sparkles,
  Edit,
  Trash2,
  X
} from 'lucide-react'

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
    switchUserRole,
    revokeConsent,
    deletePhoto,
    updatePhoto,
    denyConsent,
    publishPhoto,
    canEditPhoto,
    processConsentAndApplyMasking
  } = usePhotos()

  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [deletingPhoto, setDeletingPhoto] = useState(null)
  const [consentPhoto, setConsentPhoto] = useState(null) // Simplified consent management
  const [processingConsent, setProcessingConsent] = useState({}) // Track which children are being processed
  const [enlargedPhoto, setEnlargedPhoto] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Handle photo upload completion and show consent management
  const handlePhotoUploadComplete = (uploadedPhoto) => {
    console.log('Dashboard: Photo upload completed, showing consent management for:', uploadedPhoto)
    setConsentPhoto(uploadedPhoto)
  }

  // Handle consent management save
  const handleConsentSave = async (photoId, childrenWithConsent, childrenWithoutConsent) => {
    console.log('Dashboard: Saving consent and applying AI masking')
    console.log('Dashboard: Children with consent:', childrenWithConsent)
    console.log('Dashboard: Children without consent:', childrenWithoutConsent)
    
    setProcessingConsent(true)
    
    try {
      // Use the new function that processes all consent and applies AI masking at once
      const updatedPhoto = await processConsentAndApplyMasking(photoId, childrenWithConsent, childrenWithoutConsent)
      
      if (updatedPhoto) {
        console.log('Dashboard: Consent saved and AI masking applied successfully')
        console.log('Dashboard: Updated photo:', updatedPhoto)
        
        // Close the consent management modal
        setConsentPhoto(null)
        
        // Force a re-render to show the updated photo
        setLastUpdate(Date.now())
        
        // Show success message
        alert('Photo consent saved! AI masking has been applied to remove children without consent.')
      } else {
        console.error('Dashboard: Failed to process consent and apply masking')
        alert('Error saving consent. Please try again.')
      }
    } catch (error) {
      console.error('Dashboard: Error in handleConsentSave:', error)
      alert('Error saving consent. Please try again.')
    } finally {
      setProcessingConsent(false)
    }
  }

  // Monitor reviewingPhoto changes for debugging
  useEffect(() => {
    if (consentPhoto) {
      console.log('Dashboard: consentPhoto state changed:', {
        id: consentPhoto?.id,
        title: consentPhoto?.title,
        status: consentPhoto?.status,
        consentGiven: consentPhoto?.consentGiven,
        consentPending: consentPhoto?.consentPending,
        children: consentPhoto?.children,
        maskingInfo: consentPhoto?.maskingInfo,
        maskedUrl: consentPhoto?.maskedUrl
      })
    }
  }, [consentPhoto])

  const stats = [
    {
      title: 'Total Photos',
      value: photos.length,
      icon: Camera,
      color: 'bg-kindrid-500',
      change: '+12% from last month'
    },
    {
      title: 'Pending Consent',
      value: pendingConsent.length,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: 'Requires attention'
    },
    {
      title: 'Consent Given',
      value: photos.reduce((total, photo) => total + ((photo.consentGiven || []).length), 0),
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8% from last month'
    },
    {
      title: 'AI Processing',
      value: aiStats.processing,
      icon: Brain,
      color: 'bg-purple-500',
      change: aiProcessing ? 'Processing...' : 'All processed'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending_consent':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'ai_processing':
        return <Brain className="w-5 h-5 text-purple-500" />
      case 'ai_failed':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved'
      case 'pending_consent':
        return 'Pending Consent'
      case 'ai_processing':
        return 'AI Processing'
      case 'ai_failed':
        return 'AI Failed'
      default:
        return 'Unknown'
    }
  }

  const handleRoleSwitch = () => {
    const newRole = userRole === 'teacher' ? 'parent' : 'teacher'
    switchUserRole(newRole)
  }

  const handleEditPhoto = (photo) => {
    setEditingPhoto(photo)
  }

  const handleDeletePhoto = (photo) => {
    setDeletingPhoto(photo)
  }

  const confirmDelete = () => {
    if (deletingPhoto) {
      deletePhoto(deletingPhoto.id)
      setDeletingPhoto(null)
    }
  }

  const handleSaveEdit = (updatedData) => {
    if (editingPhoto) {
      updatePhoto(editingPhoto.id, updatedData)
      setEditingPhoto(null)
    }
  }

  const handleGiveConsent = async (childName) => {
    if (!consentPhoto) return

    setProcessingConsent((prev) => ({ ...prev, [childName]: true }))

    try {
      console.log('Dashboard: Giving consent for:', childName)
      const updatedPhoto = await giveConsent(consentPhoto.id, childName)

      if (updatedPhoto) {
        console.log('Dashboard: Consent given successfully, updating consent photo')
        setConsentPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error giving consent:', error)
    } finally {
      setProcessingConsent((prev) => ({ ...prev, [childName]: false }))
    }
  }

  const handleDenyConsent = async (childName) => {
    if (!consentPhoto) return

    setProcessingConsent((prev) => ({ ...prev, [childName]: true }))

    try {
      console.log('Dashboard: Denying consent for:', childName)
      const updatedPhoto = await revokeConsent(consentPhoto.id, childName)

      if (updatedPhoto) {
        console.log('Dashboard: Consent denied successfully, updating consent photo')
        setConsentPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error denying consent:', error)
    } finally {
      setProcessingConsent((prev) => ({ ...prev, [childName]: false }))
    }
  }

  const handleRevokeConsent = async (childName) => {
    if (!consentPhoto) return

    setProcessingConsent((prev) => ({ ...prev, [childName]: true }))

    try {
      console.log('Dashboard: Revoking consent for:', childName)
      const updatedPhoto = await revokeConsent(consentPhoto.id, childName)

      if (updatedPhoto) {
        console.log('Dashboard: Consent revoked successfully, updating consent photo')
        setConsentPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error revoking consent:', error)
    } finally {
      setProcessingConsent((prev) => ({ ...prev, [childName]: false }))
    }
  }

  const renderPhotoImage = (photo) => {
    const hasMaskedChildren = photo.maskingInfo?.maskedChildren?.length > 0
    const maskedCount = photo.maskingInfo?.maskedChildren?.length || 0
    const isAIProcessed = photo.aiProcessed && photo.maskedUrl

    // Show masked photo only if AI processing is complete
    let imageUrl = isAIProcessed ? photo.maskedUrl : photo.url || photo.currentDisplayUrl

    if (imageUrl) {
      // data URL
      if (imageUrl.startsWith('data:')) {
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img src={imageUrl} alt={photo.title} className="w-full h-48 object-cover" />
            {isAIProcessed && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Processed ({maskedCount})
              </div>
            )}
          </div>
        )
      }

      // blob URL
      if (imageUrl.startsWith('blob:')) {
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img
              src={imageUrl}
              alt={photo.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error('Dashboard: Blob image failed to load:', imageUrl)
                console.error('Error details:', e)
              }}
            />
            {isAIProcessed && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Processed ({maskedCount})
              </div>
            )}
          </div>
        )
      }

      // local path
      if (imageUrl.startsWith('/')) {
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img src={imageUrl} alt={photo.title} className="w-full h-48 object-cover" />
            {isAIProcessed && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Processed ({maskedCount})
            </div>
            )}
          </div>
        )
      }

      // masked query param
      if (imageUrl.includes('?masked=true')) {
        const baseUrl = imageUrl.split('?')[0]
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img src={baseUrl} alt={photo.title} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-lg px-3 py-1">
                <span className="text-xs font-medium text-gray-700">🔒 Masked</span>
              </div>
            </div>
          </div>
        )
      }

      // fallback url type
      return (
        <div className="relative" data-photo-id={photo.id}>
          <img
            src={imageUrl}
            alt={photo.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Dashboard: Image failed to load:', imageUrl)
              console.error('Photo details:', photo)
              e.target.style.display = 'none'
              if (e.target.nextSibling) e.target.nextSibling.style.display = 'block'
            }}
          />
          {isAIProcessed && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
              🔒 AI Processed ({maskedCount})
            </div>
          )}
        </div>
      )
    }

    // Placeholder
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{photo.title}</p>
          <p className="text-xs text-red-500">No image URL available</p>
        </div>
      </div>
    )
  }

  const handlePhotoEnlarge = (photo) => setEnlargedPhoto(photo)
  const handleCloseEnlarged = () => setEnlargedPhoto(null)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Role Switcher */}
      <div className="mb-6 flex justify-center">
        <button
          onClick={handleRoleSwitch}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Switch to {userRole === 'teacher' ? 'Parent' : 'Teacher'} View
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Processing Status */}
      {aiStats.processing > 0 && (
        <div className="card mb-8 bg-gradient-to-r from-purple-50 to-kindrid-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Processing Active</h3>
                <p className="text-gray-600">
                  {aiStats.processing} photos are being processed by ClassVault™ AI
                </p>
              </div>
            </div>
            <Link to="/ai-tools" className="btn-primary flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>View AI Tools</span>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userRole === 'teacher' && (
            <button
              onClick={() => setShowPhotoUpload(true)}
              className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 text-kindrid-600" />
              <span>Upload Photos</span>
            </button>
          )}
          <Link
            to="/gallery"
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-5 h-5 text-kindrid-600" />
            <span>Review Photos</span>
          </Link>
          <Link
            to="/ai-tools"
            className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles className="w-5 h-5 text-kindrid-600" />
            <span>AI Tools</span>
          </Link>
        </div>
      </div>

      {/* Recent Photos */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Photos</h2>
          <Link to="/gallery" className="text-kindrid-600 hover:text-kindrid-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {getPhotosForUser().length === 0 ? (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {userRole === 'teacher' ? 'No photos uploaded yet' : 'No photos featuring your children yet'}
            </p>
            {userRole === 'teacher' && (
              <button onClick={() => setShowPhotoUpload(true)} className="mt-4 btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Photo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getPhotosForUser()
              .slice(0, 6)
              .map((photo) => (
                <div
                  key={photo.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
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

      {/* Photo Upload Modal */}
      {showPhotoUpload && (
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} onUploadComplete={handlePhotoUploadComplete} />
      )}

      {/* Edit Photo Modal */}
      {editingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Photo</h2>
                <button onClick={() => setEditingPhoto(null)} className="text-gray-400 hover:text-gray-600">
                  ✕
                </button>
              </div>

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
                      .map((name) => name.trim())
                      .filter((name) => name.length > 0),
                    tags: formData
                      .get('tags')
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0)
                  }
                  handleSaveEdit(updatedData)
                }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="form-label">
                      Title
                    </label>
                    <input type="text" id="title" name="title" defaultValue={editingPhoto.title} className="input-field" required />
                  </div>
                  <div>
                    <label htmlFor="location" className="form-label">
                      Location
                    </label>
                    <input type="text" id="location" name="location" defaultValue={editingPhoto.location} className="input-field" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea id="description" name="description" defaultValue={editingPhoto.description} className="input-field" rows={3} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher" className="form-label">
                      Teacher
                    </label>
                    <input type="text" id="teacher" name="teacher" defaultValue={editingPhoto.teacher} className="input-field" required />
                  </div>
                  <div>
                    <label htmlFor="children" className="form-label">
                      Children
                    </label>
                    <input
                      type="text"
                      id="children"
                      name="children"
                      defaultValue={editingPhoto.children.join(', ')}
                      className="input-field"
                      placeholder="Emma, Lucas, Sophia"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="tags" className="form-label">
                    Tags
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    defaultValue={editingPhoto.tags.join(', ')}
                    className="input-field"
                    placeholder="first-day, classroom, fun"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setEditingPhoto(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Photo</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deletingPhoto.title}"? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setDeletingPhoto(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-primary bg-red-600 hover:bg-red-700 flex-1">
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consent Management Modal */}
      {consentPhoto && (
        <ConsentManagement
          photo={consentPhoto}
          onClose={() => setConsentPhoto(null)}
          onSave={handleConsentSave}
          processingConsent={processingConsent}
        />
      )}

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
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
                alt={enlargedPhoto.title || 'Enlarged Photo'}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
              
              {/* AI Masked Badge */}
              {enlargedPhoto.maskedUrl && (
                <div className="absolute top-4 left-4 bg-purple-600 text-white px-4 py-2 rounded-full text-lg font-semibold">
                  🎭 AI Masked
                </div>
              )}
              
              {/* Published Badge */}
              {enlargedPhoto.isPublished && (
                <div className="absolute top-4 left-20 bg-blue-600 text-white px-4 py-2 rounded-full text-lg font-semibold">
                  ✅ Published
                </div>
              )}
            </div>
            
            <div className="text-center mt-4 text-white">
              <p className="text-lg">{enlargedPhoto.title || 'Untitled Photo'}</p>
              <p className="text-sm text-gray-300">Click outside or press X to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
