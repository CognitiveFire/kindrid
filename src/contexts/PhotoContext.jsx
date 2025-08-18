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

    console.log('PhotoContext: GIVING CONSENT - Starting process...')
    console.log('PhotoContext: Photo ID:', photoId)
    console.log('PhotoContext: Child Name:', childName)
    
    // Get the current photo before any changes
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) {
      console.error('PhotoContext: Photo not found for consent operation')
      return
    }
    
    console.log('PhotoContext: Current photo before consent change:', {
      id: currentPhoto.id,
      url: currentPhoto.url,
      currentDisplayUrl: currentPhoto.currentDisplayUrl,
      consentGiven: currentPhoto.consentGiven,
      consentPending: currentPhoto.consentPending
    })

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'give')
    
    // Update local state - keep image visible
    setPhotos(prev => {
      const updated = prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: [...photo.consentGiven, childName],
              consentPending: photo.consentPending.filter(child => child !== childName),
              // CRITICAL: Keep the original image visible
              currentDisplayUrl: photo.url,
              status: 'approved'
            }
          : photo
      )
      
      // Log the updated photo
      const updatedPhoto = updated.find(p => p.id === photoId)
      console.log('PhotoContext: Photo after consent update:', {
        id: updatedPhoto.id,
        url: updatedPhoto.url,
        currentDisplayUrl: updatedPhoto.currentDisplayUrl,
        consentGiven: updatedPhoto.consentGiven,
        consentPending: updatedPhoto.consentPending
      })
      
      return updated
    })
    
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

    // Check if we need to trigger AI masking for remaining pending children
    const updatedPhoto = photos.find(p => p.id === photoId)
    if (updatedPhoto) {
      const newConsentGiven = [...updatedPhoto.consentGiven, childName]
      const newConsentPending = updatedPhoto.consentPending.filter(child => child !== childName)
      
      if (newConsentPending.length > 0) {
        // Some children still pending - trigger AI masking for them
        try {
          console.log('PhotoContext: Some children still pending, triggering AI masking for:', newConsentPending)
          for (const pendingChild of newConsentPending) {
            const maskingResult = await aiService.applyPrivacyMasking(photoId, pendingChild, 'ai_removal')
            if (maskingResult.success) {
              console.log('PhotoContext: AI masking completed for pending child:', pendingChild)
            }
          }
        } catch (error) {
          console.error('PhotoContext: AI masking error for pending children:', error)
        }
      }
    }

    console.log('PhotoContext: Consent given successfully - image remains visible')
    console.log('PhotoContext: Final photo state should have URL:', currentPhoto.url)
  }

  const revokeConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return
    }

    console.log('PhotoContext: REVOKING CONSENT - Starting process...')
    console.log('PhotoContext: Photo ID:', photoId)
    console.log('PhotoContext: Child Name:', childName)
    
    // Get the current photo before any changes
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) {
      console.error('PhotoContext: Photo not found for consent operation')
      return
    }
    
    console.log('PhotoContext: Current photo before consent change:', {
      id: currentPhoto.id,
      url: currentPhoto.url,
      currentDisplayUrl: currentPhoto.currentDisplayUrl,
      consentGiven: currentPhoto.consentGiven,
      consentPending: currentPhoto.consentPending
    })

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'revoke')
    
    // Update local state - keep image visible
    setPhotos(prev => {
      const updated = prev.map(photo =>
        photo.id === photoId
          ? {
              ...photo,
              consentGiven: photo.consentGiven.filter(child => child !== childName),
              consentPending: [...photo.consentPending, childName],
              // CRITICAL: Keep the original image visible
              currentDisplayUrl: photo.url,
              status: 'approved'
            }
          : photo
      )
      
      // Log the updated photo
      const updatedPhoto = updated.find(p => p.id === photoId)
      console.log('PhotoContext: Photo after consent update:', {
        id: updatedPhoto.id,
        url: updatedPhoto.url,
        currentDisplayUrl: updatedPhoto.currentDisplayUrl,
        consentGiven: updatedPhoto.consentGiven,
        consentPending: updatedPhoto.consentPending
      })
      
      return updated
    })
    
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

    // TRIGGER AI MASKING for the revoked child
    try {
      console.log('PhotoContext: Triggering AI masking for revoked child:', childName)
      const maskingResult = await aiService.applyPrivacyMasking(photoId, childName, 'ai_removal')
      
      if (maskingResult.success) {
        console.log('PhotoContext: AI masking completed successfully for:', childName)
        // Update the photo with masking info but keep image visible
        setPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId
              ? {
                  ...photo,
                  maskingInfo: {
                    action: 'consent_revoked',
                    childName,
                    technique: 'ai_removal',
                    appliedAt: new Date().toISOString(),
                    maskedChildren: [childName]
                  },
                  aiProcessed: true,
                  lastMaskingApplied: new Date().toISOString()
                }
              : photo
          )
        )
      } else {
        console.error('PhotoContext: AI masking failed for:', childName)
      }
    } catch (error) {
      console.error('PhotoContext: AI masking error for:', childName, error)
    }

    console.log('PhotoContext: Consent revoked successfully - image remains visible')
    console.log('PhotoContext: Final photo state should have URL:', currentPhoto.url)
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
        // Get the current photo
        const currentPhoto = photos.find(p => p.id === photoId)
        if (!currentPhoto) {
          console.error('Photo not found for reprocessing:', photoId)
          return result
        }

        // IMPORTANT: Keep the original image visible at all times
        // Only update the consent status and metadata, not the display URL
        const updatedPhoto = {
          ...currentPhoto,
          // Keep the original URL for display - never change this during consent review
          currentDisplayUrl: currentPhoto.url,
          // Store masking info separately without affecting the visible image
          maskingInfo: {
            action: consentAction,
            childName,
            technique: 'ai_removal',
            appliedAt: new Date().toISOString(),
            maskedChildren: consentAction === 'revoke' ? [childName] : [],
            allChildrenApproved: consentAction === 'approve_all'
          },
          // Update consent status
          consentGiven: consentAction === 'approve_all' 
            ? [...currentPhoto.consentGiven, childName]
            : currentPhoto.consentGiven,
          consentPending: consentAction === 'revoke'
            ? currentPhoto.consentPending.filter(child => child !== childName)
            : currentPhoto.consentPending,
          // Mark as processed but keep original image visible
          aiProcessed: true,
          status: 'approved', // Always set to approved after consent review
          lastMaskingApplied: new Date().toISOString()
        }
        
        // Update the photo in both local state and demo service
        updatePhoto(photoId, updatedPhoto)
        demoPhotoService.updatePhoto(photoId, updatedPhoto)
        
        console.log('PhotoContext: Photo consent updated successfully - image remains visible')
        console.log('PhotoContext: Original image URL preserved:', currentPhoto.url)
      }
      
      return result
    } catch (error) {
      console.error('PhotoContext: Photo reprocessing failed:', error)
      // Ensure the photo remains visible even if processing fails
      const currentPhoto = photos.find(p => p.id === photoId)
      if (currentPhoto) {
        const fallbackPhoto = {
          ...currentPhoto,
          currentDisplayUrl: currentPhoto.url, // Always fallback to original
          status: 'ai_failed'
        }
        updatePhoto(photoId, fallbackPhoto)
        demoPhotoService.updatePhoto(photoId, fallbackPhoto)
        console.log('PhotoContext: Photo restored to original after processing failure')
      }
      throw error
    }
  }

  // Helper function to create masked photo URL (simulates AI masking)
  // NOTE: This function is no longer used for display - images stay visible
  const createMaskedPhotoUrl = (originalUrl, childName, maskingType) => {
    // In a real app, this would call the AI service to actually mask the photo
    // For now, we'll simulate it by creating a modified URL that indicates masking
    // But we'll keep the original image visible during processing
    if (!originalUrl) {
      console.error('PhotoContext: No original URL provided for masking')
      return null
    }
    
    // For demo purposes, we'll create a visual indicator of masking
    // In production, this would be the actual AI-processed image
    const baseUrl = originalUrl.split('?')[0]
    const maskedUrl = `${baseUrl}?masked=true&child=${encodeURIComponent(childName)}&type=${maskingType}&timestamp=${Date.now()}`
    
    console.log(`PhotoContext: Created masked URL for ${childName}:`, maskedUrl)
    return maskedUrl
  }

  // Apply custom masking with user choice
  const applyCustomMasking = async (photoId, childName, maskingType) => {
    console.log(`PhotoContext: Applying custom masking ${maskingType} to ${childName} in photo ${photoId}`)
    
    try {
      const maskingResult = await aiService.applyPrivacyMasking(photoId, childName, maskingType)
      
      if (maskingResult.success) {
        const currentPhoto = photos.find(p => p.id === photoId)
        if (!currentPhoto) return null

        // Create masked version
        const maskedPhotoUrl = createMaskedPhotoUrl(currentPhoto.url, childName, maskingType)
        
        // Update photo with new masking
        const updatedPhoto = {
          ...currentPhoto,
          maskedUrl: maskedPhotoUrl,
          currentDisplayUrl: maskedPhotoUrl || currentPhoto.url, // Fallback to original if masking fails
          aiProcessed: true,
          lastMaskingApplied: new Date().toISOString(),
          maskingDetails: {
            action: 'custom_masking',
            childName,
            technique: maskingType,
            appliedAt: new Date().toISOString()
          }
        }
        
        updatePhoto(photoId, updatedPhoto)
        demoPhotoService.updatePhoto(photoId, updatedPhoto)
        
        console.log(`PhotoContext: Custom masking ${maskingType} applied successfully`)
        return maskingResult
      }
    } catch (error) {
      console.error('PhotoContext: Custom masking failed:', error)
      throw error
    }
  }

  // Revert photo to original (unmasked) version
  const revertToOriginal = (photoId) => {
    console.log(`PhotoContext: Reverting photo ${photoId} to original`)
    
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) return

    const updatedPhoto = {
      ...currentPhoto,
      currentDisplayUrl: currentPhoto.url, // Show original
      maskedUrl: null,
      aiProcessed: false,
      lastMaskingApplied: null,
      maskingDetails: null
    }
    
    updatePhoto(photoId, updatedPhoto)
    demoPhotoService.updatePhoto(photoId, updatedPhoto)
    
    console.log(`PhotoContext: Photo ${photoId} reverted to original`)
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
    applyCustomMasking,
    revertToOriginal,
    switchUserRole,
    setUserChildrenList
  }

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  )
}
