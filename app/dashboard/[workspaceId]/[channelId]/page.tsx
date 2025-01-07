'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ChatArea from '@/components/ChatArea'

export default function ChannelPage() {
  const params = useParams()
  const workspaceId = params.workspaceId as string
  const channelId = params.channelId as string

  return (
    <div className="flex-1 flex flex-col">
      <ChatArea 
        workspaceId={workspaceId}
        channelId={channelId}
      />
    </div>
  )
} 