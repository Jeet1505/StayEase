"use client"

import { useEffect, useState } from "react"
import { listingsAPI, type Listing } from "@/lib/api"
import { ListingCard } from "@/components/listings/listing-card"
import { ListingFilters } from "@/components/listings/listing-filters"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function UserListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [filteredListings, setFilteredListings] = useState<Listing[]>([])
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
      router.push("/owner/listings")
      return
    }
    loadListings()
  }, [isAuthenticated, user, router])

  const loadListings = async () => {
    try {
      setLoading(true)
      const data = await listingsAPI.getAll()
      setListings(data)
      setFilteredListings(data)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to load listings")
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = async (filters: { location: string; availabilityStatus: string; floorNumber: string }) => {
    try {
      setLoading(true)
      const filterParams: any = {}

      if (filters.location) filterParams.location = filters.location
      if (filters.availabilityStatus && filters.availabilityStatus !== "all")
        filterParams.availabilityStatus = filters.availabilityStatus
      if (filters.floorNumber) filterParams.floorNumber = Number.parseInt(filters.floorNumber)

      const data = await listingsAPI.filter(filterParams)
      setFilteredListings(data)
    } catch (err) {
      setError("Failed to filter listings")
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFilteredListings(listings)
  }

  if (!isAuthenticated || user?.role !== "user") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Listings</h1>
        <p className="text-muted-foreground">Find your perfect rental accommodation</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <ListingFilters onFilter={handleFilter} onReset={handleReset} />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-48 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
