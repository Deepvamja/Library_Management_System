import { SidebarLayout } from "@/components/sidebar-layout"
import { adminSidebarConfig } from "@/config/sidebar-config"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout sidebarConfig={adminSidebarConfig}>
      {children}
    </SidebarLayout>
  )
}
