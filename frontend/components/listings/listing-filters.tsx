"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"

interface FilterValues {
  location: string
  availabilityStatus: string
  floorNumber: string
}

interface ListingFiltersProps {
  onFilter: (filters: FilterValues) => void
  onReset: () => void
}

export function ListingFilters({ onFilter, onReset }: ListingFiltersProps) {
  const [location, setLocation] = useState("")
  const [availabilityStatus, setAvailabilityStatus] = useState("")
  const [floorNumber, setFloorNumber] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilter({ location, availabilityStatus, floorNumber })
  }

  const handleReset = () => {
    setLocation("")
    setAvailabilityStatus("")
    setFloorNumber("")
    onReset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filter Listings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Mumbai, Delhi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
              <SelectTrigger id="availability">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor Number</Label>
            <Input
              id="floor"
              type="number"
              placeholder="e.g., 5"
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
