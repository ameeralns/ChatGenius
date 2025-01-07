'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Channel } from '@prisma/client'

export default function WorkspacePage() {
  const params = useParams()
  const [channels, setChannels] = useState<Channel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`/api/workspaces/${params.workspaceId}/channels`)
        const data = await response.json()
        setChannels(data)
      } catch (error) {
        console.error('Error fetching channels:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchChannels()
  }, [params.workspaceId])

  return (
    <div className="flex h-full">
      {/* Channel Sidebar */}
      <div className="w-60 bg-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-white font-semibold">Channels</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="text-gray-400">Loading channels...</div>
          ) : (
            <ul className="space-y-1">
              {channels.map((channel) => (
                <li key={channel.id}>
                  <button className="w-full text-left px-2 py-1 text-gray-300 hover:bg-gray-700 rounded">
                    # {channel.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-700">
        {/* Chat header */}
        <div className="h-14 border-b border-gray-600 px-4 flex items-center">
          <h3 className="text-white font-semibold">Select a channel</h3>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Messages will go here */}
        </div>

        {/* Message input */}
        <div className="p-4 border-t border-gray-600">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full px-4 py-2 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
} 