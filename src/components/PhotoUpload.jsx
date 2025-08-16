import React, { useState } from 'react'
import { usePhotos } from '../contexts/PhotoContext'
import { X, Upload, Camera, Users, MapPin, Calendar, Tag } from 'lucide-react'

const PhotoUpload = ({ onClose }) => {
  const { uploadPhoto, userRole } = usePhotos()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    teacher: '',
    children: '',
    tags: ''
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [childrenNames, setChildrenNames] = useState([])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('File selected: ' + file.name)
    }
  }

  const handleChildrenInput = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, children: value }))
    
    // Parse comma-separated names and update childrenNames array
    if (value) {
      const names = value.split(',').map(name => name.trim()).filter(name => name.length > 0)
      setChildrenNames(names)
    } else {
      setChildrenNames([])
    }
  }

  const removeChildName = (indexToRemove) => {
    const newNames = childrenNames.filter((_, index) => index !== indexToRemove)
    setChildrenNames(newNames)
    setFormData(prev => ({ ...prev, children: newNames.join(', ') }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedFile) {
      setUploadStatus('Please select a file')
      return
    }

    if (childrenNames.length === 0) {
      setUploadStatus('Please add at least one child name')
      return
    }

    setIsUploading(true)
    setUploadStatus('Uploading...')

    try {
      const metadata = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        teacher: formData.teacher,
        children: childrenNames, // Use the parsed array
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      const result = await uploadPhoto(selectedFile, metadata)
      
      if (result) {
        setUploadStatus('Upload successful! Photo is being processed by AI...')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setUploadStatus('Upload failed. Please try again.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('Upload failed: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Special handling for children input
    if (name === 'children') {
      handleChildrenInput(e)
    }
  }

  if (userRole !== 'teacher') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h3>
          <p className="text-gray-600 mb-6">Only teachers can upload photos.</p>
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Upload Photo</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div>
              <label className="form-label">Photo File</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-kindrid-400 transition-colors">
                <div className="space-y-1 text-center">
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Camera className="w-8 h-8 text-kindrid-600" />
                      <span className="text-sm text-gray-600">{selectedFile.name}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-kindrid-600 hover:text-kindrid-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-kindrid-500">
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileSelect}
                            required
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Photo Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="form-label">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., First Day of School"
                  required
                />
              </div>

              <div>
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Classroom 3A"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="input-field"
                rows={3}
                placeholder="Describe the photo content..."
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
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="e.g., Ms. Johnson"
                  required
                />
              </div>

              <div>
                <label htmlFor="date" className="form-label">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date || new Date().toISOString().split('T')[0]}
                  onChange={handleInputChange}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Children Names */}
            <div>
              <label htmlFor="children" className="form-label">
                <Users className="w-4 h-4 inline mr-2" />
                Children in Photo
              </label>
              <input
                type="text"
                id="children"
                name="children"
                value={formData.children}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter names separated by commas (e.g., Emma, Lucas, Sophia)"
                required
              />
              
              {/* Display children names as tags */}
              {childrenNames.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Children added:</p>
                  <div className="flex flex-wrap gap-2">
                    {childrenNames.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-kindrid-100 text-kindrid-800"
                      >
                        {name}
                        <button
                          type="button"
                          onClick={() => removeChildName(index)}
                          className="ml-2 text-kindrid-600 hover:text-kindrid-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="tags" className="form-label">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter tags separated by commas (e.g., first-day, classroom, fun)"
              />
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className={`p-3 rounded-lg ${
                uploadStatus.includes('successful') 
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : uploadStatus.includes('failed') || uploadStatus.includes('Please')
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-blue-50 text-blue-800 border border-blue-200'
              }`}>
                <p className="text-sm">{uploadStatus}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isUploading || !selectedFile || childrenNames.length === 0}
              >
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PhotoUpload
