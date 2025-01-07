import React from 'react'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Sidebar from '../../components/Sidebar'
import MessageList from '../../components/MessageList'
import MessageInput from '../../components/MessageInput'

export default async function ChatPage() {
  const { userId } = auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <MessageList channelId="default-channel" />
        <MessageInput channelId="default-channel" />
      </main>
    </div>
  )
} 