"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { notificationsAPI, type Notification } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Bell, Check, Trash2 } from "lucide-react"

export default function OwnerNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    if (user?.role !== "owner") {
      router.push("/")
      return
    }
    loadNotifications()
  }, [isAuthenticated, user, router])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      const data = await notificationsAPI.getByUser(user!.id)
      setNotifications(data)
    } catch (err) {
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      setError("Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
      await Promise.all(unreadIds.map((id) => notificationsAPI.markAsRead(id)))
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })))
    } catch (err) {
      setError("Failed to mark all as read")
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await notificationsAPI.delete(id)
      setNotifications(notifications.filter((n) => n.id !== id))
    } catch (err) {
      setError("Failed to delete notification")
    }
  }

  if (!isAuthenticated || user?.role !== "owner") {
    return null
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <Check className="h-4 w-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
          <p className="text-muted-foreground">We'll notify you when something important happens</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={!notification.isRead ? "border-primary/50 bg-accent/30" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      !notification.isRead ? "bg-primary/20" : "bg-muted"
                    }`}
                  >
                    <Bell className={`h-5 w-5 ${!notification.isRead ? "text-primary" : "text-muted-foreground"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <p className={`text-sm leading-relaxed ${!notification.isRead ? "font-medium" : ""}`}>
                        {notification.message}
                      </p>
                      {!notification.isRead && <Badge variant="default">New</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {!notification.isRead && (
                      <Button size="sm" variant="ghost" onClick={() => handleMarkAsRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
