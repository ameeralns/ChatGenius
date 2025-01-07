import React from 'react'
import Link from 'next/link'

interface Workspace {
  id: string
  name: string
  description?: string
}

interface WorkspaceCarouselProps {
  workspaces: Workspace[]
}

export default function WorkspaceCarousel({ workspaces }: WorkspaceCarouselProps) {
  return (
    <div className="flex space-x-6 overflow-x-auto pb-4">
      {workspaces.map((workspace) => (
        <Link 
          key={workspace.id}
          href={`/workspace/${workspace.id}`}
          className="flex-shrink-0 w-72 bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
        >
          <h3 className="text-xl font-semibold mb-2">{workspace.name}</h3>
          {workspace.description && (
            <p className="text-gray-600">{workspace.description}</p>
          )}
        </Link>
      ))}
    </div>
  )
} 