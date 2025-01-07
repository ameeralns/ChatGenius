'use client'

import { useState, useRef, useEffect } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div ref={pickerRef} className="absolute bottom-full mb-2 z-50">
      <Picker
        data={data}
        onEmojiSelect={(emoji: any) => {
          onEmojiSelect(emoji.native)
          onClose()
        }}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
      />
    </div>
  )
} 