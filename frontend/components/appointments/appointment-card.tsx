"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Appointment } from "@/lib/api"
import { appointmentsAPI } from "@/lib/api"
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Download, User } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface AppointmentCardProps {
  appointment: Appointment
  onStatusChange?: (id: number, status: "confirmed" | "cancelled") => void
  showActions?: boolean
}

export function AppointmentCard({ appointment, onStatusChange, showActions = false }: AppointmentCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  // Parse appointmentTime (LocalDateTime from backend) or appointmentDate/appointmentTime
  let formattedDate = ""
  let formattedTime = ""
  
  if (appointment.appointmentTime) {
    // Backend returns LocalDateTime as ISO string or "YYYY-MM-DDTHH:MM:SS" format
    try {
      const dateTime = new Date(appointment.appointmentTime)
      if (!isNaN(dateTime.getTime())) {
        formattedDate = dateTime.toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        formattedTime = dateTime.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      } else if (appointment.appointmentDate) {
        // Fallback to separate date/time fields
        formattedDate = new Date(appointment.appointmentDate).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        const [hours, minutes] = appointment.appointmentTime.split(":")
        const timeDate = new Date()
        timeDate.setHours(Number.parseInt(hours || "0"), Number.parseInt(minutes || "0"))
        formattedTime = timeDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }
    } catch (e) {
      // If parsing fails, try to extract date and time from string
      const parts = appointment.appointmentTime.split("T")
      if (parts.length === 2) {
        formattedDate = new Date(parts[0]).toLocaleDateString("en-US", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
        })
        const timeParts = parts[1].split(":")
        const timeDate = new Date()
        timeDate.setHours(Number.parseInt(timeParts[0] || "0"), Number.parseInt(timeParts[1] || "0"))
        formattedTime = timeDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }
    }
  }

  // Normalize status for display
  const normalizeStatus = (status: string) => {
    if (status === "PENDING" || status === "pending") return "PENDING"
    if (status === "ACCEPTED" || status === "confirmed") return "ACCEPTED"
    if (status === "REJECTED" || status === "cancelled") return "REJECTED"
    return status
  }

  const normalizedStatus = normalizeStatus(appointment.status)

  const getStatusIcon = () => {
    switch (normalizedStatus) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusVariant = () => {
    switch (normalizedStatus) {
      case "ACCEPTED":
        return "default"
      case "REJECTED":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = () => {
    switch (normalizedStatus) {
      case "ACCEPTED":
        return "Confirmed"
      case "REJECTED":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  const handleDownloadReceipt = async () => {
    if (normalizedStatus !== "ACCEPTED") {
      toast({
        title: "Cannot download receipt",
        description: "Receipt can only be downloaded for accepted appointments",
        variant: "destructive",
      })
      return
    }

    setIsDownloading(true)
    try {
      await appointmentsAPI.downloadReceipt(appointment.id)
      toast({
        title: "Receipt downloaded",
        description: "Your appointment receipt has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: error instanceof Error ? error.message : "Failed to download receipt",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{appointment.listing?.title || "Property"}</CardTitle>
          <Badge variant={getStatusVariant()} className="flex items-center gap-1">
            {getStatusIcon()}
            {getStatusLabel()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointment.user && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>
              {appointment.user.fullName} ({appointment.user.email})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{appointment.listing?.location || "Location"}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{`${formattedDate} at ${formattedTime}`}</span>
        </div>

        {normalizedStatus === "ACCEPTED" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
            className="w-full bg-transparent"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download Receipt"}
          </Button>
        )}

        {showActions && normalizedStatus === "PENDING" && onStatusChange && (
          <div className="flex gap-2 pt-2">
            <Button size="sm" onClick={() => onStatusChange(appointment.id, "confirmed")} className="flex-1">
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onStatusChange(appointment.id, "cancelled")}
              className="flex-1"
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
