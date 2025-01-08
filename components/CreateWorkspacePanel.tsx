'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Palette } from 'lucide-react'

const COLOR_CATEGORIES = {
  'Warm': [
    '#FF5733', '#FF8C33', '#FFA533', '#FFB533', 
    '#FF3333', '#FF6B33', '#FF9933', '#FFC133'
  ],
  'Cool': [
    '#33A1FF', '#3357FF', '#5833FF', '#7B33FF',
    '#33D4FF', '#336BFF', '#4833FF', '#9933FF'
  ],
  'Nature': [
    '#33FF57', '#33FF99', '#33FFB5', '#33FFC1',
    '#33FF7B', '#33FFA1', '#33FFCC', '#33FFD4'
  ],
  'Vibrant': [
    '#FF33F5', '#FF33A1', '#FF337B', '#FF33D4',
    '#FF33CC', '#FF3399', '#FF3366', '#FF3333'
  ]
}

export default function CreateWorkspacePanel() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState<string>(COLOR_CATEGORIES.Warm[0])
  const [activeCategory, setActiveCategory] = useState<string>('Warm')
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          color: selectedColor,
          createDefaultChannel: true,
        }),
      })

      if (!response.ok) throw new Error('Failed to create workspace')
      
      const workspace = await response.json()
      router.push(`/dashboard/${workspace.id}`)
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
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Workspace Preview */}
        <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div 
            className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl font-bold transition-transform hover:scale-105"
            style={{ backgroundColor: selectedColor }}
          >
            {name.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <h2 className="font-semibold text-lg">{name || 'Your Workspace'}</h2>
            <p className="text-sm text-gray-500">Preview of your workspace</p>
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Choose a Color Theme
          </label>
          
          {/* Category Tabs */}
          <div className="flex space-x-2 mb-4">
            {Object.keys(COLOR_CATEGORIES).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeCategory === category 
                    ? 'bg-gray-200 text-gray-800' 
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Color Grid */}
          <div className="grid grid-cols-8 gap-2">
            {COLOR_CATEGORIES[activeCategory as keyof typeof COLOR_CATEGORIES].map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-lg transition-all hover:scale-110
                  ${selectedColor === color ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Workspace Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Workspace Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter your workspace name"
            required
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Workspace'}
          </button>
        </div>
      </form>
    </div>
  )
} 