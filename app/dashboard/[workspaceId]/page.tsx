'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import ChannelSidebar from '@/components/ChannelSidebar'
import ChatArea from '@/components/ChatArea'

export default function WorkspacePage() {
  const params = useParams()
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  return (
    <div className="flex h-screen">
      {/* Main Sidebar is rendered at the layout level */}
      
      {/* Channel Sidebar */}
      <ChannelSidebar 
        workspaceId={params.workspaceId as string}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
      />

      {/* Chat Area */}
      <ChatArea 
        workspaceId={params.workspaceId as string}
        channelId={selectedChannel}
      />
    </div>
  )
} 