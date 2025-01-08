'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function CreateWorkspaceButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'New Workspace' }),
      })

      const workspace = await response.json()
      if (!response.ok) throw new Error()
      
      router.push(`/workspace/${workspace.id}`)
    } catch (error) {
      alert('Failed to create workspace')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCreate} disabled={loading}>
      {loading ? 'Creating...' : 'Create Workspace'}
    </Button>
  )
} 