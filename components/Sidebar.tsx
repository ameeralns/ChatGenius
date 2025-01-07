'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Plus, MessageSquare } from 'lucide-react'
import WorkspaceCreateModal from './WorkspaceCreateModal'

export default function Sidebar() {
  const { user } = useUser()
  const [workspaces, setWorkspaces] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleWorkspaceCreated = async () => {
    try {
      const response = await fetch('/api/workspaces')
      const data = await response.json()
      setWorkspaces(data)
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }

  return (
    <aside className="w-16 bg-[#1a1d21] text-white flex flex-col items-center py-4">
      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center relative group"
      >
        <Plus size={20} />
        <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          Add Workspace
        </div>
      </button>

      <div className="w-8 border-t border-gray-700 my-3" />

      <button
        onClick={() => {/* Add DMs logic */}}
        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center relative group mb-3"
      >
        <MessageSquare size={20} />
        <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
          Direct Messages
        </div>
      </button>

      <div className="flex flex-col items-center space-y-3 w-full">
        {workspaces.map((workspace) => (
          <Link 
            key={workspace.id} 
            href={`/workspace/${workspace.id}`}
            className="w-10 h-10 bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center justify-center relative group"
          >
            {workspace.name[0].toUpperCase()}
            <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap">
              {workspace.name}
            </div>
          </Link>
        ))}
      </div>

      <WorkspaceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </aside>
  )
}

