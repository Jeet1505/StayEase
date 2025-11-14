"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/api"
import { MapPin, Building2 } from "lucide-react"
import Link from "next/link"

interface ListingCardProps {
  listing: Listing
  showOwner?: boolean
  actionButton?: React.ReactNode
}

export function ListingCard({ listing, showOwner = true, actionButton }: ListingCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden bg-muted">
        <img src={listing.imageUrl || "/placeholder.svg"} alt={listing.title} className="object-cover w-full h-full" />
        <Badge
          className="absolute top-3 right-3"
          variant={listing.availabilityStatus === "available" ? "default" : "secondary"}
        >
          {listing.availabilityStatus === "available" ? "Available" : "Unavailable"}
        </Badge>
      </div>

      <CardHeader>
        <CardTitle className="text-xl">{listing.title}</CardTitle>
        <CardDescription className="line-clamp-2">{listing.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{listing.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span>Floor {listing.floorNumber}</span>
        </div>
        {showOwner && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium">Owner: {listing.owner.fullName}</p>
            <p className="text-xs text-muted-foreground">{listing.owner.email}</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Link href={`/listings/${listing.id}`} className="flex-1">
          <Button variant="outline" className="w-full bg-transparent">
            View Details
          </Button>
        </Link>
        {actionButton}
      </CardFooter>
    </Card>
  )
}
