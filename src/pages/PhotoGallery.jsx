import React, { useState, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePhotos } from '../contexts/PhotoContext'
import { 
  Camera, 
  Calendar, 
  MapPin, 
  User, 
  Eye, 
  Download, 
  Share2, 
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  Shield,
  User as UserIcon
} from 'lucide-react'

const PhotoGallery = () => {
  const { user } = useAuth()
  const { 
    photos, 
    giveConsent, 
    revokeConsent, 
    userRole, 
    userChildren, 
    canManageConsent,
    getPhotosForUser 
  } = usePhotos()
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [enlargedPhoto, setEnlargedPhoto] = useState(null)

  // Filter photos based on search and status
  const filteredPhotos = useMemo(() => {
    let filtered = getPhotosForUser()

    if (searchQuery) {
      filtered = filtered.filter(photo =>
        photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.children.some(child => child.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(photo => photo.status === statusFilter)
    }

    return filtered
  }, [getPhotosForUser, searchQuery, statusFilter])

  const handleConsent = (photoId, childName, action) => {
    if (action === 'give') {
      giveConsent(photoId, childName)
    } else {
      revokeConsent(photoId, childName)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'pending_consent':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'ai_processing':
        return <Shield className="w-5 h-5 text-purple-500" />
      case 'ai_failed':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />
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

  const renderPhotoImage = (photo) => {
    // Priority: masked URL > current display URL > original URL
    let imageUrl = photo.maskedUrl || photo.currentDisplayUrl || photo.url
    
    if (imageUrl) {
      // Check if it's a data URL (SVG placeholder)
      if (imageUrl.startsWith('data:')) {
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
        return (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
          />
        )
      }
      // Check if it's a regular file path (like /1.jpg, /2.jpg, etc.)
      if (imageUrl.startsWith('/')) {
        return (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-48 object-cover"
          />
        )
        // Check if it's a masked URL with query parameters
      } else if (imageUrl.includes('?masked=true')) {
        // This is a masked photo - apply visual indication
        const baseUrl = imageUrl.split('?')[0]
        return (
          <div className="relative">
            <img 
              src={baseUrl} 
              alt={photo.title}
              className="w-full h-48 object-cover filter blur-sm opacity-75"
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
    }
    
    // Fallback placeholder
    return (
      <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center">
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-500">{photo.title}</p>
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Photo Gallery</h1>
            <p className="text-gray-600">
              {userRole === 'teacher' 
                ? 'Manage and review all school photos' 
                : 'View photos featuring your children'
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userRole === 'teacher' ? 'bg-kindrid-100 text-kindrid-800' : 'bg-green-100 text-green-800'
            }`}>
              {userRole === 'teacher' ? 'Teacher View' : 'Parent View'}
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search photos by title, description, or children..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="pending_consent">Pending Consent</option>
            <option value="approved">Approved</option>
            <option value="ai_processing">AI Processing</option>
            <option value="ai_failed">AI Failed</option>
          </select>
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'grid' 
                  ? 'bg-kindrid-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm font-medium ${
                viewMode === 'list' 
                  ? 'bg-kindrid-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Photos Grid/List */}
      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {searchQuery || statusFilter !== 'all' 
              ? 'No photos match your search criteria' 
              : userRole === 'teacher' 
                ? 'No photos uploaded yet' 
                : 'No photos featuring your children yet'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="card">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4 relative group cursor-pointer" onClick={() => handlePhotoEnlarge(photo)}>
                {renderPhotoImage(photo)}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-lg font-semibold">
                    Click to Enlarge
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{photo.title}</h3>
                  <p className="text-sm text-gray-600">{photo.description}</p>
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <p><span className="font-medium">Date:</span> {photo.date}</p>
                  <p><span className="font-medium">Location:</span> {photo.location}</p>
                  <p><span className="font-medium">Teacher:</span> {photo.teacher}</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Children:</span>
                    <span className="text-xs text-gray-500">{photo.children.length} total</span>
                  </div>
                  
                  <div className="space-y-1">
                    {photo.children.map((child) => {
                      const hasConsent = photo.consentGiven.includes(child)
                      const canManage = canManageConsent(photo)
                      return (
                        <div key={child} className="flex items-center justify-between text-xs">
                          <span className={hasConsent ? 'text-green-600' : 'text-red-600'}>
                            {child}
                          </span>
                          <div className="flex items-center space-x-2">
                            {hasConsent ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-3 h-3 text-red-500" />
                            )}
                            {canManage && (
                              <button
                                onClick={() => {
                                  if (hasConsent) {
                                    revokeConsent(photo.id, child)
                                  } else {
                                    giveConsent(photo.id, child)
                                  }
                                }}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  hasConsent
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {hasConsent ? 'Revoke' : 'Approve'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    photo.status === 'approved' 
                      ? 'bg-green-100 text-green-700' 
                      : photo.status === 'pending_consent'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {getStatusText(photo.status)}
                  </span>
                  
                  <button
                    onClick={() => setSelectedPhoto(photo)}
                    className="text-kindrid-600 hover:text-kindrid-700 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Photo Detail Modal */}
      {selectedPhoto && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedPhoto.title}</h2>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* Photo Display */}
              <div className="mb-6">
                {renderPhotoImage(selectedPhoto)}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Photo Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photo Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Description:</span> {selectedPhoto.description}</p>
                    <p><span className="font-medium">Date:</span> {selectedPhoto.date}</p>
                    <p><span className="font-medium">Location:</span> {selectedPhoto.location}</p>
                    <p><span className="font-medium">Teacher:</span> {selectedPhoto.teacher}</p>
                    <p><span className="font-medium">Status:</span> {getStatusText(selectedPhoto.status)}</p>
                  </div>
                </div>
                
                {/* Consent Management */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Consent Management</h3>
                  <div className="space-y-2">
                    {selectedPhoto.children.map((child) => {
                      const hasConsent = selectedPhoto.consentGiven.includes(child)
                      const canManage = canManageConsent(selectedPhoto)
                      return (
                        <div key={child} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                          <span className="font-medium">{child}</span>
                          <div className="flex items-center space-x-2">
                            {hasConsent ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                            {canManage && (
                              <button
                                onClick={() => {
                                  if (hasConsent) {
                                    revokeConsent(selectedPhoto.id, child)
                                  } else {
                                    giveConsent(selectedPhoto.id, child)
                                  }
                                }}
                                className={`px-3 py-1 rounded text-sm font-medium ${
                                  hasConsent
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                              >
                                {hasConsent ? 'Revoke' : 'Approve'}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {enlargedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-[95vw] max-h-[95vh]">
            <button
              onClick={handleCloseEnlarged}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              ✕
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

export default PhotoGallery
