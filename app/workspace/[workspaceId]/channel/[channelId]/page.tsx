'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Hash, Send, Smile } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { format } from 'date-fns'
import { pusherClient } from '@/lib/pusher'
import { EmojiPicker } from '@/components/emoji-picker'

interface Reaction {
  id: string
  emoji: string
  userId: string
  user: {
    id: string
    imageUrl: string | null
  }
}

interface Message {
  id: string
  content: string
  userId: string
  createdAt: string
  user: {
    id: string
    name: string | null
    imageUrl: string | null
  }
  reactions: Reaction[]
}

export default function ChannelPage() {
  const params = useParams()
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [messageIdForReaction, setMessageIdForReaction] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/workspaces/${params.workspaceId}/channels/${params.channelId}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
      scrollToBottom()
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Initial fetch and Pusher setup
  useEffect(() => {
    fetchMessages()

    // Subscribe to Pusher channel
    const channel = pusherClient.subscribe(`channel-${params.channelId}`)
    
    channel.bind('new-message', (message: Message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, message]
      })
      scrollToBottom()
    })

    return () => {
      channel.unbind('new-message')
      pusherClient.unsubscribe(`channel-${params.channelId}`)
    }
  }, [params.channelId])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isLoading || !user) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${params.workspaceId}/channels/${params.channelId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setNewMessage('')
      
      setMessages(prev => [...prev, {
        ...data,
        reactions: [],
        user: {
          id: user.id,
          name: user.fullName || user.username || 'Unknown User',
          imageUrl: user.imageUrl,
        }
      }])
    } catch (error) {
      console.error('Detailed error:', error)
      alert(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add reaction')
      }

      setMessages(prev => prev.map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            reactions: [...(message.reactions || []), data]
          }
        }
        return message
      }))
    } catch (error) {
      console.error('Detailed error adding reaction:', error)
      if (error instanceof Error && error.message !== 'You have already added this reaction') {
        alert(error.message || 'Failed to add reaction')
      }
    } finally {
      setMessageIdForReaction(null)
    }
  }

  const handleRemoveReaction = async (messageId: string, emoji: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove reaction')
      }

      setMessages(messages.map(message => {
        if (message.id === messageId) {
          return {
            ...message,
            reactions: message.reactions.filter(r => 
              !(r.userId === user?.id && r.emoji === emoji)
            )
          }
        }
        return message
      }))
    } catch (error) {
      console.error('Error removing reaction:', error)
      alert(error instanceof Error ? error.message : 'Failed to remove reaction')
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#313338]">
      <div className="h-12 border-b border-gray-700 flex items-center px-4">
        <div className="flex items-center text-gray-400">
          <Hash size={20} className="mr-2" />
          <span className="font-medium text-white">
            {params.channelId}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="group hover:bg-gray-700/50 px-4 py-1 -mx-4 relative">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                    {message.user?.imageUrl ? (
                      <img
                        src={message.user.imageUrl}
                        alt={message.user.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-500 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {message.user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline">
                    <span className="text-white font-medium mr-2">
                      {message.user?.name || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {format(new Date(message.createdAt), 'HH:mm')}
                    </span>
                  </div>
                  <p className="text-gray-100 mt-1">{message.content}</p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {message.reactions?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(
                          (message.reactions || []).reduce((acc, reaction) => {
                            acc[reaction.emoji] = (acc[reaction.emoji] || []).concat(reaction)
                            return acc
                          }, {} as Record<string, Reaction[]>)
                        ).map(([emoji, reactions]) => (
                          <button
                            key={emoji}
                            onClick={() => {
                              const hasReacted = reactions.some(r => r.userId === user?.id)
                              if (hasReacted) {
                                handleRemoveReaction(message.id, emoji)
                              } else {
                                handleAddReaction(message.id, emoji)
                              }
                            }}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-sm ${
                              reactions.some(r => r.userId === user?.id)
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-700/50 hover:bg-gray-700'
                            }`}
                          >
                            <span>{emoji}</span>
                            <span className="text-xs">{reactions.length}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMessageIdForReaction(prev => prev === message.id ? null : message.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white transition-all duration-200 ease-in-out hover:scale-110 p-1 rounded hover:bg-gray-700"
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {messageIdForReaction === message.id && (
                <div className="absolute z-[100]" style={{ right: '0', bottom: '100%' }}>
                  <EmojiPicker
                    onEmojiSelect={(emoji: string) => {
                      handleAddReaction(message.id, emoji)
                    }}
                    onClose={() => setMessageIdForReaction(null)}
                  />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !newMessage.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  )
} 