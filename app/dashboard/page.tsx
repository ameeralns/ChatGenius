'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { PlusIcon } from 'lucide-react'
import WorkspaceCreateModal from '../../components/WorkspaceCreateModal'

export default function DashboardPage() {
  const { user } = useUser()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState([])

  const refreshWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces')
      const data = await response.json()
      setWorkspaces(data)
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }

  return (
    <div className="flex-1 bg-[#222529] overflow-auto">
      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen text-white">
          <div className="flex flex-col items-center -mt-32">
            <h2 className="text-2xl font-semibold mb-4">Welcome to ChatGenius!</h2>
            <p className="text-gray-400 mb-8">Get started by creating or joining a workspace</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Workspace</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="text-white p-6">
          <h1 className="text-2xl font-semibold mb-4">Your Workspaces</h1>
          {/* Workspace content will go here */}
        </div>
      )}

      <WorkspaceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={refreshWorkspaces}
      />
    </div>
  )
} 