"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Search, Calendar, MessageSquare, Bell } from "lucide-react"

const userNavItems = [
  {
    title: "Dashboard",
    href: "/user/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Browse Listings",
    href: "/user/listings",
    icon: Search,
  },
  {
    title: "Appointments",
    href: "/user/appointments",
    icon: Calendar,
  },
  {
    title: "Reviews",
    href: "/user/reviews",
    icon: MessageSquare,
  },
  {
    title: "Notifications",
    href: "/user/notifications",
    icon: Bell,
  },
]

export function UserNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {userNavItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden md:inline">{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
