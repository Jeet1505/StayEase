"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { listingsAPI, reviewsAPI, type Listing, type Review } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ReviewCard } from "@/components/reviews/review-card"
import { MapPin, Building2, User, Star, Calendar } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [listing, setListing] = useState<Listing | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadListingDetails()
  }, [params.id])

  const loadListingDetails = async () => {
    try {
      setLoading(true)
      const allListings = await listingsAPI.getAll()
      const foundListing = allListings.find((l) => l.id === Number.parseInt(params.id as string))

      if (foundListing) {
        setListing(foundListing)
        const reviewsData = await reviewsAPI.getByListing(foundListing.id)
        setReviews(reviewsData)
      }
    } catch (err) {
      console.error("Failed to load listing details", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-96 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
            <img
              src={listing.imageUrl || "/placeholder.svg"}
              alt={listing.title}
              className="object-cover w-full h-full"
            />
          </div>

          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>Floor {listing.floorNumber}</span>
                  </div>
                </div>
              </div>
              <Badge variant={listing.availabilityStatus === "available" ? "default" : "secondary"}>
                {listing.availabilityStatus === "available" ? "Available" : "Unavailable"}
              </Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Reviews ({reviews.length})</span>
                {averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No reviews yet</p>
              ) : (
                reviews.map((review) => <ReviewCard key={review.id} review={review} />)
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-medium">{listing.owner.fullName}</p>
                  <p className="text-sm text-muted-foreground">{listing.owner.email}</p>
                </div>
              </div>

              {isAuthenticated && user?.role === "user" && listing.availabilityStatus === "available" && (
                <Link href={`/appointments/book?listingId=${listing.id}`} className="block">
                  <Button className="w-full" size="lg">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Visit
                  </Button>
                </Link>
              )}

              {!isAuthenticated && (
                <Link href="/auth" className="block">
                  <Button className="w-full" size="lg">
                    Sign in to Schedule Visit
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
