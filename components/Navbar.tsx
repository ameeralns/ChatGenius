'use client'

import { useState } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import ProfilePanel from './ProfilePanel'

export default function Navbar() {
  const { user } = useUser()
  const { signOut } = useClerk()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState(false)

  return (
    <>
      <nav className="bg-[#1a1d21] text-white px-4 py-2 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">ChatGenius</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 hover:bg-gray-700 rounded-md p-2"
          >
            {user?.imageUrl && (
              <Image
                src={user.imageUrl}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            )}
            <ChevronDown size={16} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1d21] rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 border-b border-gray-700">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-gray-400">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <button
                onClick={() => {
                  setIsProfilePanelOpen(true)
                  setIsProfileOpen(false)
                }}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left"
              >
                View Profile
              </button>
              <button
                onClick={() => {/* Add settings logic */}}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 w-full text-left"
              >
                Settings
              </button>
              <hr className="border-gray-700 my-1" />
              <button
                onClick={() => signOut()}
                className="block px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full text-left"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </nav>

      <ProfilePanel 
        isOpen={isProfilePanelOpen}
        onClose={() => setIsProfilePanelOpen(false)}
      />
    </>
  )
} 