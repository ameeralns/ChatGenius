'use client'

import React from 'react'
import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'

interface MessageInputProps {
  channelId: string;
}

export default function MessageInput({ channelId }: MessageInputProps) {
  const { user } = useUser()
  const [message, setMessage] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      return data.fileUrl
    } catch (error) {
      console.error('Failed to upload file:', error)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() && !fileInputRef.current?.files?.length) return

    try {
      let fileUrl
      if (fileInputRef.current?.files?.length) {
        fileUrl = await uploadFile(fileInputRef.current.files[0])
      }

      await fetch(`/api/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          fileUrl,
        }),
      })

      setMessage('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border rounded"
          disabled={isUploading}
        />
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={() => {}} // Handle file selection if needed
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-gray-200 rounded"
          disabled={isUploading}
        >
          📎
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={isUploading}
        >
          Send
        </button>
      </div>
    </form>
  )
}

