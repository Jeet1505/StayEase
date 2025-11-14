"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  listingsAPI,
  appointmentsAPI,
  reviewsAPI,
  notificationsAPI,
  type Listing,
  type Appointment,
  type Review,
  type Notification,
} from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { Building2, Calendar, MessageSquare, Bell, AlertCircle, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export default function OwnerDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
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
    if (user?.role !== "owner") {
      router.push("/user/dashboard")
      return
    }
    loadDashboardData()
  }, [isAuthenticated, user, router])

  // Refresh dashboard when page becomes visible (user navigates back) - debounced
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isAuthenticated && user?.role === "owner") {
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
      const [listingsData, appointmentsData, notificationsData] = await Promise.all([
        listingsAPI.filter({ ownerId: user!.id }),
        appointmentsAPI.getByOwner(user!.id),
        notificationsAPI.getByUser(user!.id),
      ])

      setListings(listingsData)
      setAppointments(appointmentsData)
      setNotifications(notificationsData)

      // Get all reviews for owner's listings - optimized with parallel requests
      const reviewPromises = listingsData.map((listing) => reviewsAPI.getByListing(listing.id))
      const reviewResults = await Promise.all(reviewPromises)
      const allReviews: Review[] = reviewResults.flat()
      setReviews(allReviews)
    } catch (err) {
      console.error("Failed to load dashboard data", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: number, status: "confirmed" | "cancelled") => {
    try {
      await appointmentsAPI.updateStatus(id, status)
      // Reload dashboard data to get updated status from backend
      await loadDashboardData()
    } catch (err) {
      console.error("Failed to update appointment status", err)
    }
  }

  if (!isAuthenticated || user?.role !== "owner") {
    return null
  }

  // Normalize status values (backend returns PENDING/ACCEPTED/REJECTED, frontend may use lowercase)
  const normalizeStatus = (status: string) => {
    if (status === "PENDING" || status === "pending") return "pending"
    if (status === "ACCEPTED" || status === "confirmed") return "confirmed"
    if (status === "REJECTED" || status === "cancelled") return "cancelled"
    return status
  }
  
  const pendingAppointments = appointments.filter((apt) => normalizeStatus(apt.status) === "pending")
  const confirmedAppointments = appointments.filter((apt) => normalizeStatus(apt.status) === "confirmed")
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user.fullName}!</h1>
        <p className="text-muted-foreground">Manage your properties and appointments</p>
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
                <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{listings.length}</div>
                <p className="text-xs text-muted-foreground">
                  {listings.filter((l) => l.availabilityStatus === "available").length} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">Awaiting your response</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviews.length}</div>
                <p className="text-xs text-muted-foreground">
                  {averageRating > 0 ? `${averageRating.toFixed(1)} avg rating` : "No ratings yet"}
                </p>
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
                    <CardTitle>Pending Appointment Requests</CardTitle>
                    <CardDescription>Review and respond to visit requests</CardDescription>
                  </div>
                  <Link href="/owner/appointments">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.slice(0, 3).map((apt) => (
                      <div key={apt.id} className="p-3 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{apt.listing?.title || "Property"}</p>
                            <p className="text-sm text-muted-foreground">
                              {apt.appointmentTime ? (
                                <>
                                  {new Date(apt.appointmentTime).toLocaleDateString()} at{" "}
                                  {new Date(apt.appointmentTime).toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </>
                              ) : (
                                "Date TBD"
                              )}
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleStatusChange(apt.id, "confirmed")} className="flex-1">
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(apt.id, "cancelled")}
                            className="flex-1"
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Properties</CardTitle>
                    <CardDescription>Quick overview of your listings</CardDescription>
                  </div>
                  <Link href="/owner/listings">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {listings.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-3">No listings yet</p>
                    <Link href="/owner/listings">
                      <Button size="sm">Create Listing</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {listings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={listing.imageUrl || "/placeholder.svg"}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{listing.title}</p>
                          <p className="text-sm text-muted-foreground">{listing.location}</p>
                        </div>
                        <Badge variant={listing.availabilityStatus === "available" ? "default" : "secondary"}>
                          {listing.availabilityStatus}
                        </Badge>
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
              <CardDescription>Manage your rental business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/owner/listings">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <Building2 className="h-6 w-6" />
                    <span>Manage Listings</span>
                  </Button>
                </Link>
                <Link href="/owner/appointments">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <Calendar className="h-6 w-6" />
                    <span>View Appointments</span>
                  </Button>
                </Link>
                <Link href="/owner/notifications">
                  <Button variant="outline" className="w-full h-auto py-6 flex flex-col gap-2 bg-transparent">
                    <Bell className="h-6 w-6" />
                    <span>Notifications</span>
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
