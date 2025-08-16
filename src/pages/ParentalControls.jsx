import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePhotos } from '../contexts/PhotoContext'
import { 
  Shield, 
  Users, 
  Lock, 
  Eye, 
  EyeOff, 
  Download, 
  Share2, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Bell,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  UserCheck,
  UserX
} from 'lucide-react'

const ParentalControls = () => {
  const { user } = useAuth()
  const { photos, pendingConsent } = usePhotos()
  const [activeTab, setActiveTab] = useState('consent')
  const [selectedChild, setSelectedChild] = useState(user?.children?.[0]?.id || null)

  const tabs = [
    { id: 'consent', name: 'Consent Management', icon: UserCheck },
    { id: 'privacy', name: 'Privacy Settings', icon: Lock },
    { id: 'access', name: 'Access Controls', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell }
  ]

  const getChildPhotos = (childName) => {
    return photos.filter(photo => photo.children.includes(childName))
  }

  const getConsentStats = (childName) => {
    const childPhotos = getChildPhotos(childName)
    const approved = childPhotos.filter(p => p.consentGiven.includes(childName)).length
    const pending = childPhotos.filter(p => p.consentPending.includes(childName)).length
    const total = childPhotos.length
    
    return { approved, pending, total }
  }

  const ConsentManagement = () => (
    <div className="space-y-6">
      {/* Child Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {user?.children?.map((child) => {
            const stats = getConsentStats(child.name)
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChild(child.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedChild === child.id
                    ? 'border-kindrid-500 bg-kindrid-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{child.name}</h4>
                  <span className="text-sm text-gray-500">{child.grade}</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-green-600">{stats.approved} approved</span>
                  <span className="text-yellow-600">{stats.pending} pending</span>
                  <span className="text-gray-500">{stats.total} total</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Consent Overview */}
      {selectedChild && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Consent Overview for {user?.children?.find(c => c.id === selectedChild)?.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {(() => {
              const child = user?.children?.find(c => c.id === selectedChild)
              const stats = getConsentStats(child?.name)
              return (
                <>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                    <div className="text-sm text-green-700">Approved Photos</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-sm text-yellow-700">Pending Consent</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-blue-700">Total Photos</div>
                  </div>
                </>
              )
            })()}
          </div>

          {/* Pending Consent Photos */}
          {(() => {
            const child = user?.children?.find(c => c.id === selectedChild)
            const pendingPhotos = photos.filter(p => 
              p.consentPending.includes(child?.name) && p.status === 'pending_consent'
            )
            
            if (pendingPhotos.length === 0) {
              return (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-500">No photos pending consent for {child?.name}</p>
                </div>
              )
            }

            return (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Photos Requiring Consent</h4>
                <div className="space-y-3">
                  {pendingPhotos.map((photo) => (
                    <div key={photo.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Eye className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{photo.title}</h5>
                          <p className="text-sm text-gray-600">{photo.date} • {photo.location}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200">
                          Approve
                        </button>
                        <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                          Deny
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )

  const PrivacySettings = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-approve photos from teachers</h4>
              <p className="text-sm text-gray-600">Automatically approve photos from trusted teachers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Allow group photo sharing</h4>
              <p className="text-sm text-gray-600">Allow your child to appear in group photos shared with other families</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Enable AI identity masking</h4>
              <p className="text-sm text-gray-600">Use ClassVault™ to automatically mask identities in group photos</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Retention</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo retention period
            </label>
            <select className="input-field">
              <option>Keep indefinitely</option>
              <option>Delete after 1 year</option>
              <option>Delete after 2 years</option>
              <option>Delete after 5 years</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Auto-delete denied photos</h4>
              <p className="text-sm text-gray-600">Automatically remove photos you've denied consent for</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const AccessControls = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Access</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Monitor className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">Desktop - Chrome</h4>
                <p className="text-sm text-gray-600">Last accessed: 2 hours ago</p>
              </div>
            </div>
            <span className="text-green-600 text-sm font-medium">Active</span>
          </div>
          
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-900">Mobile - Safari</h4>
                <p className="text-sm text-gray-600">Last accessed: 1 day ago</p>
              </div>
            </div>
            <span className="text-gray-600 text-sm">Inactive</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing Permissions</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Allow photo downloads</h4>
              <p className="text-sm text-gray-600">Let approved users download photos of your child</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Allow social sharing</h4>
              <p className="text-sm text-gray-600">Allow photos to be shared on social media platforms</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Time-limited sharing</h4>
              <p className="text-sm text-gray-600">Automatically expire shared photos after 30 days</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const Notifications = () => (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">New photo uploads</h4>
              <p className="text-sm text-gray-600">Get notified when new photos of your child are uploaded</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Consent requests</h4>
              <p className="text-sm text-gray-600">Immediate notifications for photos requiring consent</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Weekly summaries</h4>
              <p className="text-sm text-gray-600">Receive weekly summaries of photo activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Methods</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Email notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Push notifications</h4>
              <p className="text-sm text-gray-600">Receive push notifications on mobile devices</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">SMS alerts</h4>
              <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-kindrid-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-kindrid-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'consent':
        return <ConsentManagement />
      case 'privacy':
        return <PrivacySettings />
      case 'access':
        return <AccessControls />
      case 'notifications':
        return <Notifications />
      default:
        return <ConsentManagement />
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Parental Controls</h1>
        <p className="text-gray-600">
          Manage consent, privacy settings, and access controls for your children's photos
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-kindrid-500 text-kindrid-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  )
}

export default ParentalControls
