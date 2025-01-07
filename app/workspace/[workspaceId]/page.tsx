'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function WorkspacePage() {
  const params = useParams()
  const router = useRouter()

  useEffect(() => {
    // Redirect to the general channel
    router.replace(`/workspace/${params.workspaceId}/channel/general`)
  }, [params.workspaceId, router])

  return null // No need to render anything as we're redirecting
} 