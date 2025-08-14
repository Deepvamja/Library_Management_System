import { SidebarLayout } from "@/components/sidebar-layout"
import { librarianSidebarConfig } from "@/config/sidebar-config"

export default function LibrarianLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarLayout sidebarConfig={librarianSidebarConfig}>
      {children}
    </SidebarLayout>
  )
}
