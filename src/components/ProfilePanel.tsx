'use client'

import * as React from 'react'
import { useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'

export default function ProfilePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    setLoading(true)
    try {
      await user.setProfileImage({
        file: file,
      })
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile picture:', error)
      alert('Failed to update profile picture. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const triggerFileInput = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-1/3 bg-white shadow-xl z-50 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Profile</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                <Image
                  src={user?.imageUrl || '/default-avatar.png'}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div 
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 rounded-full transition-all duration-200 hover:bg-opacity-70 z-10"
              >
                <span className="text-white text-sm font-medium select-none">
                  {loading ? 'Uploading...' : 'Change Photo'}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.fullName}
              </h3>
              <p className="text-sm text-gray-500">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 