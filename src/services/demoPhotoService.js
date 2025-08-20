// Demo photo service with realistic school photos using actual image files
const demoPhotos = [
  {
    id: '1',
    url: '/1.jpg', // Use actual image file
    title: 'First Day of School',
    description: 'Class 3A on their first day back to school',
    date: '2024-09-01',
    location: 'Classroom 3A',
    teacher: 'Ms. Johnson',
    children: ['Emma', 'Lucas', 'Sophia', 'Noah', 'Ava'],
    status: 'approved',
    aiProcessed: true,
    consentGiven: ['Emma', 'Lucas', 'Sophia', 'Noah', 'Ava'],
    consentPending: [],
    tags: ['first-day', 'classroom', 'elementary']
  },
  {
    id: '2',
    url: '/2.jpeg', // Use actual image file (corrected extension)
    title: 'Science Fair Winners',
    description: 'Students presenting their science projects',
    date: '2024-09-15',
    location: 'School Gymnasium',
    teacher: 'Mr. Davis',
    children: ['Lucas', 'Ava', 'Mia', 'Ethan', 'Zoe'],
    status: 'pending_consent',
    aiProcessed: true,
    consentGiven: ['Lucas', 'Ava'],
    consentPending: ['Mia', 'Ethan', 'Zoe'],
    tags: ['science', 'fair', 'projects']
  },
  {
    id: '3',
    url: '/3.jpg', // Use actual image file
    title: 'Art Class Creativity',
    description: 'Students working on their art projects',
    date: '2024-09-20',
    location: 'Art Room',
    teacher: 'Mrs. Wilson',
    children: ['Sophia', 'Noah', 'Mia', 'Ethan', 'Emma'],
    status: 'ai_processing',
    aiProcessed: false,
    consentGiven: [],
    consentPending: ['Sophia', 'Noah', 'Mia', 'Ethan', 'Emma'],
    tags: ['art', 'creativity', 'projects']
  },
  {
    id: '4',
    url: '/4.jpg', // Use actual image file
    title: 'Recess Fun',
    description: 'Children playing during recess',
    date: '2024-09-25',
    location: 'Playground',
    teacher: 'Ms. Thompson',
    children: ['Ava', 'Zoe', 'Lucas', 'Sophia', 'Noah'],
    status: 'approved',
    aiProcessed: true,
    consentGiven: ['Ava', 'Zoe', 'Lucas', 'Sophia', 'Noah'],
    consentPending: [],
    tags: ['recess', 'playground', 'fun']
  },
  {
    id: '5',
    url: '/5.jpg', // Use actual image file
    title: 'Library Reading Time',
    description: 'Students enjoying story time in the library',
    date: '2024-09-30',
    location: 'School Library',
    teacher: 'Mrs. Brown',
    children: ['Emma', 'Mia', 'Ethan', 'Ava', 'Lucas'],
    status: 'pending_consent',
    aiProcessed: true,
    consentGiven: ['Emma', 'Mia'],
    consentPending: ['Ethan', 'Ava', 'Lucas'],
    tags: ['library', 'reading', 'story-time']
  },
  {
    id: '6',
    url: '/6.jpg', // Use actual image file
    title: 'Math Class',
    description: 'Students working on math problems',
    date: '2024-10-05',
    location: 'Math Lab',
    teacher: 'Mr. Rodriguez',
    children: ['Sophia', 'Noah', 'Mia', 'Ethan', 'Emma', 'Ava'],
    status: 'pending_consent',
    aiProcessed: true,
    consentGiven: ['Sophia', 'Noah'],
    consentPending: ['Mia', 'Ethan', 'Emma', 'Ava'],
    tags: ['math', 'learning', 'classroom']
  }
]

class DemoPhotoService {
  constructor() {
    // Load photos from localStorage if available, otherwise use demo photos
    const storedPhotos = this.loadPhotosFromStorage()
    if (storedPhotos) {
      this.photos = storedPhotos
      console.log('DemoPhotoService: Loaded stored photos:', this.photos.length)
    } else {
      this.photos = [...demoPhotos]
      console.log('DemoPhotoService: Using demo photos:', this.photos.length)
    }
    this.nextId = Math.max(...this.photos.map(p => parseInt(p.id)), 0) + 1
  }

  // Load photos from localStorage (metadata only)
  loadPhotosFromStorage() {
    try {
      const stored = localStorage.getItem('kindrid-photos')
      if (stored) {
        const photos = JSON.parse(stored)
        console.log('DemoPhotoService: Loaded photo metadata from localStorage:', photos.length)
        return photos
      }
    } catch (error) {
      console.error('DemoPhotoService: Error loading from localStorage:', error)
    }
    
    // Try to load essential data as fallback
    try {
      const essentialStored = localStorage.getItem('kindrid-photos-essential')
      if (essentialStored) {
        const essentialPhotos = JSON.parse(essentialStored)
        console.log('DemoPhotoService: Loaded essential metadata as fallback:', essentialPhotos.length)
        return essentialPhotos
      }
    } catch (fallbackError) {
      console.error('DemoPhotoService: Error loading essential data:', fallbackError)
    }
    
    return null
  }

  // Save photos to localStorage (metadata only, not full image data)
  savePhotosToStorage() {
    try {
      // Create a copy of photos with image data removed to save space
      const photosForStorage = this.photos.map(photo => {
        const { url, currentDisplayUrl, maskedUrl, ...metadata } = photo
        return {
          ...metadata,
          // Store only a reference to the image, not the full data
          hasImageData: !!url,
          imageType: url ? 'base64' : 'none'
        }
      })
      
      localStorage.setItem('kindrid-photos', JSON.stringify(photosForStorage))
      console.log('DemoPhotoService: Saved photo metadata to localStorage:', photosForStorage.length)
    } catch (error) {
      console.error('DemoPhotoService: Error saving to localStorage:', error)
      // If localStorage fails, try to save just the essential metadata
      try {
        const essentialData = this.photos.map(photo => ({
          id: photo.id,
          title: photo.title,
          description: photo.description,
          children: photo.children,
          status: photo.status,
          consentGiven: photo.consentGiven,
          consentPending: photo.consentPending,
          date: photo.date,
          location: photo.location,
          teacher: photo.teacher,
          uploadedAt: photo.uploadedAt
        }))
        localStorage.setItem('kindrid-photos-essential', JSON.stringify(essentialData))
        console.log('DemoPhotoService: Saved essential metadata as fallback')
      } catch (fallbackError) {
        console.error('DemoPhotoService: Failed to save even essential data:', fallbackError)
      }
    }
  }

  getAllPhotos() {
    return [...this.photos]
  }

  getPhotoById(id) {
    return this.photos.find(photo => photo.id === id)
  }

  addPhoto(photoData) {
    console.log('DemoPhotoService: Adding photo:', photoData)
    
    // Use the provided ID if it exists, otherwise generate one
    const photo = {
      ...photoData,
      id: photoData.id || this.nextId.toString()
    }
    
    // Store the actual image data in sessionStorage for this session
    if (photo.url && photo.url.startsWith('data:')) {
      this.storeImageInSession(photo.id, photo.url)
    }
    
    // Add to the beginning of the array (most recent first)
    this.photos.unshift(photo)
    
    if (!photoData.id) {
      this.nextId++
    }
    
    // Save metadata to localStorage (without image data)
    this.savePhotosToStorage()
    
    console.log('DemoPhotoService: Photo added successfully. Total photos:', this.photos.length)
    console.log('DemoPhotoService: First photo:', this.photos[0])
    
    return photo
  }

  updatePhoto(id, updates) {
    console.log('DemoPhotoService: Updating photo:', id, 'with:', updates)
    
    const index = this.photos.findIndex(photo => photo.id === id)
    if (index !== -1) {
      this.photos[index] = { ...this.photos[index], ...updates }
      
      // Save to localStorage
      this.savePhotosToStorage()
      
      console.log('DemoPhotoService: Photo updated successfully')
      return this.photos[index]
    }
    
    console.log('DemoPhotoService: Photo not found for update:', id)
    return null
  }

  removePhoto(id) {
    console.log('DemoPhotoService: Removing photo:', id)
    console.log('DemoPhotoService: Current photos before removal:', this.photos.map(p => ({ id: p.id, title: p.title, status: p.status, uploadedAt: p.uploadedAt })))
    console.log('DemoPhotoService: Call stack:', new Error().stack)
    
    // PROTECTION: Don't remove photos that were just uploaded
    const photoToRemove = this.photos.find(p => p.id === id)
    if (photoToRemove && photoToRemove.status === 'pending_consent') {
      console.warn('DemoPhotoService: WARNING - Attempting to remove photo with pending consent status!')
      console.warn('DemoPhotoService: This might be an accidental removal. Photo details:', {
        id: photoToRemove.id,
        title: photoToRemove.title,
        status: photoToRemove.status,
        uploadedAt: photoToRemove.uploadedAt
      })
      
      // Only allow removal if it's been more than 5 seconds since upload
      if (photoToRemove.uploadedAt) {
        const uploadTime = new Date(photoToRemove.uploadedAt).getTime()
        const currentTime = Date.now()
        const timeSinceUpload = currentTime - uploadTime
        
        if (timeSinceUpload < 5000) { // Less than 5 seconds
          console.error('DemoPhotoService: BLOCKED - Photo was uploaded too recently to remove safely')
          console.error('DemoPhotoService: Time since upload:', timeSinceUpload, 'ms')
          return null
        }
      }
    }
    
    const index = this.photos.findIndex(photo => photo.id === id)
    if (index !== -1) {
      const removedPhoto = this.photos.splice(index, 1)[0]
      
      // Clean up blob URL if it exists
      if (removedPhoto.url && removedPhoto.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedPhoto.url)
      }
      
      // Clean up sessionStorage
      this.removeImageFromSession(removedPhoto.id)
      
      // Save metadata to localStorage
      this.savePhotosToStorage()
      
      console.log('DemoPhotoService: Photo removed successfully. Total photos:', this.photos.length)
      console.log('DemoPhotoService: Removed photo details:', { id: removedPhoto.id, title: removedPhoto.title })
      return removedPhoto
    }
    
    console.log('DemoPhotoService: Photo not found for removal:', id)
    return null
  }

  updatePhotoConsent(photoId, childName, action) {
    console.log('DemoPhotoService: Updating consent for photo:', photoId, 'child:', childName, 'action:', action)
    
    const photo = this.getPhotoById(photoId)
    if (!photo) {
      console.log('DemoPhotoService: Photo not found for consent update:', photoId)
      return null
    }

    if (action === 'give') {
      photo.consentGiven = [...photo.consentGiven, childName]
      photo.consentPending = photo.consentPending.filter(child => child !== childName)
    } else if (action === 'revoke') {
      photo.consentGiven = photo.consentGiven.filter(child => child !== childName)
      if (!photo.consentPending.includes(childName)) {
        photo.consentPending = [...photo.consentPending, childName]
      }
    }

    // Save to localStorage
    this.savePhotosToStorage()
    
    console.log('DemoPhotoService: Consent updated successfully')
    return photo
  }

  getPhotosByStatus(status) {
    return this.photos.filter(photo => photo.status === status)
  }

  getPhotosByChild(childName) {
    return this.photos.filter(photo => photo.children.includes(childName))
  }

  searchPhotos(query) {
    const lowercaseQuery = query.toLowerCase()
    return this.photos.filter(photo =>
      photo.title.toLowerCase().includes(lowercaseQuery) ||
      photo.description.toLowerCase().includes(lowercaseQuery) ||
      photo.location.toLowerCase().includes(lowercaseQuery) ||
      photo.children.some(child => child.toLowerCase().includes(lowercaseQuery))
    )
  }

  getConsentStats() {
    const totalPhotos = this.photos.length
    const totalChildren = this.photos.reduce((sum, photo) => sum + photo.children.length, 0)
    const totalConsentGiven = this.photos.reduce((sum, photo) => sum + photo.consentGiven.length, 0)
    const totalPendingConsent = this.photos.reduce((sum, photo) => sum + photo.consentPending.length, 0)

    return {
      totalPhotos,
      totalChildren,
      totalConsentGiven,
      totalPendingConsent,
      consentRate: totalChildren > 0 ? (totalConsentGiven / totalChildren * 100).toFixed(1) : 0
    }
  }

  getPhotoAnalytics() {
    const statusCounts = this.photos.reduce((acc, photo) => {
      acc[photo.status] = (acc[photo.status] || 0) + 1
      return acc
    }, {})

    const monthlyCounts = this.photos.reduce((acc, photo) => {
      const month = photo.date.substring(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return {
      statusCounts,
      monthlyCounts,
      totalPhotos: this.photos.length,
      averageChildrenPerPhoto: this.photos.length > 0 
        ? (this.photos.reduce((sum, photo) => sum + photo.children.length, 0) / this.photos.length).toFixed(1)
        : 0
    }
  }

  getAIStats() {
    const total = this.photos.length
    const processed = this.photos.filter(p => p.aiProcessed).length
    const processing = this.photos.filter(p => p.status === 'ai_processing').length
    const failed = this.photos.filter(p => p.status === 'ai_failed').length

    return {
      total,
      processed,
      processing,
      failed,
      successRate: total > 0 ? ((processed / total) * 100).toFixed(1) : 0
    }
  }

  // Store image data in sessionStorage for current session
  storeImageInSession(photoId, imageData) {
    try {
      const key = `kindrid-image-${photoId}`
      sessionStorage.setItem(key, imageData)
      console.log('DemoPhotoService: Stored image in sessionStorage for photo:', photoId)
      return true
    } catch (error) {
      console.error('DemoPhotoService: Error storing image in sessionStorage:', error)
      return false
    }
  }

  // Retrieve image data from sessionStorage
  getImageFromSession(photoId) {
    try {
      const key = `kindrid-image-${photoId}`
      const imageData = sessionStorage.getItem(key)
      if (imageData) {
        console.log('DemoPhotoService: Retrieved image from sessionStorage for photo:', photoId)
        return imageData
      }
      return null
    } catch (error) {
      console.error('DemoPhotoService: Error retrieving image from sessionStorage:', error)
      return null
    }
  }

  // Clean up sessionStorage when photo is removed
  removeImageFromSession(photoId) {
    try {
      const key = `kindrid-image-${photoId}`
      sessionStorage.removeItem(key)
      console.log('DemoPhotoService: Removed image from sessionStorage for photo:', photoId)
    } catch (error) {
      console.error('DemoPhotoService: Error removing image from sessionStorage:', error)
    }
  }

  // Get photo with image data restored from sessionStorage if needed
  getPhotoWithImage(photoId) {
    const photo = this.getPhotoById(photoId)
    if (!photo) return null
    
    // If photo doesn't have image data but should, try to restore from sessionStorage
    if (!photo.url && photo.hasImageData) {
      const imageData = this.getImageFromSession(photoId)
      if (imageData) {
        photo.url = imageData
        console.log('DemoPhotoService: Restored image data for photo:', photoId)
      }
    }
    
    return photo
  }

  // Get all photos with images restored from sessionStorage
  getAllPhotosWithImages() {
    return this.photos.map(photo => {
      if (!photo.url && photo.hasImageData) {
        const imageData = this.getImageFromSession(photo.id)
        if (imageData) {
          return { ...photo, url: imageData }
        }
      }
      return photo
    })
  }
}

export default new DemoPhotoService()
