'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import EmojiPicker from './EmojiPicker'

interface Message {
  id: string;
  content: string;
  channel_id: string;
  user_id: string;
  created_at: Date;
  file_url?: string;
}

interface MessageWithReactions extends Message {
  reactions: { [emoji: string]: string[] }  // emoji -> array of userIds
}

const wsClient = {
  connect: () => {},
  on: (event: string, callback: (data: any) => void) => {},
  send: (type: string, data: any) => {}
};

export default function MessageList({ channelId }: { channelId: string }) {
  const { user } = useUser()
  const [messages, setMessages] = useState<MessageWithReactions[]>([])
  const [emojiPickerState, setEmojiPickerState] = useState<{
    isOpen: boolean;
    messageId: string | null;
  }>({ isOpen: false, messageId: null })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    wsClient.connect();
    
    wsClient.on('new_message', (data) => {
      if (data.channelId === channelId) {
        setMessages(prev => [...prev, data.message]);
        scrollToBottom();
      }
    });

    wsClient.on('new_reaction', (data) => {
      if (data.channelId === channelId) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, reactions: { ...msg.reactions, ...data.reaction } }
            : msg
        ));
      }
    });

    return () => {
      // Cleanup WebSocket connection if needed
    };
  }, [channelId]);

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await fetch(`/api/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <div key={message.id} className="mb-4 group">
          <div className="flex items-start">
            <div className="flex-1">
              {/* Message content */}
              <div className={`p-2 rounded-lg ${
                message.user_id === user?.id
                  ? 'bg-blue-500 text-white ml-auto'
                  : 'bg-gray-200'
              }`}>
                {message.content}
              </div>
              
              {/* Reactions */}
              {Object.entries(message.reactions).length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {Object.entries(message.reactions).map(([emoji, users]) => (
                    <div
                      key={emoji}
                      className="bg-gray-100 rounded px-2 py-1 text-sm"
                      title={`${users.length} reactions`}
                    >
                      {emoji} {users.length}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reaction button */}
            <button
              onClick={() => setEmojiPickerState({
                isOpen: true,
                messageId: message.id
              })}
              className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-100 rounded"
            >
              😀
            </button>

            {/* Emoji picker */}
            {emojiPickerState.isOpen && emojiPickerState.messageId === message.id && (
              <EmojiPicker
                isOpen={true}
                onClose={() => setEmojiPickerState({ isOpen: false, messageId: null })}
                onEmojiSelect={(emoji) => {
                  handleReaction(message.id, emoji);
                  setEmojiPickerState({ isOpen: false, messageId: null });
                }}
              />
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

