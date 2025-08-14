import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebarClient } from "@/components/app-sidebar-client"
import { SidebarGroup } from "@/components/app-sidebar"

interface SidebarLayoutProps {
  children: React.ReactNode
  sidebarConfig: SidebarGroup[]
}

export function SidebarLayout({ 
  children, 
  sidebarConfig
}: SidebarLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        {/* Sidebar - Always open */}
        <AppSidebarClient groups={sidebarConfig}/>

        {/* Main content area */}
        <main className="flex-1 p-4">
          {/* Your page content */}
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}
