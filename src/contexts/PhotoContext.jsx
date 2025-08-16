import React, { createContext, useContext, useState, useEffect } from 'react'
import demoPhotoService from '../services/demoPhotoService'
import aiService from '../services/aiService'

const PhotoContext = createContext()

export const usePhotos = () => {
  const context = useContext(PhotoContext)
  if (!context) {
    throw new Error('usePhotos must be used within a PhotoProvider')
  }
  return context
}

export const PhotoProvider = ({ children }) => {
  const [photos, setPhotos] = useState([])
  const [pendingConsent, setPendingConsent] = useState([])
  const [aiProcessing, setAiProcessing] = useState(false)
  const [aiStats, setAiStats] = useState({
    processed: 0,
    total: 0,
    processing: 0
  })
  const [userRole, setUserRole] = useState('teacher') // 'teacher' or 'parent'
  const [userChildren, setUserChildren] = useState(['Emma', 'Lucas']) // For parents: list of their children
  const [isFaceLearning, setIsFaceLearning] = useState(false)
  const [faceLearningProgress, setFaceLearningProgress] = useState(0)
  const [learnedFaces, setLearnedFaces] = useState([])

  useEffect(() => {
    // Load demo photos from service
    const demoPhotos = demoPhotoService.getAllPhotos()
    console.log('PhotoContext: Loaded demo photos:', demoPhotos)
    
    setPhotos(demoPhotos)
    setPendingConsent(demoPhotos.filter(p => p.status === 'pending_consent'))
    
    const stats = demoPhotoService.getAIStats()
    setAiStats(stats)

    // Set user role and children based on mock data
    // In real app, this would come from authentication
    setUserRole('teacher') // Default to teacher for demo
    setUserChildren(['Emma', 'Lucas']) // Mock children for parent view

    return () => { // Cleanup function
      photos.forEach(photo => {
        if (photo.url && photo.url.startsWith('blob:')) {
          URL.revokeObjectURL(photo.url)
        }
      })
    }
  }, [])

  // Check if user can manage consent for a specific photo
  const canManageConsent = (photo) => {
    if (userRole === 'teacher') return true
    if (userRole === 'parent') {
      return photo.children.some(child => userChildren.includes(child))
    }
    return false
  }

  // Get photos filtered by user role
  const getPhotosForUser = () => {
    if (userRole === 'teacher') return photos
    if (userRole === 'parent') {
      return photos.filter(photo => 
        photo.children.some(child => userChildren.includes(child))
      )
    }
    return []
  }

  const uploadPhoto = async (file, metadata) => {
    console.log('PhotoContext: Starting upload with metadata:', metadata)
    
    // Only teachers can upload photos
    if (userRole !== 'teacher') {
      console.error('Only teachers can upload photos')
      return null
    }

    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Create blob URL for the uploaded file
    const blobUrl = URL.createObjectURL(file)

    const newPhoto = {
      id: uniqueId,
      url: blobUrl, // Use the blob URL directly
      title: metadata.title,
      description: metadata.description,
      date: new Date().toISOString().split('T')[0],
      location: metadata.location,
      teacher: metadata.teacher,
      children: metadata.children,
      status: 'ai_processing',
      aiProcessed: false,
      consentGiven: [],
      consentPending: metadata.children,
      tags: metadata.tags || []
    }

    console.log('PhotoContext: Created new photo object:', newPhoto)
    const existingPhoto = photos.find(p => p.id === uniqueId)
    if (existingPhoto) {
      console.error('PhotoContext: Photo with this ID already exists:', uniqueId)
      URL.revokeObjectURL(blobUrl)
      return null
    }

    // Add to demo service first
    const addedPhoto = demoPhotoService.addPhoto(newPhoto)
    if (!addedPhoto) {
      console.error('PhotoContext: Failed to add photo to demo service')
      URL.revokeObjectURL(blobUrl)
      return null
    }
    console.log('PhotoContext: Added photo to demo service')

    // Update local state immediately with the new photo
    setPhotos(prev => {
      console.log('PhotoContext: Updating photos state, current count:', prev.length)
      const updated = [newPhoto, ...prev]
      console.log('PhotoContext: New photos state count:', updated.length)
      return updated
    })

    setPendingConsent(prev => {
      console.log('PhotoContext: Updating pending consent, current count:', prev.length)
      const updated = [newPhoto, ...prev]
      console.log('PhotoContext: New pending consent count:', updated.length)
      return updated
    })

    setAiProcessing(true)
    try {
      console.log('PhotoContext: Starting AI processing for photo:', newPhoto.id)
      const processedPhoto = await aiService.processPhoto(newPhoto.id, newPhoto)
      console.log('PhotoContext: AI processing complete:', processedPhoto)

      const updatedPhoto = {
        ...processedPhoto,
        status: 'pending_consent',
        aiProcessed: true
      }
      console.log('PhotoContext: Updating photo with AI results:', updatedPhoto)
      demoPhotoService.updatePhoto(newPhoto.id, updatedPhoto)

      // Update the photo in local state
      setPhotos(prev =>
        prev.map(p =>
          p.id === newPhoto.id ? updatedPhoto : p
        )
      )
      setPendingConsent(prev =>
        prev.map(p =>
          p.id === newPhoto.id ? updatedPhoto : p
        )
      )
      const stats = demoPhotoService.getAIStats()
      setAiStats(stats)

    } catch (error) {
      console.error('AI processing failed:', error)
      const failedPhoto = {
        ...newPhoto,
        status: 'ai_failed',
        aiProcessed: false
      }
      demoPhotoService.updatePhoto(newPhoto.id, failedPhoto)
      setPhotos(prev =>
        prev.map(p =>
          p.id === newPhoto.id ? failedPhoto : p
        )
      )
    } finally {
      setAiProcessing(false)
    }
    return newPhoto
  }

  const giveConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return
    }

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'give')
    
    // Update local state
    setPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: [...photo.consentGiven, childName],
              consentPending: photo.consentPending.filter(child => child !== childName)
            }
          : photo
      )
    )
    setPendingConsent(prev =>
      prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: [...photo.consentGiven, childName],
              consentPending: photo.consentPending.filter(child => child !== childName)
          }
          : photo
      )
    )

    // Check if all children now have consent - if so, trigger AI processing
    const photo = photos.find(p => p.id === photoId)
    if (photo) {
      const updatedPhoto = {
        ...photo,
        consentGiven: [...photo.consentGiven, childName],
        consentPending: photo.consentPending.filter(child => child !== childName)
      }
      
      if (updatedPhoto.consentPending.length === 0 && updatedPhoto.consentGiven.length === updatedPhoto.children.length) {
        // All children have consent, trigger AI processing to restore original photo
        try {
          console.log('PhotoContext: All children approved, triggering AI processing to restore photo')
          const result = await reprocessPhotoForConsent(photoId, 'approve_all', childName)
          
          if (result && result.success) {
            console.log('PhotoContext: AI processing completed for full approval')
            setPhotos(prev =>
              prev.map(photo =>
                photo.id === photoId
                  ? { ...photo, status: 'approved', aiProcessed: true }
                  : photo
              )
            )
          }
        } catch (error) {
          console.error('PhotoContext: AI processing failed for full approval:', error)
        }
      }
    }
  }

  const revokeConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return
    }

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'revoke')
    
    // Update local state
    const updatedPhoto = setPhotos(prev =>
      prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: photo.consentGiven.filter(child => child !== childName),
              consentPending: [...photo.consentPending, childName],
              status: 'ai_processing' // Mark as processing
            }
          : photo
      )
    )
    setPendingConsent(prev =>
      prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: photo.consentGiven.filter(child => child !== childName),
              consentPending: [...photo.consentPending, childName]
            }
          : photo
      )
    )

    // Trigger AI processing to mask the revoked child
    try {
      console.log('PhotoContext: Triggering AI processing for revoked consent:', photoId, childName)
      const result = await reprocessPhotoForConsent(photoId, 'revoke', childName)
      
      if (result && result.success) {
        console.log('PhotoContext: AI processing completed for revoked consent')
        // Update photo status to completed
        setPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId
              ? { ...photo, status: 'approved', aiProcessed: true }
              : photo
          )
        )
      }
    } catch (error) {
      console.error('PhotoContext: AI processing failed for revoked consent:', error)
      // Revert status if AI processing fails
      setPhotos(prev =>
        prev.map(photo =>
          photo.id === photoId
            ? { ...photo, status: 'ai_failed' }
            : photo
        )
      )
    }
  }

  const deletePhoto = (photoId) => {
    // Only teachers can delete photos
    if (userRole !== 'teacher') {
      console.error('Only teachers can delete photos')
      return
    }

    const photoToDelete = photos.find(p => p.id === photoId)
    if (photoToDelete && photoToDelete.url && photoToDelete.url.startsWith('blob:')) {
      URL.revokeObjectURL(photoToDelete.url)
    }
    demoPhotoService.removePhoto(photoId)
    setPhotos(prev => prev.filter(p => p.id !== photoId))
    setPendingConsent(prev => prev.filter(p => p.id !== photoId))
  }

  const updatePhoto = (photoId, updates) => {
    // Only teachers can update photos
    if (userRole !== 'teacher') {
      console.error('Only teachers can update photos')
      return
    }

    console.log('PhotoContext: Updating photo:', photoId, 'with:', updates)
    
    // Update in demo service
    const updatedPhoto = demoPhotoService.updatePhoto(photoId, updates)
    if (updatedPhoto) {
      // Update local state
      setPhotos(prev =>
        prev.map(photo =>
          photo.id === photoId ? updatedPhoto : photo
        )
      )
      setPendingConsent(prev =>
        prev.map(photo =>
          photo.id === photoId ? updatedPhoto : photo
        )
      )
      console.log('PhotoContext: Photo updated successfully')
      return updatedPhoto
    }
    
    console.log('PhotoContext: Failed to update photo:', photoId)
    return null
  }

  const getPhotosByStatus = (status) => {
    return demoPhotoService.getPhotosByStatus(status)
  }

  const getPhotosByChild = (childName) => {
    return demoPhotoService.getPhotosByChild(childName)
  }

  const searchPhotos = (query) => {
    return demoPhotoService.searchPhotos(query)
  }

  const getConsentStats = () => {
    return demoPhotoService.getConsentStats()
  }

  const getPhotoAnalytics = () => {
    return demoPhotoService.getPhotoAnalytics()
  }

  const removePersonFromPhoto = async (photoId, personId, options = {}) => {
    return await aiService.removePersonAndRebuildBackground(photoId, personId, options)
  }

  const startFaceLearning = async (childTags) => {
    console.log('PhotoContext: Starting face learning with tags:', childTags)
    setIsFaceLearning(true)
    setFaceLearningProgress(0)
    
    try {
      // Simulate AI face learning process
      const result = await aiService.learnFacesFromPhotos(childTags)
      
      if (result.success) {
        setLearnedFaces(prev => [...prev, ...result.learnedFaces])
        setFaceLearningProgress(100)
        console.log('PhotoContext: Face learning completed successfully')
      }
      
      return result
    } catch (error) {
      console.error('PhotoContext: Face learning failed:', error)
      throw error
    } finally {
      setIsFaceLearning(false)
      setFaceLearningProgress(0)
    }
  }

  const reprocessPhotoForConsent = async (photoId, consentAction, childName) => {
    console.log('PhotoContext: Reprocessing photo for consent change:', photoId, consentAction, childName)
    
    try {
      const result = await aiService.updatePhotoForConsent(photoId, consentAction, childName)
      
      if (result.success) {
        // Update the photo with new AI processing
        const updatedPhoto = { ...result.photo }
        updatePhoto(photoId, updatedPhoto)
        console.log('PhotoContext: Photo reprocessed successfully')
      }
      
      return result
    } catch (error) {
      console.error('PhotoContext: Photo reprocessing failed:', error)
      throw error
    }
  }

  const switchUserRole = (role) => {
    setUserRole(role)
  }

  const setUserChildrenList = (children) => {
    setUserChildren(children)
  }

  const value = {
    photos,
    pendingConsent,
    aiProcessing,
    aiStats,
    userRole,
    userChildren,
    isFaceLearning,
    faceLearningProgress,
    learnedFaces,
    canManageConsent,
    getPhotosForUser,
    uploadPhoto,
    giveConsent,
    revokeConsent,
    deletePhoto,
    updatePhoto,
    getPhotosByStatus,
    getPhotosByChild,
    searchPhotos,
    getConsentStats,
    getPhotoAnalytics,
    removePersonFromPhoto,
    startFaceLearning,
    reprocessPhotoForConsent,
    switchUserRole,
    setUserChildrenList
  }

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  )
}
