'use client'

import { useState, useEffect } from 'react'
import { X, Users, Mail, Settings as SettingsIcon, UserPlus, Trash2 } from 'lucide-react'
import Image from 'next/image'

interface Member {
  id: string
  role: 'ADMIN' | 'MEMBER'
  user: {
    id: string
    firstName: string
    lastName: string
    imageUrl: string
    email: string
  }
}

interface Invite {
  id: string
  email: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
}

interface WorkspaceSettingsProps {
  workspaceId: string
  isOpen: boolean
  onClose: () => void
}

export default function WorkspaceSettings({
  workspaceId,
  isOpen,
  onClose
}: WorkspaceSettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'invites'>('general')
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [loading, setLoading] = useState(false)
  const [newInviteEmail, setNewInviteEmail] = useState('')
  const [workspaceName, setWorkspaceName] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchMembers()
      fetchInvites()
      fetchWorkspaceDetails()
    }
  }, [isOpen, workspaceId])

  const fetchMembers = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`)
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const fetchInvites = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`)
      const data = await response.json()
      setInvites(data)
    } catch (error) {
      console.error('Error fetching invites:', error)
    }
  }

  const fetchWorkspaceDetails = async () => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`)
      const data = await response.json()
      setWorkspaceName(data.name)
    } catch (error) {
      console.error('Error fetching workspace details:', error)
    }
  }

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInviteEmail.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: newInviteEmail,
        }),
      })

      if (!response.ok) throw new Error('Failed to send invite')

      setNewInviteEmail('')
      fetchInvites()
    } catch (error) {
      console.error('Error sending invite:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove member')

      fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
    }
  }

  const handleCancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/invites/${inviteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to cancel invite')

      fetchInvites()
    } catch (error) {
      console.error('Error canceling invite:', error)
    }
  }

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspaceName.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: workspaceName,
        }),
      })

      if (!response.ok) throw new Error('Failed to update workspace')
    } catch (error) {
      console.error('Error updating workspace:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="w-[480px] bg-white h-full shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Workspace Settings</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-48 border-r bg-gray-50">
              <nav className="p-4 space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'general' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <SettingsIcon size={18} />
                  <span>General</span>
                </button>
                <button
                  onClick={() => setActiveTab('members')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'members' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Users size={18} />
                  <span>Members</span>
                </button>
                <button
                  onClick={() => setActiveTab('invites')}
                  className={`w-full flex items-center space-x-2 px-3 py-2 rounded-md ${
                    activeTab === 'invites' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                  }`}
                >
                  <Mail size={18} />
                  <span>Invites</span>
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Workspace Settings</h3>
                  <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'members' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Workspace Members</h3>
                    <button
                      onClick={() => setActiveTab('invites')}
                      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                    >
                      <UserPlus size={18} />
                      <span>Invite</span>
                    </button>
                  </div>
                  <div className="space-y-4">
                    {members.map((member) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={member.user.imageUrl}
                            alt={`${member.user.firstName} ${member.user.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                          <div>
                            <div className="font-medium">
                              {member.user.firstName} {member.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{member.user.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">{member.role}</span>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'invites' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Invite Members</h3>
                  <form onSubmit={handleInviteMember} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={newInviteEmail}
                        onChange={(e) => setNewInviteEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter email address"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {loading ? 'Sending...' : 'Send Invite'}
                    </button>
                  </form>

                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Pending Invites</h4>
                    <div className="space-y-4">
                      {invites.map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{invite.email}</div>
                            <div className="text-sm text-gray-500">
                              Invited {new Date(invite.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                          <button
                            onClick={() => handleCancelInvite(invite.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 