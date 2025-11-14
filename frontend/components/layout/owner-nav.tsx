"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Building2, Calendar, Bell } from "lucide-react"

const ownerNavItems = [
  {
    title: "Dashboard",
    href: "/owner/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Listings",
    href: "/owner/listings",
    icon: Building2,
  },
  {
    title: "Appointments",
    href: "/owner/appointments",
    icon: Calendar,
  },
  {
    title: "Notifications",
    href: "/owner/notifications",
    icon: Bell,
  },
]

export function OwnerNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {ownerNavItems.map((item) => {
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
