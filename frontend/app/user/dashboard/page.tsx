"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  appointmentsAPI,
  reviewsAPI,
  notificationsAPI,
  type Appointment,
  type Review,
  type Notification,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { Calendar, MessageSquare, Bell, Search, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export default function UserDashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    if (user?.role !== "user") {
      router.push("/owner/dashboard")
      return
    }
    loadDashboardData()
  }, [isAuthenticated, user, router])

  // Refresh dashboard when page becomes visible (user navigates back) - debounced
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated && user?.role === "user") {
        // Debounce to avoid too many refreshes
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          loadDashboardData()
        }, 500)
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      clearTimeout(timeoutId)
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [appointmentsData, reviewsData, notificationsData] = await Promise.all([
        appointmentsAPI.getByUser(user!.id),
        reviewsAPI.getByUser(user!.id),
        notificationsAPI.getByUser(user!.id),
      ])
      setAppointments(appointmentsData)
      setReviews(reviewsData)
      setNotifications(notificationsData)
    } catch (err) {
      console.error("Failed to load dashboard data", err)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== "user") {
    return null
  }

  // Normalize status values (backend returns PENDING/ACCEPTED/REJECTED, frontend may use lowercase)
  const normalizeStatus = (status: string) => {
    if (status === "PENDING" || status === "pending") return "pending"
    if (status === "ACCEPTED" || status === "confirmed") return "confirmed"
    if (status === "REJECTED" || status === "cancelled") return "cancelled"
    return status
  }
  
  const upcomingAppointments = appointments.filter((apt) => normalizeStatus(apt.status) === "confirmed")
  const pendingAppointments = appointments.filter((apt) => normalizeStatus(apt.status) === "pending")
  const unreadNotifications = notifications.filter((n) => !n.isRead)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your rental journey</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">{upcomingAppointments.length} confirmed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews.length}</div>
                <p className="text-xs text-muted-foreground">Your feedback matters</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Notifications</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreadNotifications.length}</div>
                <p className="text-xs text-muted-foreground">Unread messages</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your confirmed property visits</CardDescription>
                  </div>
                  <Link href="/user/appointments">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                    <Link href="/user/listings">
                      <Button variant="link" size="sm" className="mt-2">
                        Browse Listings
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{apt.listing.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.appointmentDate).toLocaleDateString()} at {apt.appointmentTime}
                          </p>
                        </div>
                        <Badge variant="default">Confirmed</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>What would you like to do today?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/user/listings">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <Search className="h-6 w-6" />
                    <span>Browse Listings</span>
                  </Button>
                </Link>
                <Link href="/user/appointments">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <Calendar className="h-6 w-6" />
                    <span>My Appointments</span>
                  </Button>
                </Link>
                <Link href="/user/reviews">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <MessageSquare className="h-6 w-6" />
                    <span>My Reviews</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
