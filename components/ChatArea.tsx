'use client'

import { useState } from 'react'

interface ChatAreaProps {
  workspaceId: string
  channelId: string
}

export default function ChatArea({ workspaceId, channelId }: ChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col">
      <div>Chat Area for workspace {workspaceId} and channel {channelId}</div>
    </div>
  )
} 