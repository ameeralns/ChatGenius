'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function WorkspacePage({ params }: { params: { workspaceId: string } }) {
  const router = useRouter()

  useEffect(() => {
    const redirectToGeneral = async () => {
      try {
        // First ensure general channel exists
        const response = await fetch(`/api/workspaces/${params.workspaceId}/channels/general`)
        if (!response.ok) throw new Error('Failed to get general channel')
        
        const channel = await response.json()
        if (channel?.id) {
          router.push(`/workspace/${params.workspaceId}/channel/${channel.id}`)
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    redirectToGeneral()
  }, [params.workspaceId, router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
    </div>
  )
} 