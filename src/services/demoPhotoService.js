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
    this.photos = this.loadPhotosFromStorage() || [...demoPhotos]
    this.nextId = Math.max(...this.photos.map(p => parseInt(p.id)), 0) + 1
  }

  // Load photos from localStorage
  loadPhotosFromStorage() {
    try {
      const stored = localStorage.getItem('kindrid-photos')
      if (stored) {
        const photos = JSON.parse(stored)
        console.log('DemoPhotoService: Loaded photos from localStorage:', photos.length)
        return photos
      }
    } catch (error) {
      console.error('DemoPhotoService: Error loading from localStorage:', error)
    }
    return null
  }

  // Save photos to localStorage
  savePhotosToStorage() {
    try {
      localStorage.setItem('kindrid-photos', JSON.stringify(this.photos))
      console.log('DemoPhotoService: Saved photos to localStorage:', this.photos.length)
    } catch (error) {
      console.error('DemoPhotoService: Error saving to localStorage:', error)
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
    
    // Add to the beginning of the array (most recent first)
    this.photos.unshift(photo)
    
    if (!photoData.id) {
      this.nextId++
    }
    
    // Save to localStorage
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
    console.log('DemoPhotoService: Current photos before removal:', this.photos.map(p => ({ id: p.id, title: p.title })))
    console.log('DemoPhotoService: Call stack:', new Error().stack)
    
    const index = this.photos.findIndex(photo => photo.id === id)
    if (index !== -1) {
      const removedPhoto = this.photos.splice(index, 1)[0]
      
      // Clean up blob URL if it exists
      if (removedPhoto.url && removedPhoto.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedPhoto.url)
      }
      
      // Save to localStorage
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
}

export default new DemoPhotoService()
