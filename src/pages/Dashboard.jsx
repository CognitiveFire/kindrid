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
    updatePhoto
  } = usePhotos()
  const [showPhotoUpload, setShowPhotoUpload] = useState(false)
  const [editingPhoto, setEditingPhoto] = useState(null)
  const [deletingPhoto, setDeletingPhoto] = useState(null)
  const [reviewingPhoto, setReviewingPhoto] = useState(null)
  const [processingConsent, setProcessingConsent] = useState(new Set()) // Track which photos are being processed

  // Debug: Monitor changes to reviewingPhoto
  useEffect(() => {
    if (reviewingPhoto) {
      console.log('Dashboard: reviewingPhoto state updated:', {
        id: reviewingPhoto.id,
        title: reviewingPhoto.title,
        consentGiven: reviewingPhoto.consentGiven,
        consentPending: reviewingPhoto.consentPending,
        status: reviewingPhoto.status
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

  const handleGiveConsent = async (photoId, childName) => {
    try {
      // Set loading state
      setProcessingConsent(prev => new Set([...prev, `${photoId}-${childName}`]))
      
      await giveConsent(photoId, childName)
      
      // Get the updated photo data from the main photos array
      const updatedPhoto = photos.find(p => p.id === photoId)
      if (updatedPhoto) {
        console.log('Dashboard: Updating reviewingPhoto with new consent data:', updatedPhoto)
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Error giving consent:', error)
    } finally {
      // Clear loading state
      setProcessingConsent(prev => {
        const newSet = new Set(prev)
        newSet.delete(`${photoId}-${childName}`)
        return newSet
      })
    }
  }

  const handleDenyConsent = async (photoId, childName) => {
    try {
      // Set loading state
      setProcessingConsent(prev => new Set([...prev, `${photoId}-${childName}`]))
      
      // This will trigger AI masking for the denied child
      await revokeConsent(photoId, childName)
      
      // Get the updated photo data from the main photos array
      const updatedPhoto = photos.find(p => p.id === photoId)
      if (updatedPhoto) {
        console.log('Dashboard: Updating reviewingPhoto after deny consent:', updatedPhoto)
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Error denying consent:', error)
    } finally {
      // Clear loading state
      setProcessingConsent(prev => {
        const newSet = new Set(prev)
        newSet.delete(`${photoId}-${childName}`)
        return newSet
      })
    }
  }

  const handleRevokeConsent = async (photoId, childName) => {
    try {
      // Set loading state
      setProcessingConsent(prev => new Set([...prev, `${photoId}-${childName}`]))
      
      await revokeConsent(photoId, childName)
      
      // Get the updated photo data from the main photos array
      const updatedPhoto = photos.find(p => p.id === photoId)
      if (updatedPhoto) {
        console.log('Dashboard: Updating reviewingPhoto after revoke consent:', updatedPhoto)
        setReviewingPhoto(updatedPhoto)
      }
    } catch (error) {
      console.error('Error revoking consent:', error)
    } finally {
      // Clear loading state
      setProcessingConsent(prev => {
        const newSet = new Set(prev)
        newSet.delete(`${photoId}-${childName}`)
        return newSet
      })
    }
  }

  const renderPhotoImage = (photo) => {
    console.log('Dashboard: Rendering photo image:', {
      id: photo.id,
      title: photo.title,
      url: photo.url,
      currentDisplayUrl: photo.currentDisplayUrl,
      maskedUrl: photo.maskedUrl,
      status: photo.status
    })
    
    // Always prioritize the original URL to prevent images from disappearing
    // Only fall back to other URLs if the original is completely unavailable
    let imageUrl = photo.url || photo.currentDisplayUrl || photo.maskedUrl
    
    console.log('Dashboard: Selected image URL:', imageUrl)
    
    if (imageUrl) {
      // Check if it's a data URL (SVG placeholder)
      if (imageUrl.startsWith('data:')) {
        console.log('Dashboard: Using data URL image')
        return (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
          />
        )
      }
      // Check if it's a blob URL
      if (imageUrl.startsWith('blob:')) {
        console.log('Dashboard: Using blob URL image')
        return (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              console.error('Dashboard: Blob image failed to load:', imageUrl)
              console.error('Dashboard: Error details:', e)
            }}
          />
        )
      }
      // Check if it's a regular file path (like /1.jpg, /2.jpg, etc.)
      if (imageUrl.startsWith('/')) {
        console.log('Dashboard: Using file path image')
        return (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
          />
        )
      }
      // Check if it's a masked URL with query parameters - strip them for display
      if (imageUrl.includes('?masked=true')) {
        const baseUrl = imageUrl.split('?')[0]
        console.log('Dashboard: Using masked URL (stripped):', baseUrl)
        return (
          <div className="relative">
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
        <PhotoUpload onClose={() => setShowPhotoUpload(false)} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Review Photo: {reviewingPhoto.title}</h2>
                <button
                  onClick={() => setReviewingPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              {/* Photo Display */}
              <div className="mb-6">
                {/* Processing Indicator */}
                {reviewingPhoto.status === 'ai_processing' && (
                  <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-purple-700">
                      <Brain className="w-5 h-5 animate-pulse" />
                      <span className="text-sm font-medium">AI is processing this photo...</span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      This may take a few seconds. The image will remain visible during processing.
                    </p>
                  </div>
                )}
                
                <div className="relative">
                  {renderPhotoImage(reviewingPhoto)}
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs text-gray-600">
                    {reviewingPhoto.status}
                  </div>
                </div>
              </div>

              {/* Photo Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photo Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Title:</span> {reviewingPhoto.title}</p>
                    <p><span className="font-medium">Description:</span> {reviewingPhoto.description || 'No description'}</p>
                    <p><span className="font-medium">Location:</span> {reviewingPhoto.location || 'No location'}</p>
                    <p><span className="font-medium">Teacher:</span> {reviewingPhoto.teacher}</p>
                    <p><span className="font-medium">Date:</span> {reviewingPhoto.date}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Children in Photo</h3>
                  <div className="space-y-2">
                    {reviewingPhoto.children.map((child) => {
                      const hasConsent = reviewingPhoto.consentGiven.includes(child)
                      const isPending = reviewingPhoto.consentPending.includes(child)
                      const isDenied = !hasConsent && !isPending // If not approved and not pending, they're denied
                      
                      return (
                        <div key={child} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <span className="font-medium text-gray-900">{child}</span>
                          <div className="flex space-x-2">
                            {hasConsent ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  ✅ Approved
                                </span>
                                <button
                                  onClick={() => handleRevokeConsent(reviewingPhoto.id, child)}
                                  disabled={processingConsent.has(`${reviewingPhoto.id}-${child}`)}
                                  className={`px-2 py-1 text-xs rounded transition-colors ${
                                    processingConsent.has(`${reviewingPhoto.id}-${child}`)
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                                  }`}
                                >
                                  {processingConsent.has(`${reviewingPhoto.id}-${child}`) ? 'Processing...' : 'Revoke'}
                                </button>
                              </div>
                            ) : isPending ? (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleGiveConsent(reviewingPhoto.id, child)}
                                  disabled={processingConsent.has(`${reviewingPhoto.id}-${child}`)}
                                  className={`px-3 py-1 text-xs rounded transition-colors ${
                                    processingConsent.has(`${reviewingPhoto.id}-${child}`)
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {processingConsent.has(`${reviewingPhoto.id}-${child}`) ? 'Processing...' : 'Approve'}
                                </button>
                                <button
                                  onClick={() => handleDenyConsent(reviewingPhoto.id, child)}
                                  disabled={processingConsent.has(`${reviewingPhoto.id}-${child}`)}
                                  className={`px-3 py-1 text-xs rounded transition-colors ${
                                    processingConsent.has(`${reviewingPhoto.id}-${child}`)
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-red-600 text-white hover:bg-red-700'
                                  }`}
                                >
                                  {processingConsent.has(`${reviewingPhoto.id}-${child}`) ? 'Processing...' : 'Deny'}
                                </button>
                              </div>
                            ) : isDenied ? (
                              <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  ❌ Denied
                                </span>
                                <button
                                  onClick={() => handleGiveConsent(reviewingPhoto.id, child)}
                                  disabled={processingConsent.has(`${reviewingPhoto.id}-${child}`)}
                                  className={`px-3 py-1 text-xs rounded transition-colors ${
                                    processingConsent.has(`${reviewingPhoto.id}-${child}`)
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {processingConsent.has(`${reviewingPhoto.id}-${child}`) ? 'Processing...' : 'Approve'}
                                </button>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Current Consent Status Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Consent Status</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{reviewingPhoto.consentGiven.length}</div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{reviewingPhoto.consentPending.length}</div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{reviewingPhoto.children.length - reviewingPhoto.consentGiven.length - reviewingPhoto.consentPending.length}</div>
                    <div className="text-sm text-gray-600">Denied</div>
                  </div>
                </div>
              </div>

              {/* Photo Status & Processing */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Photo Status & AI Processing</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <p><span className="font-medium">Current Status:</span> {getStatusText(reviewingPhoto.status)}</p>
                  <p><span className="font-medium">AI Processed:</span> {reviewingPhoto.aiProcessed ? 'Yes' : 'No'}</p>
                  {reviewingPhoto.status === 'ai_processing' && (
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Brain className="w-4 h-4" />
                      <span>AI is processing this photo...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Consent Actions & Identity Protection */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="text-lg font-semibold text-green-900 mb-3">Consent Actions & Identity Protection</h3>
                <div className="space-y-3 text-sm text-green-800">
                  <p><strong>When you approve a child:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Their face remains visible in the photo</li>
                    <li>They can be identified by other approved parents</li>
                    <li>Photo is shared normally</li>
                  </ul>
                  
                  <p><strong>When you deny consent:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>ClassVault™ AI will attempt to remove them from the photo</li>
                    <li>If removal isn't possible, AI applies artistic filters to mask their identity</li>
                    <li>Original photo is preserved for future consent approval</li>
                  </ul>
                </div>
              </div>

              {/* Masking Options for Denied Consent */}
              {reviewingPhoto.children.some(child => 
                !reviewingPhoto.consentGiven.includes(child) && 
                !reviewingPhoto.consentPending.includes(child)
              ) && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">AI Identity Masking Applied</h3>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p><strong>Children without consent are being protected by ClassVault™ AI:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>AI attempts to remove denied children and rebuild background</li>
                      <li>If removal fails, artistic filters mask their identity</li>
                      <li>Original photo is preserved for future consent changes</li>
                      <li>Processing may take a few minutes</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* What Happens Next */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">What Happens Next</h3>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p><strong>After consent decisions:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>AI processes the photo based on consent decisions</li>
                    <li>Denied children are masked or removed</li>
                    <li>Approved children remain visible</li>
                    <li>You'll receive a notification when processing is complete</li>
                    <li>You can change consent decisions at any time</li>
                  </ul>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setReviewingPhoto(null)}
                  className="btn-primary px-6 py-2"
                >
                  Close Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
