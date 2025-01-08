'use client'

import { useState, useEffect } from 'react'
import { useParams, usePathname } from 'next/navigation'
import { Hash, Plus, X } from 'lucide-react'
import Link from 'next/link'

interface Channel {
  id: string
  name: string
  workspaceId: string
}

export default function ChannelSidebar() {
  const params = useParams()
  const pathname = usePathname()
  const [channels, setChannels] = useState<Channel[]>([
    // Initialize with general channel
    {
      id: 'general',
      name: 'general',
      workspaceId: params.workspaceId as string
    }
  ])
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch channels
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/workspaces/${params.workspaceId}/channels`)
        if (!response.ok) throw new Error('Failed to fetch channels')
        const data = await response.json()
        
        // Ensure general channel is always first and present
        const hasGeneral = data.some((channel: Channel) => channel.name === 'general')
        const sortedChannels = data.sort((a: Channel, b: Channel) => {
          if (a.name === 'general') return -1
          if (b.name === 'general') return 1
          return a.name.localeCompare(b.name)
        })

        if (!hasGeneral) {
          sortedChannels.unshift({
            id: 'general',
            name: 'general',
            workspaceId: params.workspaceId as string
          })
        }
        
        setChannels(sortedChannels)
      } catch (error) {
        console.error('Error fetching channels:', error)
      }
    }

    if (params.workspaceId) {
      fetchChannels()
    }
  }, [params.workspaceId])

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChannelName.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/workspaces/${params.workspaceId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to create channel')
      }

      const newChannel = await response.json()
      setChannels(prev => {
        const updated = [...prev, newChannel]
        return updated.sort((a, b) => {
          if (a.name === 'general') return -1
          if (b.name === 'general') return 1
          return a.name.localeCompare(b.name)
        })
      })
      setNewChannelName('')
      setShowCreateChannel(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create channel')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-60 bg-[#1a1d21] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold truncate">Channels</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <ul className="space-y-1">
            {channels.map(channel => {
              const isActive = pathname === `/workspace/${params.workspaceId}/channel/${channel.id}`
              return (
                <li key={channel.id}>
                  <Link
                    href={`/workspace/${params.workspaceId}/channel/${channel.id}`}
                    className={`flex items-center rounded px-2 py-1 ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Hash size={16} className="mr-2" />
                    <span className="truncate">{channel.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Create Channel Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={() => setShowCreateChannel(true)}
          className="w-full flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md px-4 py-2 transition-colors"
        >
          <Plus size={18} />
          <span>Create Channel</span>
        </button>
      </div>

      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#222529] border border-gray-700 rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Create Channel</h3>
              <button
                onClick={() => {
                  setShowCreateChannel(false)
                  setError('')
                  setNewChannelName('')
                }}
                className="text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateChannel} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Channel Name
                </label>
                <div className="flex items-center bg-gray-700 rounded-md px-3">
                  <Hash size={16} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    className="bg-transparent text-white w-full py-2 focus:outline-none"
                    placeholder="new-channel"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Lowercase letters, numbers, and hyphens only
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateChannel(false)
                    setError('')
                    setNewChannelName('')
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !newChannelName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Channel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 