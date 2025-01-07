'use client'

import { useState, useEffect } from 'react'
import { Hash, Plus, Share2 } from 'lucide-react'
import Link from 'next/link'
import RootLayout from '../layouts/RootLayout'
import toast from 'react-hot-toast'
import ChannelCreateModal from './ChannelCreateModal'

interface Channel {
  id: string
  name: string
  workspaceId: string
}

interface Workspace {
  id: string
  name: string
  color: string
}

interface WorkspaceLayoutProps {
  workspaceId: string
  children: React.ReactNode
}

export default function WorkspaceLayout({ workspaceId, children }: WorkspaceLayoutProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [activeChannelId, setActiveChannelId] = useState<string>()
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false)

  const fetchWorkspace = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`)
      if (!response.ok) throw new Error('Failed to fetch workspace')
      const data = await response.json()
      setWorkspace(data)
    } catch (error) {
      console.error('Error fetching workspace:', error)
    }
  }

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels`)
      if (!response.ok) throw new Error('Failed to fetch channels')
      const data = await response.json()
      setChannels(data)
      if (!activeChannelId && data.length > 0) {
        setActiveChannelId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  useEffect(() => {
    setChannels([])
    setActiveChannelId(undefined)
    fetchWorkspace()
    fetchChannels()
  }, [workspaceId])

  const handleShare = async () => {
    try {
      setIsGeneratingLink(true)
      const response = await fetch(`/api/workspaces/${workspaceId}/invite-link`, {
        method: 'POST',
      })

      if (!response.ok) throw new Error('Failed to generate invite link')
      
      const { inviteLink } = await response.json()
      await navigator.clipboard.writeText(inviteLink)
      toast.success('Invite link copied to clipboard!')
    } catch (error) {
      console.error('Error generating invite link:', error)
      toast.error('Failed to generate invite link')
    } finally {
      setIsGeneratingLink(false)
    }
  }

  return (
    <RootLayout>
      <div className="flex h-full">
        {/* Channels Sidebar */}
        <div 
          className="w-60 flex flex-col"
          style={{ 
            backgroundColor: workspace?.color || '#1e2124',
            borderRight: `1px solid ${workspace?.color ? workspace.color + '44' : '#2f3136'}`
          }}
        >
          <div 
            className="p-4 border-b"
            style={{ borderColor: workspace?.color ? workspace.color + '44' : '#2f3136' }}
          >
            <h2 className="text-white font-semibold">Channels</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {channels.map((channel) => (
              <Link
                key={channel.id}
                href={`/workspace/${workspaceId}/channel/${channel.id}`}
                className={`flex items-center px-2 py-1 rounded group transition-colors ${
                  activeChannelId === channel.id 
                    ? 'bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <Hash size={18} className="text-gray-400 mr-2" />
                <span className="text-gray-300 group-hover:text-white">
                  {channel.name}
                </span>
              </Link>
            ))}
          </div>

          <div 
            className="border-t"
            style={{ borderColor: workspace?.color ? workspace.color + '44' : '#2f3136' }}
          >
            <button
              onClick={() => setIsCreateChannelOpen(true)}
              className="flex items-center p-4 text-gray-400 hover:text-white w-full transition-colors hover:bg-white/10"
            >
              <Plus size={20} className="mr-2" />
              <span>Add Channel</span>
            </button>

            <button
              onClick={handleShare}
              disabled={isGeneratingLink}
              className="flex items-center p-4 text-gray-400 hover:text-white w-full transition-colors hover:bg-white/10"
            >
              <Share2 size={20} className="mr-2" />
              <span>{isGeneratingLink ? 'Generating Link...' : 'Share Workspace'}</span>
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-[#36393f] overflow-hidden">
          {children}
        </div>

        <ChannelCreateModal
          workspaceId={workspaceId}
          isOpen={isCreateChannelOpen}
          onClose={() => setIsCreateChannelOpen(false)}
          onChannelCreated={() => fetchChannels()}
        />
      </div>
    </RootLayout>
  )
} 