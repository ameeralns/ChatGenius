'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function WorkspaceCreateModal() {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#00ff00') // Default green color
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create workspace')
      }

      const workspace = await response.json()
      router.push(`/workspace/${workspace.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert(error instanceof Error ? error.message : 'Failed to create workspace')
    }
  }

  return (
    <div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Workspace Name"
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button onClick={handleSubmit}>Create Workspace</button>
    </div>
  )
} 