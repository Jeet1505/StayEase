"use client"

import { useEffect, useState } from "react"
import { listingsAPI, type Listing } from "@/lib/api"
import { ListingCard } from "@/components/listings/listing-card"
import { CreateListingDialog } from "@/components/listings/create-listing-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

export default function OwnerListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
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
      router.push("/user/listings")
      return
    }
    loadListings()
  }, [isAuthenticated, user, router])

  const loadListings = async () => {
    try {
      setLoading(true)
      // Filter listings by owner
      const data = await listingsAPI.filter({ ownerId: user!.id })
      setListings(data)
    } catch (err) {
      setError("Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated || user?.role !== "owner") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <CreateListingDialog onSuccess={loadListings} />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
          <CreateListingDialog onSuccess={loadListings} />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              showOwner={false}
              actionButton={
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
