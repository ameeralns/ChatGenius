'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Plus, MessageSquare } from 'lucide-react'
import WorkspaceCreateModal from './WorkspaceCreateModal'
import { useRouter } from 'next/navigation'

interface Workspace {
  id: string;
  name: string;
  color?: string;
}

export default function Sidebar() {
  const { user } = useUser()
  const router = useRouter()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; workspaceId: string } | null>(null)
  const [isLeaving, setIsLeaving] = useState(false)

  const fetchWorkspaces = async () => {
    try {
      const response = await fetch('/api/workspaces')
      if (!response.ok) throw new Error('Failed to fetch workspaces')
      const data = await response.json()
      const sortedWorkspaces = data.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setWorkspaces(sortedWorkspaces)
    } catch (error) {
      console.error('Error fetching workspaces:', error)
    }
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [])

  const handleWorkspaceCreated = () => {
    fetchWorkspaces()
  }

  const handleContextMenu = (e: React.MouseEvent, workspaceId: string) => {
    e.preventDefault()
    setContextMenu({
      x: e.pageX,
      y: e.pageY,
      workspaceId
    })
  }

  const handleLeaveWorkspace = async (workspaceId: string) => {
    if (isLeaving) return
    
    try {
      setIsLeaving(true)
      const response = await fetch(`/api/workspaces/${workspaceId}/leave`, {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to leave workspace')

      // Remove workspace from local state
      setWorkspaces(prev => prev.filter(w => w.id !== workspaceId))
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error leaving workspace:', error)
    } finally {
      setIsLeaving(false)
      setContextMenu(null)
    }
  }

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <aside className="w-16 bg-[#1a1d21] text-white flex flex-col items-center py-4">
      <div className="flex flex-col items-center space-y-3 w-full mb-3">
        {workspaces.map((workspace) => (
          <div key={workspace.id} className="relative group">
            <Link
              href={`/workspace/${workspace.id}`}
              onContextMenu={(e) => handleContextMenu(e, workspace.id)}
              className="w-10 h-10 rounded-lg flex items-center justify-center relative group hover:opacity-80 transition-opacity"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                style={{ backgroundColor: workspace.color || '#4B5563' }}
              >
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
                {workspace.name}
              </div>
            </Link>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsCreateModalOpen(true)}
        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center relative group"
      >
        <Plus size={20} />
        <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
          Add Workspace
        </div>
      </button>

      <div className="w-8 border-t border-gray-700 my-3" />

      <button
        onClick={() => {/* Add DMs logic */}}
        className="w-10 h-10 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center relative group"
      >
        <MessageSquare size={20} />
        <div className="absolute hidden group-hover:block left-full ml-2 bg-black text-white text-xs py-1 px-2 rounded whitespace-nowrap z-50">
          Direct Messages
        </div>
      </button>

      <WorkspaceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-[#2B2D31] rounded-md shadow-lg z-50 border border-gray-700"
          style={{
            top: contextMenu.y,
            left: contextMenu.x
          }}
        >
          <button
            onClick={() => handleLeaveWorkspace(contextMenu.workspaceId)}
            disabled={isLeaving}
            className="w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700 flex items-center disabled:opacity-50 whitespace-nowrap"
          >
            {isLeaving ? 'Leaving...' : 'Leave Workspace'}
          </button>
        </div>
      )}
    </aside>
  )
}

