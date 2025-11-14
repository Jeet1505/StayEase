"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserNav } from "./user-nav"
import { OwnerNav } from "./owner-nav"
import { Home, LogOut, Bell } from "lucide-react"
import { useEffect, useState } from "react"
import { notificationsAPI } from "@/lib/api"

export function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated && user) {
      loadUnreadCount()
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, user])

  const loadUnreadCount = async () => {
    try {
      const notifications = await notificationsAPI.getByUser(user!.id)
      const unread = notifications.filter((n) => !n.isRead).length
      setUnreadCount(unread)
    } catch (err) {
      console.error("Failed to load unread count", err)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <Home className="h-6 w-6" />
              <span>StayEase</span>
            </Link>

            {isAuthenticated && user?.role === "user" && <UserNav />}
            {isAuthenticated && user?.role === "owner" && <OwnerNav />}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href={user?.role === "user" ? "/user/notifications" : "/owner/notifications"}
                  className="relative"
                >
                  <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user?.fullName} ({user?.role})
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
