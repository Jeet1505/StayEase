"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { appointmentsAPI, type Appointment } from "@/lib/api"
import { AppointmentCard } from "@/components/appointments/appointment-card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"

export default function UserAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
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
      router.push("/owner/appointments")
      return
    }
    loadAppointments()
  }, [isAuthenticated, user, router])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await appointmentsAPI.getByUser(user!.id)
      setAppointments(data || [])
    } catch (err) {
      console.error("Failed to load appointments:", err)
      setError(err instanceof Error ? err.message : "Failed to load appointments")
    } finally {
      setLoading(false)
    }
  }

  // Normalize status values (backend returns PENDING/ACCEPTED/REJECTED, frontend may use lowercase)
  const normalizeStatus = (status: string) => {
    if (status === "PENDING" || status === "pending") return "pending"
    if (status === "ACCEPTED" || status === "confirmed") return "confirmed"
    if (status === "REJECTED" || status === "cancelled") return "cancelled"
    return status
  }

  const filterByStatus = (status: string) => {
    if (status === "all") return appointments
    return appointments.filter((apt) => normalizeStatus(apt.status) === status)
  }

  if (!isAuthenticated || user?.role !== "user") {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground">View and manage your property visit appointments</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              {appointments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">No appointments yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {appointments.map((apt) => (
                    <AppointmentCard key={apt.id} appointment={apt} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByStatus("pending").length === 0 ? (
                  <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No pending appointments</p>
                  </div>
                ) : (
                  filterByStatus("pending").map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="confirmed" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByStatus("confirmed").length === 0 ? (
                  <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No confirmed appointments</p>
                  </div>
                ) : (
                  filterByStatus("confirmed").map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
                )}
              </div>
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filterByStatus("cancelled").length === 0 ? (
                  <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No cancelled appointments</p>
                  </div>
                ) : (
                  filterByStatus("cancelled").map((apt) => <AppointmentCard key={apt.id} appointment={apt} />)
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
