'use client'

import { useState, useEffect } from 'react'
import { Plus, Hash, ChevronDown, Settings } from 'lucide-react'
import CreateChannelModal from './CreateChannelModal'
import { useRouter, useParams } from 'next/navigation'
import WorkspaceSettings from './WorkspaceSettings'

interface Channel {
  id: string
  name: string
  description?: string
}

export default function ChannelSidebar() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.workspaceId as string
  
  const [channels, setChannels] = useState<Channel[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  useEffect(() => {
    fetchChannels()
  }, [workspaceId])

  const fetchChannels = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/channels`)
      const data = await response.json()
      setChannels(data)
      
      // Select first channel by default
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0].id)
        router.push(`/dashboard/${workspaceId}/${data[0].id}`)
      }
    } catch (error) {
      console.error('Error fetching channels:', error)
    }
  }

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId)
    router.push(`/dashboard/${workspaceId}/${channelId}`)
  }

  return (
    <>
      <div className="w-60 bg-gray-800 text-gray-300 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-700 rounded">
            <span className="font-semibold">Workspace Name</span>
            <ChevronDown size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <button
                className="flex items-center text-gray-400 hover:text-gray-200"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <ChevronDown size={18} />
                <span className="ml-1 text-sm font-medium">Channels</span>
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-1">
              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelSelect(channel.id)}
                  className={`w-full flex items-center px-2 py-1 rounded text-sm hover:bg-gray-700 ${
                    selectedChannel === channel.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <Hash size={18} className="mr-2" />
                  <span>{channel.name.replace('#', '')}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-full flex items-center px-2 py-1 hover:bg-gray-700 rounded"
          >
            <Settings size={18} className="mr-2" />
            <span className="text-sm">Workspace Settings</span>
          </button>
        </div>
      </div>

      <CreateChannelModal
        workspaceId={workspaceId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onChannelCreated={fetchChannels}
      />

      <WorkspaceSettings
        workspaceId={workspaceId}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  )
} 