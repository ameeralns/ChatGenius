'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import WorkspaceCreateModal from './WorkspaceCreateModal'

export default function WorkspaceSidebar() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const handleWorkspaceCreated = () => {
    // You can add refresh logic here if needed
    setIsCreateModalOpen(false)
  }

  return (
    <div className="w-[72px] bg-gray-900 flex flex-col items-center py-4 space-y-4">
      {/* Existing workspaces list */}
      
      {/* Create Workspace Button */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="w-12 h-12 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white"
      >
        <Plus size={24} />
      </button>

      {/* Workspace Create Modal */}
      <WorkspaceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  )
} 