import React, { createContext, useContext, useState, useEffect, startTransition } from 'react'
import demoPhotoService from '../services/demoPhotoService'

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
  const [aiProcessing, setAiProcessing] = useState({})
  const [aiStats, setAiStats] = useState({
    totalProcessed: 0,
    totalMasked: 0,
    averageProcessingTime: 0
  })

  // Load photos on mount
  useEffect(() => {
    const loadPhotos = () => {
      try {
        const loadedPhotos = demoPhotoService.getAllPhotosWithImages()
        console.log('PhotoContext: Loaded demo photos with images:', loadedPhotos)
        setPhotos(loadedPhotos)
      } catch (error) {
        console.error('PhotoContext: Error loading photos:', error)
        setPhotos([])
      }
    }

    loadPhotos()
  }, [])

  // Simple photo upload - no complex state management
  const uploadPhoto = async (photoData) => {
    try {
      console.log('PhotoContext: Starting photo upload process')
      
      const newPhoto = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...photoData,
        status: 'pending_consent',
        consentGiven: [],
        consentPending: photoData.children || [],
        aiProcessed: false,
        maskedUrl: null,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      }

      console.log('PhotoContext: Created new photo object:', newPhoto)

      // Add to service
      const addedPhoto = demoPhotoService.addPhoto(newPhoto)
      console.log('PhotoContext: Added photo to demo service:', addedPhoto)

      // Update local state
      setPhotos(prev => [...prev, addedPhoto])
      
      console.log('PhotoContext: Photo upload completed successfully')
      return addedPhoto
    } catch (error) {
      console.error('PhotoContext: Error uploading photo:', error)
      throw error
    }
  }

  // Simple consent processing - just update the photo
  const processConsentAndApplyMasking = async (photoId, childrenWithConsent, childrenWithoutConsent) => {
    try {
      console.log('PhotoContext: Processing consent for photo:', photoId)
      
      const currentPhoto = photos.find(p => p.id === photoId)
      if (!currentPhoto) {
        throw new Error('Photo not found')
      }

      // Create masked URL if children need masking
      let maskedUrl = null
      let editedImageUrl = null
      if (childrenWithoutConsent.length > 0) {
        // For prototype: create a simple masked URL that simulates AI processing
        // In real implementation, this would be a link to the processed image
        maskedUrl = `/api/photos/${photoId}/masked?children=${childrenWithoutConsent.join(',')}&timestamp=${Date.now()}`
        
        // For prototype: set the actual edited image path with timestamp to prevent caching
        editedImageUrl = `/Edited-image.png?t=${Date.now()}`
        
        console.log('PhotoContext: Created masked URL:', maskedUrl)
        console.log('PhotoContext: Set edited image URL:', editedImageUrl)
      }

      // Update photo
      const updatedPhoto = {
        ...currentPhoto,
        consentGiven: childrenWithConsent,
        consentPending: childrenWithoutConsent,
        status: 'approved',
        aiProcessed: childrenWithoutConsent.length > 0,
        maskedUrl: maskedUrl,
        editedImageUrl: editedImageUrl, // Add the actual edited image path
        maskingInfo: childrenWithoutConsent.length > 0 ? {
          action: 'consent_processed',
          maskedChildren: childrenWithoutConsent,
          technique: 'prototype_masking',
          appliedAt: new Date().toISOString()
        } : null
      }

      console.log('PhotoContext: Updated photo:', updatedPhoto)
      console.log('PhotoContext: Photo has editedImageUrl:', updatedPhoto.editedImageUrl)

      // Update in service
      const savedPhoto = demoPhotoService.updatePhoto(photoId, updatedPhoto)
      console.log('PhotoContext: Service returned saved photo:', savedPhoto)
      console.log('PhotoContext: Saved photo has editedImageUrl:', savedPhoto?.editedImageUrl)

      // Batch state updates to prevent multiple re-renders
      startTransition(() => {
        setPhotos(prev => {
          const newPhotos = prev.map(p => p.id === photoId ? savedPhoto : p)
          console.log('PhotoContext: Updated photos state:', newPhotos.find(p => p.id === photoId))
          return newPhotos
        })

        // Remove from pending consent
        setPendingConsent(prev => prev.filter(p => p.id !== photoId))
      })

      console.log('PhotoContext: Consent processing completed')
      return savedPhoto
    } catch (error) {
      console.error('PhotoContext: Error processing consent:', error)
      throw error
    }
  }

  // Simple consent management
  const giveConsent = (photoId, childName) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        const updatedConsentGiven = [...(photo.consentGiven || []), childName]
        const updatedConsentPending = (photo.consentPending || []).filter(name => name !== childName)
        
        return {
          ...photo,
          consentGiven: updatedConsentGiven,
          consentPending: updatedConsentPending
        }
      }
      return photo
    }))
  }

  const revokeConsent = (photoId, childName) => {
    setPhotos(prev => prev.map(photo => {
      if (photo.id === photoId) {
        const updatedConsentGiven = (photo.consentGiven || []).filter(name => name !== childName)
        const updatedConsentPending = [...(photo.consentPending || []), childName]
        
        return {
          ...photo,
          consentGiven: updatedConsentGiven,
          consentPending: updatedConsentPending
        }
      }
      return photo
    }))
  }

  // Simple photo management
  const removePhoto = (photoId) => {
    try {
      demoPhotoService.removePhoto(photoId)
      setPhotos(prev => prev.filter(p => p.id !== photoId))
      setPendingConsent(prev => prev.filter(p => p.id !== photoId))
    } catch (error) {
      console.error('PhotoContext: Error removing photo:', error)
    }
  }

  const updatePhoto = (photoId, updates) => {
    try {
      const updatedPhoto = demoPhotoService.updatePhoto(photoId, updates)
      setPhotos(prev => prev.map(p => p.id === photoId ? updatedPhoto : p))
      return updatedPhoto
    } catch (error) {
      console.error('PhotoContext: Error updating photo:', error)
      throw error
    }
  }

  // Simple publish function
  const publishPhoto = (photoId) => {
    try {
      const updatedPhoto = updatePhoto(photoId, { 
        status: 'published',
        publishedAt: new Date().toISOString()
      })
      
      // Remove from pending consent
      setPendingConsent(prev => prev.filter(p => p.id !== photoId))
      
      return updatedPhoto
    } catch (error) {
      console.error('PhotoContext: Error publishing photo:', error)
      throw error
    }
  }

  // Simple utility functions
  const getPhotosForUser = () => photos
  const canManageConsent = (photo) => photo.status === 'pending_consent'
  const userRole = 'teacher' // For prototype
  const userChildren = ['Emma', 'Lucas', 'Ava', 'Mia', 'Ethan', 'Zoe'] // For prototype

  const value = {
    photos,
    pendingConsent,
    aiProcessing,
    aiStats,
    uploadPhoto,
    processConsentAndApplyMasking,
    giveConsent,
    revokeConsent,
    removePhoto,
    updatePhoto,
    publishPhoto,
    getPhotosForUser,
    canManageConsent,
    userRole,
    userChildren
  }

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  )
}
