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
  const [lastUpdate, setLastUpdate] = useState(Date.now()) // State to force re-renders

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

  const uploadPhoto = async (photoData) => {
    try {
      console.log('PhotoContext: Starting photo upload process')
      
      // Create new photo object
      const newPhoto = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: photoData.title || 'Untitled Photo',
        description: photoData.description || 'No description',
        location: photoData.location || 'Unknown location',
        teacher: photoData.teacher || 'Unknown teacher',
        date: photoData.date || new Date().toISOString().split('T')[0],
        url: photoData.url,
        currentDisplayUrl: photoData.url,
        children: photoData.children || [],
        consentGiven: [],
        consentPending: photoData.children || [],
        status: 'pending_consent', // Changed from 'approved' to 'pending_consent'
        aiProcessed: false,
        uploadedAt: new Date().toISOString()
      }
      
      console.log('PhotoContext: Created new photo object:', newPhoto)
      
      // Add to demo service
      demoPhotoService.addPhoto(newPhoto)
      console.log('PhotoContext: Added photo to demo service')
      
      // Update local state IMMEDIATELY - force re-render
      setPhotos(prev => {
        const updated = [...prev, newPhoto]
        console.log('PhotoContext: Updating photos state, current count:', prev.length)
        console.log('PhotoContext: New photos state count:', updated.length)
        return updated
      })
      
      // Update pending consent state IMMEDIATELY - force re-render
      setPendingConsent(prev => {
        const updated = [...prev, newPhoto]
        console.log('PhotoContext: Updating pending consent, current count:', prev.length)
        console.log('PhotoContext: New pending consent count:', updated.length)
        return updated
      })
      
      // Force multiple re-renders to ensure UI updates
      setLastUpdate(Date.now())
      
      // Wait a moment for state to settle
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('PhotoContext: Photo upload completed successfully')
      
      // Return the photo for consent management
      return newPhoto
      
    } catch (error) {
      console.error('PhotoContext: Error uploading photo:', error)
      throw error
    }
  }

  const giveConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return null
    }

    console.log('PhotoContext: GIVING CONSENT - Starting process...')
    console.log('PhotoContext: Photo ID:', photoId)
    console.log('PhotoContext: Child Name:', childName)
    
    // Get the current photo before any changes
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) {
      console.error('PhotoContext: Photo not found for consent operation')
      return null
    }
    
    console.log('PhotoContext: Current photo before consent change:', {
      id: currentPhoto.id,
      url: currentPhoto.url,
      currentDisplayUrl: currentPhoto.currentDisplayUrl,
      consentGiven: currentPhoto.consentGiven,
      consentPending: currentPhoto.consentPending,
      maskingInfo: currentPhoto.maskingInfo
    })

    // Calculate new consent values
    const newConsentGiven = [...currentPhoto.consentGiven, childName]
    const newConsentPending = currentPhoto.consentPending.filter(child => child !== childName)

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'approve')
    
    // Create the updated photo object
    const updatedPhoto = {
      ...currentPhoto,
      consentGiven: newConsentGiven,
      consentPending: newConsentPending,
      currentDisplayUrl: currentPhoto.url,
      status: 'approved'
    }
    
    // If this child was previously masked, remove them from the masked list
    if (currentPhoto.maskingInfo?.maskedChildren?.includes(childName)) {
      console.log('PhotoContext: Removing child from masked list:', childName)
      const newMaskedChildren = currentPhoto.maskingInfo.maskedChildren.filter(child => child !== childName)
      
      updatedPhoto.maskingInfo = {
        ...currentPhoto.maskingInfo,
        action: 'consent_given',
        childName,
        technique: 'consent_restoration',
        appliedAt: new Date().toISOString(),
        maskedChildren: newMaskedChildren
      }
      
      // If no more masked children, remove the masked URL
      if (newMaskedChildren.length === 0) {
        updatedPhoto.maskedUrl = null
        updatedPhoto.aiProcessed = false
        updatedPhoto.lastMaskingApplied = null
      }
      
      console.log('PhotoContext: Updated masking info after consent:', {
        maskedChildren: newMaskedChildren,
        count: newMaskedChildren.length,
        action: 'removed_from_masked',
        maskedUrl: updatedPhoto.maskedUrl
      })
    }
    
    // Update local state
    setPhotos(prev => {
      const updated = prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
      
      console.log('PhotoContext: Updated photos state with given consent')
      return updated
    })
    
    setPendingConsent(prev =>
      prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
    )

    console.log('PhotoContext: Consent given successfully')
    console.log('PhotoContext: Final photo state should have URL:', currentPhoto.url)
    console.log('PhotoContext: Final masking count:', updatedPhoto.maskingInfo?.maskedChildren?.length || 0)
    console.log('PhotoContext: Final masked URL:', updatedPhoto.maskedUrl)
    
    // Return the updated photo so Dashboard can use it immediately
    return updatedPhoto
  }

  const revokeConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return null
    }

    console.log('PhotoContext: REVOKING CONSENT - Starting process...')
    console.log('PhotoContext: Photo ID:', photoId)
    console.log('PhotoContext: Child Name:', childName)
    
    // Get the current photo before any changes
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) {
      console.error('PhotoContext: Photo not found for consent operation')
      return null
    }
    
    console.log('PhotoContext: Current photo before consent change:', {
      id: currentPhoto.id,
      url: currentPhoto.url,
      currentDisplayUrl: currentPhoto.currentDisplayUrl,
      consentGiven: currentPhoto.consentGiven,
      consentPending: currentPhoto.consentPending,
      maskingInfo: currentPhoto.maskingInfo
    })

    // Calculate new consent values
    const newConsentGiven = currentPhoto.consentGiven.filter(child => child !== childName)
    const newConsentPending = [...currentPhoto.consentPending, childName]

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'revoke')
    
    // Create the updated photo object - preserve existing masking info
    const updatedPhoto = {
      ...currentPhoto,
      consentGiven: newConsentGiven,
      consentPending: newConsentPending,
      currentDisplayUrl: currentPhoto.url,
      status: 'approved',
      // Keep existing masking info - don't modify it yet
      maskingInfo: currentPhoto.maskingInfo || null
    }
    
    // Update local state - keep image visible
    setPhotos(prev => {
      const updated = prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
      
      console.log('PhotoContext: Updated photos state with revoked consent')
      return updated
    })
    
    setPendingConsent(prev =>
      prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
    )

    // TRIGGER AI MASKING for the revoked child
    try {
      console.log('PhotoContext: Triggering AI masking for revoked child:', childName)
      
      // Check if this child is already masked to prevent duplicates
      const existingMaskedChildren = updatedPhoto.maskingInfo?.maskedChildren || []
      if (existingMaskedChildren.includes(childName)) {
        console.log('PhotoContext: Child already masked, skipping duplicate:', childName)
        console.log('PhotoContext: Current masked children:', existingMaskedChildren)
        return updatedPhoto
      }
      
      const maskingResult = await aiService.applyPrivacyMasking(photoId, childName, 'ai_removal')
      
      if (maskingResult.success) {
        console.log('PhotoContext: AI masking completed successfully for:', childName)
        console.log('PhotoContext: Masking result:', maskingResult)
        
        // Create new masking info - add to existing masked children
        const newMaskedChildren = [...existingMaskedChildren, childName]
        
        // Update the photo with masking info and the actual masked photo URL
        const maskedPhoto = {
          ...updatedPhoto,
          maskingInfo: {
            action: 'consent_revoked',
            childName,
            technique: 'ai_removal',
            appliedAt: new Date().toISOString(),
            maskedChildren: newMaskedChildren
          },
          // Store the actual masked photo URL for display
          maskedUrl: maskingResult.output.maskedPhoto,
          aiProcessed: true,
          lastMaskingApplied: new Date().toISOString()
        }
        
        setPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId ? maskedPhoto : photo
          )
        )
        
        // Update the updatedPhoto reference for return
        Object.assign(updatedPhoto, maskedPhoto)
        
        console.log('PhotoContext: Updated masking info:', {
          maskedChildren: newMaskedChildren,
          count: newMaskedChildren.length,
          action: 'added_new_masking',
          maskedUrl: maskingResult.output.maskedPhoto
        })
      } else {
        console.error('PhotoContext: AI masking failed for:', childName, maskingResult.error)
      }
    } catch (error) {
      console.error('PhotoContext: AI masking error for:', childName, error)
    }

    console.log('PhotoContext: Consent revoked successfully - image remains visible')
    console.log('PhotoContext: Final photo state should have URL:', currentPhoto.url)
    console.log('PhotoContext: Final masking count:', updatedPhoto.maskingInfo?.maskedChildren?.length || 0)
    console.log('PhotoContext: Final masked URL:', updatedPhoto.maskedUrl)
    
    // Return the updated photo so Dashboard can use it immediately
    return updatedPhoto
  }

  const denyConsent = async (photoId, childName) => {
    if (!canManageConsent(photos.find(p => p.id === photoId))) {
      console.error('User cannot manage consent for this photo')
      return null
    }

    console.log('PhotoContext: DENYING CONSENT - Starting process...')
    console.log('PhotoContext: Photo ID:', photoId)
    console.log('PhotoContext: Child Name:', childName)
    
    // Get the current photo before any changes
    const currentPhoto = photos.find(p => p.id === photoId)
    if (!currentPhoto) {
      console.error('PhotoContext: Photo not found for consent operation')
      return null
    }
    
    console.log('PhotoContext: Current photo before consent change:', {
      id: currentPhoto.id,
      url: currentPhoto.url,
      currentDisplayUrl: currentPhoto.currentDisplayUrl,
      consentGiven: currentPhoto.consentGiven,
      consentPending: currentPhoto.consentPending,
      maskingInfo: currentPhoto.maskingInfo
    })

    // Calculate new consent values - remove from both lists
    const newConsentGiven = currentPhoto.consentGiven.filter(child => child !== childName)
    const newConsentPending = currentPhoto.consentPending.filter(child => child !== childName)

    // Update consent status
    demoPhotoService.updatePhotoConsent(photoId, childName, 'deny')
    
    // Create the updated photo object
    const updatedPhoto = {
      ...currentPhoto,
      consentGiven: newConsentGiven,
      consentPending: newConsentPending,
      currentDisplayUrl: currentPhoto.url,
      status: 'denied'
    }
    
    // Update local state
    setPhotos(prev => {
      const updated = prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
      
      console.log('PhotoContext: Updated photos state with denied consent')
      return updated
    })
    
    setPendingConsent(prev =>
      prev.map(photo =>
        photo.id === photoId ? updatedPhoto : photo
      )
    )

    // TRIGGER AI MASKING for the denied child
    try {
      console.log('PhotoContext: Triggering AI masking for denied child:', childName)
      
      // Check if this child is already masked to prevent duplicates
      const existingMaskedChildren = updatedPhoto.maskingInfo?.maskedChildren || []
      if (existingMaskedChildren.includes(childName)) {
        console.log('PhotoContext: Child already masked, skipping duplicate:', childName)
        console.log('PhotoContext: Current masked children:', existingMaskedChildren)
        return updatedPhoto
      }
      
      const maskingResult = await aiService.applyPrivacyMasking(photoId, childName, 'ai_removal')
      
      if (maskingResult.success) {
        console.log('PhotoContext: AI masking completed successfully for:', childName)
        console.log('PhotoContext: Masking result:', maskingResult)
        
        // Create new masking info - add to existing masked children
        const newMaskedChildren = [...existingMaskedChildren, childName]
        
        // Update the photo with masking info and the actual masked photo URL
        const maskedPhoto = {
          ...updatedPhoto,
          maskingInfo: {
            action: 'consent_denied',
            childName,
            technique: 'ai_removal',
            appliedAt: new Date().toISOString(),
            maskedChildren: newMaskedChildren
          },
          // Store the actual masked photo URL for display
          maskedUrl: maskingResult.output.maskedPhoto,
          aiProcessed: true,
          lastMaskingApplied: new Date().toISOString()
        }
        
        setPhotos(prev =>
          prev.map(photo =>
            photo.id === photoId ? maskedPhoto : photo
          )
        )
        
        // Update the updatedPhoto reference for return
        Object.assign(updatedPhoto, maskedPhoto)
        
        console.log('PhotoContext: Updated masking info:', {
          maskedChildren: newMaskedChildren,
          count: newMaskedChildren.length,
          action: 'added_new_masking',
          maskedUrl: maskingResult.output.maskedPhoto
        })
      } else {
        console.error('PhotoContext: AI masking failed for:', childName, maskingResult.error)
      }
    } catch (error) {
      console.error('PhotoContext: AI masking error for:', childName, error)
    }

    console.log('PhotoContext: Consent denied successfully')
    console.log('PhotoContext: Final photo state should have URL:', currentPhoto.url)
    console.log('PhotoContext: Final masking count:', updatedPhoto.maskingInfo?.maskedChildren?.length || 0)
    console.log('PhotoContext: Final masked URL:', updatedPhoto.maskedUrl)
    
    // Return the updated photo so Dashboard can use it immediately
    return updatedPhoto
  }

  const deletePhoto = (photoId) => {
    // Only teachers can delete photos
    if (userRole !== 'teacher') {
      console.error('Only teachers can delete photos')
      return
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

  // Publish a photo to finalize it and prevent further editing
  const publishPhoto = async (photoId) => {
    setPhotos(prevPhotos => 
      prevPhotos.map(photo => 
        photo.id === photoId 
          ? { 
              ...photo, 
              isPublished: true,
              publishedAt: new Date().toISOString(),
              maskingInfo: {
                ...photo.maskingInfo,
                isPublished: true,
                publishedAt: new Date().toISOString()
              }
            }
          : photo
      )
    )
    
    setPendingConsent(prev => prev.filter(p => p.photoId !== photoId))
    setLastUpdate(Date.now())
    
    console.log(`✅ Photo ${photoId} published - no further editing allowed`)
  }

  // Check if a photo can be edited (not published)
  const canEditPhoto = (photoId) => {
    const photo = photos.find(p => p.id === photoId)
    return photo && !photo.isPublished
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
    denyConsent,
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
    setUserChildrenList,
    publishPhoto,
    canEditPhoto
  }

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  )
}
