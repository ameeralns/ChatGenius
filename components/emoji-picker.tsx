'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef } from 'react'
import data from '@emoji-mart/data'

// Dynamically import the Picker to avoid SSR issues
const Picker = dynamic(
  () => import('@emoji-mart/react').then((mod) => mod.default),
  { ssr: false }
)

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

export function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={containerRef}
      className="absolute z-[100] bg-gray-800 rounded-lg shadow-lg"
      style={{ 
        right: '0',
        bottom: '100%',
        marginBottom: '0.5rem',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => {
          onEmojiSelect(emoji.native)
          onClose()
        }}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
        searchPosition="top"
        maxFrequentRows={1}
        navPosition="top"
      />
    </div>
  )
} 