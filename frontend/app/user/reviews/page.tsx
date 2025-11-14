"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { reviewsAPI, appointmentsAPI, type Review, type Appointment } from "@/lib/api"
import { ReviewCard } from "@/components/reviews/review-card"
import { ReviewFormDialog } from "@/components/reviews/review-form-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { MessageSquare } from "lucide-react"

export default function UserReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [eligibleListings, setEligibleListings] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
      return
    }
    if (user?.role !== "user") {
      router.push("/")
      return
    }
    loadData()
  }, [isAuthenticated, user, router])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [userReviews, userAppointments] = await Promise.all([
        reviewsAPI.getByUser(user!.id),
        appointmentsAPI.getByUser(user!.id),
      ])

      setReviews(userReviews || [])

      // Find confirmed appointments that don't have reviews yet
      const normalizeStatus = (status: string) => {
        if (status === "PENDING" || status === "pending") return "pending"
        if (status === "ACCEPTED" || status === "confirmed") return "confirmed"
        if (status === "REJECTED" || status === "cancelled") return "cancelled"
        return status
      }
      
      const reviewedListingIds = new Set((userReviews || []).map((r) => r.listingId))
      const eligible = (userAppointments || []).filter(
        (apt) => normalizeStatus(apt.status) === "confirmed" && apt.listing && !reviewedListingIds.has(apt.listing.id),
      )
      setEligibleListings(eligible)
    } catch (err) {
      console.error("Failed to load reviews:", err)
      setError(err instanceof Error ? err.message : "Failed to load reviews")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== "user") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
        <p className="text-muted-foreground">Manage your property reviews</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {eligibleListings.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Properties You Can Review</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eligibleListings.map((apt) => (
                  <Card key={apt.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{apt.listing.title}</CardTitle>
                      <CardDescription>{apt.listing.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ReviewFormDialog
                        listingId={apt.listing.id}
                        listingTitle={apt.listing.title}
                        onSuccess={loadData}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Your Reviews ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't written any reviews yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Reviews can be written after confirmed property visits
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id}>
                    {review.listing && (
                      <p className="text-sm font-medium mb-2">{review.listing.title}</p>
                    )}
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
