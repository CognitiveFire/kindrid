import React, { useState, useRef } from 'react'
import { usePhotos } from '../contexts/PhotoContext'
import { X, Upload, Camera, Users, MapPin, Calendar, Tag, Eye } from 'lucide-react'

const PhotoUpload = ({ onClose }) => {
  const { uploadPhoto, userRole, startFaceLearning } = usePhotos()
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
  const [isTagging, setIsTagging] = useState(false)
  const [childTags, setChildTags] = useState([])
  const [currentTag, setCurrentTag] = useState('')
  const [imagePreview, setImagePreview] = useState(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('File selected: ' + file.name)
      
      // Create image preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target.result)
      reader.readAsDataURL(file)
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

  const startTagging = () => {
    if (childrenNames.length === 0) {
      setUploadStatus('Please add children names first')
      return
    }
    setIsTagging(true)
    setUploadStatus('Tagging mode active! Select a child name below, then click on their face in the image.')
  }

  const handleImageClick = (e) => {
    if (!isTagging || !currentTag) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100

    const newTag = {
      id: Date.now() + Math.random(),
      child: currentTag,
      x,
      y
    }

    setChildTags(prev => [...prev, newTag])
    setUploadStatus(`✅ Successfully tagged ${currentTag} at (${Math.round(x)}, ${Math.round(y)})`)
    setTimeout(() => { setUploadStatus('') }, 3000)
  }

  const removeChildTag = (tagId) => {
    setChildTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const handleFaceLearning = async () => {
    if (childTags.length === 0) {
      setUploadStatus('Please tag children in the image first')
      return
    }
    
    setUploadStatus('Starting AI face learning...')
    try {
      await startFaceLearning(childTags)
      setUploadStatus('✅ Face learning initiated! AI is learning facial patterns.')
    } catch (error) {
      setUploadStatus('Face learning failed: ' + error.message)
    }
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
        children: childrenNames,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        childTags: childTags,
        faceLearningData: childTags.length > 0 ? {
          taggedChildren: childTags,
          timestamp: new Date().toISOString()
        } : null
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
        <div className="bg-white rounded-xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only teachers can upload photos.</p>
          <button
            onClick={onClose}
            className="w-full btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    Click to select a photo or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, JPEG up to 10MB
                  </p>
                </label>
              </div>
              {selectedFile && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ {selectedFile.name} selected
                </p>
              )}
            </div>

            {/* Image Preview and Tagging */}
            {imagePreview && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Image Preview</h3>
                  <button
                    type="button"
                    onClick={startTagging}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isTagging 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isTagging ? 'Tagging Active' : 'Start Tagging Children'}
                  </button>
                </div>
                
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    onClick={handleImageClick}
                    className={`max-w-full h-auto border-2 rounded transition-all ${
                      isTagging 
                        ? 'border-blue-400 cursor-crosshair shadow-lg' 
                        : 'border-gray-200 cursor-default'
                    }`}
                  />
                  
                  {/* Child Tags Overlay */}
                  {childTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="absolute w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${tag.x}%`,
                        top: `${tag.y}%`
                      }}
                    />
                  ))}
                </div>

                {/* Tagging Instructions */}
                {isTagging && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium text-blue-900">Child Tagging Mode</h4>
                    </div>
                    <p className="text-sm text-blue-800 mb-3">
                      <strong>Step 1:</strong> Select a child name below<br/>
                      <strong>Step 2:</strong> Click on their face in the image<br/>
                      <strong>Step 3:</strong> Repeat for other children
                    </p>
                    
                    {/* Child Selection Buttons */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {childrenNames.map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setCurrentTag(name)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            currentTag === name
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                    
                    {currentTag && (
                      <p className="text-sm text-blue-700 mt-3 font-medium">
                        ✓ Selected: <span className="font-bold">{currentTag}</span> - Now click on their face in the image above
                      </p>
                    )}
                  </div>
                )}

                {/* Tagging Progress and Summary */}
                {childrenNames.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Tagging Progress</span>
                        <span className="text-sm text-gray-600">{childTags.length} of {childrenNames.length} children tagged</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(childTags.length / childrenNames.length) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {childTags.length === childrenNames.length 
                          ? '✅ All children tagged! Ready to upload.' 
                          : 'Continue tagging children to improve AI accuracy'
                        }
                      </p>
                    </div>
                    
                    {childTags.length > 0 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                          ✅ Tagged Children ({childTags.length}):
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {childTags.map((tag) => (
                            <span
                              key={tag.id}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800"
                            >
                              {tag.child} at ({Math.round(tag.x)}, {Math.round(tag.y)})
                              <button
                                type="button"
                                onClick={() => removeChildTag(tag.id)}
                                className="ml-2 text-green-600 hover:text-green-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Face Learning Button */}
                {childTags.length > 0 && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleFaceLearning}
                      className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      🧠 Start AI Face Learning
                    </button>
                    <div className="text-xs text-gray-600 mt-1">
                      💡 <strong>Tip:</strong> Upload 3+ photos with the same children for best AI learning
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="e.g., Science Fair 2024"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher
                </label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children in Photo
                </label>
                <input
                  type="text"
                  name="children"
                  value={formData.children}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="e.g., Emma, Lucas, Sarah"
                  required
                />
                {childrenNames.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {childrenNames.map((name, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-kindrid-100 text-kindrid-800"
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
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="e.g., Classroom 3B, Gymnasium"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="Describe the photo or event..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kindrid-500 focus:border-transparent"
                  placeholder="e.g., science, fair, group, activity"
                />
              </div>
            </div>

            {/* Upload Status */}
            {uploadStatus && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">{uploadStatus}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PhotoUpload
