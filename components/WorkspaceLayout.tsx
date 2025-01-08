'use client'

import { useState, useEffect } from 'react'
import { Hash, Plus } from 'lucide-react'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  workspaceId: string
}

interface WorkspaceLayoutProps {
  workspaceId: string
  children: React.ReactNode
}

export default function WorkspaceLayout({ workspaceId, children }: WorkspaceLayoutProps) {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string>()

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/workspaces/${workspaceId}/channels`)
        if (!response.ok) throw new Error('Failed to fetch channels')
        const data = await response.json()
        setChannels(data)
        // Set first channel as active if none selected
        if (!activeChannelId && data.length > 0) {
          setActiveChannelId(data[0].id)
        }
      } catch (error) {
        console.error('Error fetching channels:', error)
      }
    }

    fetchChannels()
  }, [workspaceId])

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Channels Sidebar */}
      <div className="w-60 bg-[#1e2124] flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Channels</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/workspace/${workspaceId}/channel/${channel.id}`}
              className={`flex items-center px-2 py-1 rounded hover:bg-gray-700 group ${
                activeChannelId === channel.id ? 'bg-gray-700' : ''
              }`}
            >
              <Hash size={18} className="text-gray-400 mr-2" />
              <span className="text-gray-300 group-hover:text-white">
                {channel.name}
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => {/* Add channel creation logic */}}
          className="flex items-center p-4 hover:bg-gray-700 text-gray-400 hover:text-white"
        >
          <Plus size={20} className="mr-2" />
          <span>Add Channel</span>
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#36393f] overflow-hidden">
        {children}
      </div>
    </div>
  )
} 