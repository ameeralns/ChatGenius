import React from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import ChannelSidebar from '@/components/ChannelSidebar'

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <ChannelSidebar />
        <main className="flex-1 bg-[#222529]">
          {children}
        </main>
      </div>
    </div>
  )
} 