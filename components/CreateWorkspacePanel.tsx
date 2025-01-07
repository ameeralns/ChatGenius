'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function CreateWorkspacePanel() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed')
    const file = e.target.files?.[0]
    if (file) {
      console.log('File selected:', file.name)
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        console.log('File preview created')
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true)
    } else if (e.type === "dragleave") {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      // Upload image if selected
      let imageUrl = null
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        
        if (!uploadResponse.ok) throw new Error('Failed to upload image')
        const { url } = await uploadResponse.json()
        imageUrl = url
      }

      // Create workspace
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          imageUrl,
          createDefaultChannel: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to create workspace')
      
      const workspace = await response.json()
      
      // Generate invite link
      const inviteResponse = await fetch(`/api/workspaces/${workspace.id}/invite-link`, {
        method: 'POST',
      })
      
      if (inviteResponse.ok) {
        const { inviteLink } = await inviteResponse.json()
        setInviteLink(inviteLink)
      }

      if (!inviteLink) {
        router.push(`/dashboard/${workspace.id}`)
      }
    } catch (error) {
      console.error('Error creating workspace:', error)
      alert('Failed to create workspace. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create a New Workspace</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Workspace Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Workspace Image
          </label>
          <div className="flex items-center space-x-6">
            <div 
              className={`w-24 h-24 relative rounded-lg overflow-hidden border-2 border-dashed 
                ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} 
                ${imagePreview ? 'border-solid' : 'border-dashed'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <>
                  <Image
                    src={imagePreview}
                    alt="Workspace preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview(null)
                    }}
                    className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageSelect}
                    onClick={(e) => console.log('Input clicked')}
                  />
                </label>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">
                Upload a workspace image (optional)
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Drag and drop or click to select
              </p>
            </div>
          </div>
        </div>

        {/* Workspace Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Workspace Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter workspace name"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>

      {/* Invite Link Modal */}
      {inviteLink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Workspace Created!</h3>
            <p className="text-sm text-gray-600 mb-4">
              Share this link to invite others to your workspace:
            </p>
            <div className="flex items-center space-x-2 mb-6">
              <input
                type="text"
                value={inviteLink}
                readOnly
                className="flex-1 p-2 border rounded-md"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink)
                  alert('Link copied!')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => router.push(`/dashboard/${inviteLink.split('/').pop()}`)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Workspace
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 