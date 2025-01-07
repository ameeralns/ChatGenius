'use client'

import { X, Camera } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

interface ProfilePanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function ProfilePanel({ isOpen, onClose }: ProfilePanelProps) {
  const { user } = useUser()

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-[#1a1d21] text-white shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold">Profile</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                      {user?.firstName?.[0]}
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-gray-700 p-2 rounded-full hover:bg-gray-600">
                  <Camera size={16} />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={user?.fullName || ''}
                  readOnly
                  className="w-full bg-gray-700 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input
                  type="email"
                  value={user?.primaryEmailAddress?.emailAddress || ''}
                  readOnly
                  className="w-full bg-gray-700 rounded-md px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 