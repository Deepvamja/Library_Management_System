import { 
  Calendar, 
  Home, 
  Inbox, 
  Search, 
  Settings, 
  BookOpen,
  Users,
  Clock,
  FileText,
  Archive,
  UserCog,
  Package
} from "lucide-react"
import { SidebarGroup } from "@/components/app-sidebar"

export const adminSidebarConfig: SidebarGroup[] = [
  {
    label: "Administration",
    items: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: Home,
      },
      {
        title: "Catalog Management",
        url: "/admin/catalog",
        icon: BookOpen,
      },
      {
        title: "User Management",
        url: "/admin/users",
        icon: UserCog,
      },
      {
        title: "System Configuration",
        url: "/admin/system",
        icon: Settings,
      },
      {
        title: "Reports & Analytics",
        url: "/admin/reports",
        icon: FileText,
      },
      {
        title: "Backup & Restore",
        url: "/admin/backup",
        icon: Archive,
      },
    ]
  }
]

export const librarianSidebarConfig: SidebarGroup[] = [
  {
    label: "Library Management",
    items: [
      {
        title: "Dashboard",
        url: "/librarian",
        icon: Home,
      },
      {
        title: "Book Catalog",
        url: "/librarian/catalog",
        icon: BookOpen,
      },
      {
        title: "Member Management",
        url: "/librarian/members",
        icon: Users,
      },
      {
        title: "Circulation",
        url: "/librarian/circulation",
        icon: Clock,
      },
      {
        title: "Inventory Management",
        url: "/librarian/inventory",
        icon: Package,
      },
    ]
  }
]

// You can add more configurations for different user roles
export const studentSidebarConfig: SidebarGroup[] = [
  {
    label: "Student Portal",
    items: [
      {
        title: "Browse Books",
        url: "/student/browse",
        icon: Search,
      },
      {
        title: "My Books",
        url: "/student/my-books",
        icon: BookOpen,
      },
      {
        title: "Reservations",
        url: "/student/reservations",
        icon: Calendar,
      },
    ]
  }
]
