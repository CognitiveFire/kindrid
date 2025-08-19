import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePhotos } from '../contexts/PhotoContext'
import PhotoUpload from '../components/PhotoUpload'
import demoPhotoService from '../services/demoPhotoService'
import { Camera, Plus, Users, Share2, Eye, AlertCircle, CheckCircle, XCircle, Brain, Sparkles, User, Shield, Edit, Trash2 } from 'lucide-react'

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
    canEditPhoto
  } = usePhotos()
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [deletingPhoto, setDeletingPhoto] = useState(null)
  const [reviewingPhoto, setReviewingPhoto] = useState(null)
  const [processingConsent, setProcessingConsent] = useState({}) // Track which children are being processed
  const [enlargedPhoto, setEnlargedPhoto] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Handle photo upload completion and automatically open review
  const handlePhotoUploadComplete = (uploadedPhoto) => {
    console.log('Dashboard: Photo upload completed, opening review modal for:', uploadedPhoto)
    setReviewingPhoto(uploadedPhoto)
    setShowPhotoUpload(false) // Close upload modal
  }

  // Monitor reviewingPhoto changes for debugging
  useEffect(() => {
    if (reviewingPhoto) {
      console.log('Dashboard: reviewingPhoto state changed:', {
        id: reviewingPhoto?.id,
        title: reviewingPhoto?.title,
        status: reviewingPhoto?.status,
        consentGiven: reviewingPhoto?.consentGiven,
        consentPending: reviewingPhoto?.consentPending,
        children: reviewingPhoto?.children,
        maskingInfo: reviewingPhoto?.maskingInfo,
        maskedUrl: reviewingPhoto?.maskedUrl
      })
    }
  }, [reviewingPhoto])

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
      value: photos.reduce((total, photo) => total + photo.consentGiven.length, 0),
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
    if (!reviewingPhoto) return
    
    setProcessingConsent(prev => ({ ...prev, [childName]: true }))
    
    try {
      console.log('Dashboard: Giving consent for:', childName)
      const updatedPhoto = await giveConsent(reviewingPhoto.id, childName)
      
      if (updatedPhoto) {
        console.log('Dashboard: Consent given successfully, updating reviewing photo')
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error giving consent:', error)
    } finally {
      setProcessingConsent(prev => ({ ...prev, [childName]: false }))
    }
  }

  const handleDenyConsent = async (childName) => {
    if (!reviewingPhoto) return
    
    setProcessingConsent(prev => ({ ...prev, [childName]: true }))
    
    try {
      console.log('Dashboard: Denying consent for:', childName)
      const updatedPhoto = await denyConsent(reviewingPhoto.id, childName)
      
      if (updatedPhoto) {
        console.log('Dashboard: Consent denied successfully, updating reviewing photo')
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error denying consent:', error)
    } finally {
      setProcessingConsent(prev => ({ ...prev, [childName]: false }))
    }
  }

  const handleRevokeConsent = async (childName) => {
    if (!reviewingPhoto) return
    
    setProcessingConsent(prev => ({ ...prev, [childName]: true }))
    
    try {
      console.log('Dashboard: Revoking consent for:', childName)
      const updatedPhoto = await revokeConsent(reviewingPhoto.id, childName)
      
      if (updatedPhoto) {
        console.log('Dashboard: Consent revoked successfully, updating reviewing photo')
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Dashboard: Error revoking consent:', error)
    } finally {
      setProcessingConsent(prev => ({ ...prev, [childName]: false }))
    }
  }

  const renderPhotoImage = (photo) => {
    // Check if this photo has any masked children
    const hasMaskedChildren = photo.maskingInfo?.maskedChildren?.length > 0
    const maskedCount = photo.maskingInfo?.maskedChildren?.length || 0
    
    console.log('Dashboard: Rendering photo image:', {
      id: photo.id,
      title: photo.title,
      url: photo.url,
      currentDisplayUrl: photo.currentDisplayUrl,
      maskedUrl: photo.maskedUrl,
      status: photo.status,
      maskingInfo: photo.maskingInfo,
      hasMaskedChildren,
      maskedCount
    })
    
    // Priority: masked photo > original photo > fallbacks
    let imageUrl = photo.maskedUrl || photo.url || photo.currentDisplayUrl
    
    console.log('Dashboard: Selected image URL:', imageUrl)
    console.log('Dashboard: Using masked photo:', !!photo.maskedUrl)
    
    if (imageUrl) {
      // Check if it's a data URL (SVG placeholder)
      if (imageUrl.startsWith('data:')) {
        console.log('Dashboard: Using data URL image')
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img 
              src={imageUrl} 
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
            {hasMaskedChildren && !photo.maskedUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg mb-1">🎭</div>
                  <span className="text-xs font-medium text-gray-700">AI Masked</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {maskedCount} child{maskedCount > 1 ? 'ren' : ''} masked
                  </div>
                </div>
              </div>
            )}
            {hasMaskedChildren && photo.maskedUrl && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Masked ({maskedCount})
              </div>
            )}
          </div>
        )
      }
      // Check if it's a blob URL
      if (imageUrl.startsWith('blob:')) {
        console.log('Dashboard: Using blob URL image')
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img 
              src={imageUrl} 
              alt={photo.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                console.error('Dashboard: Blob image failed to load:', imageUrl)
                console.error('Dashboard: Error details:', e)
              }}
            />
            {hasMaskedChildren && !photo.maskedUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg mb-1">🎭</div>
                  <span className="text-xs font-medium text-gray-700">AI Masked</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {maskedCount} child{maskedCount > 1 ? 'ren' : ''} masked
                  </div>
                </div>
              </div>
            )}
            {hasMaskedChildren && photo.maskedUrl && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Masked ({maskedCount})
              </div>
            )}
          </div>
        )
      }
      // Check if it's a regular file path (like /1.jpg, /2.jpg, etc.)
      if (imageUrl.startsWith('/')) {
        console.log('Dashboard: Using file path image')
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img 
              src={imageUrl} 
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
            {hasMaskedChildren && !photo.maskedUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center">
                  <div className="text-lg mb-1">🎭</div>
                  <span className="text-xs font-medium text-gray-700">AI Masked</span>
                  <div className="text-xs text-gray-500 mt-1">
                    {maskedCount} child{maskedCount > 1 ? 'ren' : ''} masked
                  </div>
                </div>
              </div>
            )}
            {hasMaskedChildren && photo.maskedUrl && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
                🔒 AI Masked ({maskedCount})
              </div>
            )}
          </div>
        )
      }
      // Check if it's a masked URL with query parameters - strip them for display
      if (imageUrl.includes('?masked=true')) {
        const baseUrl = imageUrl.split('?')[0]
        console.log('Dashboard: Using masked URL (stripped):', baseUrl)
        return (
          <div className="relative" data-photo-id={photo.id}>
            <img 
              src={baseUrl} 
              alt={photo.title}
              className="w-full h-48 object-cover"
            />
            {/* Overlay to show masking is applied */}
            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-lg px-3 py-1">
                <span className="text-xs font-medium text-gray-700">🔒 Masked</span>
              </div>
            </div>
          </div>
        )
      }
      
      // For any other URL type, try to display it
      console.log('Dashboard: Using fallback URL type')
      return (
        <div className="relative" data-photo-id={photo.id}>
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Dashboard: Image failed to load:', imageUrl)
              console.error('Dashboard: Photo details:', photo)
              // If image fails, show placeholder
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'block'
            }}
          />
          {hasMaskedChildren && !photo.maskedUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 rounded-lg px-3 py-2 text-center">
                <div className="text-lg mb-1">🎭</div>
                <span className="text-xs font-medium text-gray-700">AI Masked</span>
                <div className="text-xs text-gray-500 mt-1">
                  {maskedCount} child{maskedCount > 1 ? 'ren' : ''} masked
                </div>
              </div>
            </div>
          )}
          {hasMaskedChildren && photo.maskedUrl && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-lg text-xs font-medium">
              🔒 AI Masked ({maskedCount})
            </div>
          )}
        </div>
      )
    }
    
    // Fallback placeholder
    console.log('Dashboard: No valid image URL found, showing placeholder')
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

  // Handle photo enlargement
  const handlePhotoEnlarge = (photo) => {
    setEnlargedPhoto(photo)
  }

  // Close enlarged photo view
  const handleCloseEnlarged = () => {
    setEnlargedPhoto(null)
  }

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
          <Link to="/gallery" className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Eye className="w-5 h-5 text-kindrid-600" />
            <span>Review Photos</span>
          </Link>
          <Link to="/ai-tools" className="flex items-center justify-center space-x-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
              {userRole === 'teacher' 
                ? 'No photos uploaded yet' 
                : 'No photos featuring your children yet'
              }
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
            {getPhotosForUser().slice(0, 6).map((photo) => (
              <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {renderPhotoImage(photo)}
                </div>
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
                              // Approve all pending children
                              photo.consentPending.forEach(childName => {
                                giveConsent(photo.id, childName)
                              })
                            }}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                          >
                            Approve All
                          </button>
                        )}
                        <button 
                          onClick={() => setReviewingPhoto(photo)}
                          className="text-xs bg-kindrid-100 text-kindrid-700 px-2 py-1 rounded hover:bg-kindrid-200"
                        >
                          Review
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit/Delete Actions for Teachers */}
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

                  {/* AI Processing indicator */}
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
                <button
                  onClick={() => setEditingPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updatedData = {
                  title: formData.get('title'),
                  description: formData.get('description'),
                  location: formData.get('location'),
                  teacher: formData.get('teacher'),
                  children: formData.get('children').split(',').map(name => name.trim()).filter(name => name.length > 0),
                  tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
                }
                handleSaveEdit(updatedData)
              }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      defaultValue={editingPhoto.title}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      defaultValue={editingPhoto.location}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="form-label">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    defaultValue={editingPhoto.description}
                    className="input-field"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="teacher" className="form-label">Teacher</label>
                    <input
                      type="text"
                      id="teacher"
                      name="teacher"
                      defaultValue={editingPhoto.teacher}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="children" className="form-label">Children</label>
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
                  <label htmlFor="tags" className="form-label">Tags</label>
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
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
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
              <button
                onClick={() => setDeletingPhoto(null)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn-primary bg-red-600 hover:bg-red-700 flex-1"
              >
                Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Review Modal */}
      {reviewingPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Review Photo Permissions
                </h2>
                <button
                  onClick={() => setReviewingPhoto(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Photo Display with Enlarge Option */}
              <div className="mb-6 relative">
                <div className="relative group cursor-pointer" onClick={() => handlePhotoEnlarge(reviewingPhoto)}>
                  {renderPhotoImage(reviewingPhoto)}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-lg font-semibold">
                      Click to Enlarge
                    </div>
                  </div>
                </div>
                
                {/* AI Masked Badge */}
                {reviewingPhoto.maskedUrl && (
                  <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    🎭 AI Masked
                  </div>
                )}
              </div>

              {/* Publish Button for Finalized Photos */}
              {reviewingPhoto.maskedUrl && !reviewingPhoto.isPublished && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">Photo Ready for Publishing</h3>
                      <p className="text-green-600 text-sm">
                        This photo has been AI-processed and is ready to be finalized. 
                        Publishing will prevent further editing.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        publishPhoto(reviewingPhoto.id)
                        setReviewingPhoto(null)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                    >
                      🚀 Publish Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Published Status */}
              {reviewingPhoto.isPublished && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-2">✅</div>
                    <div>
                      <h3 className="text-lg font-semibold text-blue-800">Photo Published</h3>
                      <p className="text-blue-600 text-sm">
                        This photo has been finalized and cannot be edited further.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Children List */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Children in Photo ({reviewingPhoto?.children?.length || 0})
                </h3>
                
                {reviewingPhoto?.children?.map((child) => {
                  const hasConsent = reviewingPhoto.consentGiven?.includes(child.id) || false
                  const isProcessing = processingConsent[child.id] || false
                  const canEdit = canEditPhoto(reviewingPhoto.id)
                  
                  return (
                    <div
                      key={child.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        hasConsent
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {child.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{child.name}</p>
                          <p className={`text-sm ${hasConsent ? 'text-green-600' : 'text-red-600'}`}>
                            {hasConsent ? 'Consent Given' : 'No Consent'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        {!reviewingPhoto.isPublished && canEdit && (
                          <>
                            {hasConsent ? (
                              <button
                                onClick={() => handleRevokeConsent(child.id)}
                                disabled={isProcessing}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                  isProcessing
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-500 hover:bg-red-600 text-white'
                                }`}
                              >
                                {isProcessing ? 'Processing...' : 'Revoke'}
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGiveConsent(child.id)}
                                disabled={isProcessing}
                                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                  isProcessing
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                                }`}
                              >
                                {isProcessing ? 'Processing...' : 'Give Consent'}
                              </button>
                            )}
                          </>
                        )}
                        
                        {reviewingPhoto.isPublished && (
                          <div className="text-blue-600 text-sm font-semibold">
                            ✅ Published
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              {!reviewingPhoto.isPublished && (
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setReviewingPhoto(null)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Enlarged Photo Modal */}
        {enlargedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-[90vw] max-h-[90vh]">
              <button
                onClick={handleCloseEnlarged}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              >
                <X className="w-8 h-8" />
              </button>
              
              <div className="relative">
                {renderPhotoImage(enlargedPhoto)}
                
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
                <p className="text-lg">
                  {enlargedPhoto.title || 'Untitled Photo'}
                </p>
                <p className="text-sm text-gray-300">
                  Click outside or press X to close
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}

export default Dashboard
