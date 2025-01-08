'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Message } from '@/components/message'
import { Send } from 'lucide-react'

interface MessageType {
  id: string
  content: string
  userId: string
  createdAt: string
  user: {
    id: string
    name: string | null
    imageUrl: string | null
  }
  reactions: {
    emoji: string
    userId: string
  }[]
}

export default function ChannelPage({ 
  params 
}: { 
  params: { workspaceId: string; channelId: string } 
}) {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { userId } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading) return

    setIsLoading(true)
    try {
      console.log('Sending message:', newMessage.trim()) // Debug log

      const response = await fetch(
        `/api/workspaces/${params.workspaceId}/channels/${params.channelId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      )

      const data = await response.json()
      console.log('Response data:', data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      // Clear input first
      setNewMessage('')
      
      // Update messages state with new message
      setMessages(prevMessages => {
        console.log('Previous messages:', prevMessages) // Debug log
        const newMessages = [...prevMessages, data]
        console.log('New messages:', newMessages) // Debug log
        return newMessages
      })

      // Scroll after a short delay to ensure DOM update
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/workspaces/${params.workspaceId}/channels/${params.channelId}/messages`
      )
      const data = await response.json()
      console.log('Fetched messages with user data:', data) // Debug log

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch messages')
      }

      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Fetch messages on mount and channel change
  useEffect(() => {
    // Reset messages when changing channels
    setMessages([])
    
    fetchMessages()
    scrollToBottom()
    
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [params.channelId]) // Add workspaceId if needed

  // Scroll when messages update
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleReactionAdd = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })

      if (!response.ok) throw new Error('Failed to add reaction')
      fetchMessages()
    } catch (error) {
      console.error('Error adding reaction:', error)
    }
  }

  const handleReactionRemove = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })

      if (!response.ok) throw new Error('Failed to remove reaction')
      fetchMessages()
    } catch (error) {
      console.error('Error removing reaction:', error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-gray-400 text-center">No messages yet</div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              {...message}
              onReactionAdd={handleReactionAdd}
              onReactionRemove={handleReactionRemove}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form 
        onSubmit={handleSendMessage} 
        className="p-4 border-t border-gray-800 bg-gray-900"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : <Send size={20} />}
          </button>
        </div>
      </form>
    </div>
  )
} 