'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Smile, User } from 'lucide-react'
import Image from 'next/image'
import EmojiPicker from './EmojiPicker'

interface MessageProps {
  id: string
  content: string
  userId: string
  user: {
    id: string
    name: string | null
    imageUrl: string | null
  }
  createdAt: string
  reactions: {
    emoji: string
    userId: string
  }[]
  onReactionAdd: (messageId: string, emoji: string) => void
  onReactionRemove: (messageId: string, emoji: string) => void
}

export function Message({
  id,
  content,
  userId,
  user,
  createdAt,
  reactions,
  onReactionAdd,
  onReactionRemove
}: MessageProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const handleReaction = (emoji: string) => {
    const hasReacted = reactions.some(
      reaction => reaction.emoji === emoji && reaction.userId === userId
    )
    if (hasReacted) {
      onReactionRemove(id, emoji)
    } else {
      onReactionAdd(id, emoji)
    }
  }

  return (
    <div className="group relative flex items-start space-x-3 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
      {/* User Avatar */}
      <div className="flex-shrink-0">
        {user?.imageUrl ? (
          <div className="relative h-10 w-10">
            <Image
              src={user.imageUrl}
              alt={user?.name || 'User avatar'}
              fill
              className="rounded-full object-cover"
              priority
            />
          </div>
        ) : (
          <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-400" />
          </div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-white">
              {user?.name || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-400">
              {format(new Date(createdAt), 'HH:mm')}
            </span>
          </div>
          
          {/* Emoji Picker Button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-700 rounded"
          >
            <Smile className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-300 whitespace-pre-wrap break-words">
          {content}
        </p>

        {/* Reactions */}
        {reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(
              reactions.reduce((acc, reaction) => {
                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1
                return acc
              }, {} as Record<string, number>)
            ).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`px-2 py-0.5 rounded-full text-sm ${
                  reactions.some(r => r.emoji === emoji && r.userId === userId)
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'bg-gray-700/50 text-gray-300'
                } hover:bg-gray-600/50 transition-colors`}
              >
                {emoji} {count}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute left-0 bottom-full mb-2 z-50">
          <div className="bg-gray-800 rounded-lg shadow-lg p-2">
            <EmojiPicker
              onEmojiSelect={(emoji) => {
                handleReaction(emoji)
                setShowEmojiPicker(false)
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
} 