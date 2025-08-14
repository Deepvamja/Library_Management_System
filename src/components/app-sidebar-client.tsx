
import { AppSidebar, SidebarGroup } from "./app-sidebar"

interface AppSidebarClientProps {
  groups: SidebarGroup[]
}

export function AppSidebarClient({ groups }: AppSidebarClientProps) {
  
  return <AppSidebar groups={groups} />
}
