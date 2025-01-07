'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'

export default function InvitePage({
  params
}: {
  params: { workspaceId: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isLoaded } = useUser()
  const [status, setStatus] = useState<'loading' | 'accepting' | 'error' | 'success'>('loading')
  const email = searchParams.get('email')

  useEffect(() => {
    const verifyInvite = async () => {
      try {
        const response = await fetch(`/api/workspaces/${params.workspaceId}/invites/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          throw new Error('Invalid invite')
        }

        setStatus('success')
      } catch (error) {
        console.error('Error verifying invite:', error)
        setStatus('error')
      }
    }

    if (isLoaded && user && email) {
      verifyInvite()
    }
  }, [isLoaded, user, email, params.workspaceId])

  const handleAcceptInvite = async () => {
    setStatus('accepting')
    try {
      const response = await fetch(`/api/workspaces/${params.workspaceId}/invites/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error('Failed to accept invite')
      }

      router.push(`/dashboard/${params.workspaceId}`)
    } catch (error) {
      console.error('Error accepting invite:', error)
      setStatus('error')
    }
  }

  if (!isLoaded || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying invite...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid Invite</h1>
          <p className="mt-2 text-gray-600">This invite link is invalid or has expired.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Join Workspace</h1>
        <p className="text-gray-600 mb-6">
          You've been invited to join this workspace.
        </p>
        <button
          onClick={handleAcceptInvite}
          disabled={status === 'accepting'}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {status === 'accepting' ? 'Joining...' : 'Accept Invite'}
        </button>
      </div>
    </div>
  )
} 