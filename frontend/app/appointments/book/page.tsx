"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { appointmentsAPI, listingsAPI, type Listing } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { Calendar, Clock, MapPin } from "lucide-react"

export default function BookAppointmentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const listingId = searchParams.get("listingId")

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    if (user?.role !== "user") {
      router.push("/")
      return
    }
    if (!listingId) {
      router.push("/user/listings")
      return
    }
    loadListing()
  }, [isAuthenticated, user, listingId, router])

  const loadListing = async () => {
    try {
      const allListings = await listingsAPI.getAll()
      const foundListing = allListings.find((l) => l.id === Number.parseInt(listingId!))
      if (foundListing) {
        setListing(foundListing)
      } else {
        setError("Listing not found")
      }
    } catch (err) {
      setError("Failed to load listing")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Combine date and time into ISO string for backend
      const isoDateTime = formData.appointmentDate && formData.appointmentTime
        ? `${formData.appointmentDate}T${formData.appointmentTime}:00`
        : ""
      await appointmentsAPI.create({
        userId: user!.id,
        listingId: Number.parseInt(listingId!),
        appointmentTime: isoDateTime,
  // status: "pending", // removed as not expected by backend DTO
      })
      setSuccess(true)
      setTimeout(() => {
        router.push("/user/appointments")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to book appointment")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== "user" || !listing) {
    return null
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">
            Appointment booked successfully! Redirecting to your appointments...
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Book Appointment</h1>
        <p className="text-muted-foreground">Schedule a visit to view the property</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{listing.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {listing.location}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
              <img
                src={listing.imageUrl || "/placeholder.svg"}
                alt={listing.title}
                className="object-cover w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Preferred Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Preferred Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any specific requirements or questions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Booking..." : "Confirm Booking"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
