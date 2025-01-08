'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { UserButton as ClerkUserButton } from '@clerk/nextjs'
import { Settings, ChevronLeft, LogOut, User } from 'lucide-react'
import { useClerk } from '@clerk/nextjs'

export default function UserButton() {
  const router = useRouter()
  const params = useParams()
  const { signOut } = useClerk()
  const [isLeaving, setIsLeaving] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleLeaveWorkspace = async () => {
    if (!params.workspaceId || isLeaving) return
    
    try {
      setIsLeaving(true)
      const response = await fetch(`/api/workspaces/${params.workspaceId}/leave`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to leave workspace')

      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error leaving workspace:', error)
    } finally {
      setIsLeaving(false)
      setShowDropdown(false)
      setShowSettings(false)
    }
  }

  const handleSignOut = () => {
    signOut(() => router.push('/'))
  }

  return (
    <div className="relative">
      <div 
        onClick={() => setShowDropdown(!showDropdown)} 
        className="cursor-pointer"
      >
        <ClerkUserButton
          appearance={{
            elements: {
              userButtonBox: "w-10 h-10",
              userButtonTrigger: "w-full h-full",
              userButtonPopoverCard: "hidden",
            }
          }}
        />
      </div>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-[#2B2D31] rounded-md shadow-lg z-50 border border-gray-700">
          {!showSettings ? (
            // Main Menu
            <div className="py-2">
              <button
                onClick={() => router.push('/user-profile')}
                className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <User className="w-4 h-4 mr-2" />
                View Profile
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={handleSignOut}
                className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          ) : (
            // Settings Menu
            <div className="py-2">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <div className="border-t border-gray-700 my-1" />
              {params.workspaceId && (
                <button
                  onClick={handleLeaveWorkspace}
                  disabled={isLeaving}
                  className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center disabled:opacity-50"
                >
                  {isLeaving ? 'Leaving...' : 'Leave Workspace'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 