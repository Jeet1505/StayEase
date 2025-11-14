const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9090"

export interface User {
  id: number
  fullName: string
  email: string
  role: "user" | "owner"
}

export interface Listing {
  id: number
  title: string
  description: string
  location: string
  floorNumber: number
  imageUrl: string
  availabilityStatus: "available" | "unavailable"
  owner: User
}

export interface Appointment {
  id: number
  appointmentTime: string // ISO format: "yyyy-MM-dd'T'HH:mm:ss"
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "pending" | "confirmed" | "cancelled"
  user?: User
  listing?: Listing
  userId?: number
  listingId?: number
  appointmentDate?: string // Deprecated, use appointmentTime instead
}

export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  userId: number
  userName: string
  listingId: number
  listing?: {
    id: number
    title: string
    location?: string
  }
}

export interface DashboardStats {
  totalAppointments: number
  pendingAppointments: number
  acceptedAppointments: number
  rejectedAppointments: number
  totalReviews: number
  averageRating: number
  totalListings: number
}

export interface Notification {
  id: number
  message: string
  isRead: boolean
  createdAt: string
  user: User
}

// Helper function to format datetime for API
export function formatDateTime(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hours = String(date.getHours()).padStart(2, "0")
  const minutes = String(date.getMinutes()).padStart(2, "0")
  const seconds = String(date.getSeconds()).padStart(2, "0")
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

// Auth API
export const authAPI = {
  async register(data: {
    fullName: string
    email: string
    password: string
    role: "user" | "owner"
  }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const result = await response.json()
    if (result.message === "User already exists") {
      throw new Error("User already exists")
    }
    return result
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const result = await response.json()
    if (result.message.includes("Invalid")) {
      throw new Error("Invalid email or password")
    }
    // result contains: { message, userId, fullName, role }
    return { success: true, userId: result.userId, fullName: result.fullName, role: result.role }
  },
}

// Listings API
export const listingsAPI = {
  async getAll(): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/api/listings`)
    if (!response.ok) {
      let errText = await response.text().catch(() => response.statusText)
      throw new Error(errText || `Failed to fetch listings: ${response.status}`)
    }
    return response.json()
  },

  async filter(filters: {
    ownerId?: number
    location?: string
    availabilityStatus?: string
    floorNumber?: number
  }): Promise<Listing[]> {
    const response = await fetch(`${API_BASE_URL}/api/listings/filter`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    })
    if (!response.ok) {
      let errText = await response.text().catch(() => response.statusText)
      throw new Error(errText || `Failed to filter listings: ${response.status}`)
    }
    return response.json()
  },

  async create(data: {
    title: string
    description: string
    location: string
    floorNumber: number
    imageUrl: string
    availabilityStatus: "available" | "unavailable"
    owner: { id: number }
  }): Promise<Listing> {
    const response = await fetch(`${API_BASE_URL}/api/listings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create listing")
    }
    return response.json()
  },
}

// Appointments API
export const appointmentsAPI = {
  async getByOwner(ownerId: number): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/owner/${ownerId}`)
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Failed to fetch appointments: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  async getAll(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/api/appointments`)
    return response.json()
  },

  async getByUser(userId: number): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/user/${userId}`)
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Failed to fetch appointments: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  async create(data: {
    appointmentTime: string
    userId: number
    listingId: number
  }): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/api/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create appointment")
    }
    return response.json()
  },

  async updateStatus(id: number, status: "ACCEPTED" | "REJECTED" | "confirmed" | "cancelled"): Promise<Appointment> {
    // Map frontend status to backend status
    const backendStatus = status === "confirmed" ? "ACCEPTED" : status === "cancelled" ? "REJECTED" : status
    const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/status?status=${backendStatus}`, {
      method: "PUT",
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update appointment status")
    }
    return response.json()
  },

  async downloadReceipt(appointmentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/appointments/${appointmentId}/receipt`)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to download receipt")
    }
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt_${appointmentId}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  },
}

// Reviews API
export const reviewsAPI = {

  async getByListing(listingId: number): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/listing/${listingId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch reviews")
    }
    return response.json()
  },

  async getByUser(userId: number): Promise<Review[]> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/user/${userId}`)
    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText)
      throw new Error(`Failed to fetch reviews: ${response.status} ${errorText}`)
    }
    return response.json()
  },

  async create(data: {
    rating: number
    comment: string
    userId: number
    listingId: number
  }): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create review")
    }
    return response.json()
  },

  async update(id: number, data: { rating: number; comment: string }): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update review")
    }
    return response.json()
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/reviews/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error("Failed to delete review")
    }
  },
}

// Dashboard API
export const dashboardAPI = {
  async getUserStats(userId: number): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/user/${userId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch user stats")
    }
    return response.json()
  },

  async getOwnerStats(ownerId: number): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/owner/${ownerId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch owner stats")
    }
    return response.json()
  },
}

// Notifications API
export const notificationsAPI = {
  async getByUser(userId: number): Promise<Notification[]> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${userId}`)
    if (!response.ok) {
      throw new Error("Failed to fetch notifications")
    }
    return response.json()
  },

  async send(userId: number, message: string): Promise<void> {
    const encodedMessage = encodeURIComponent(message)
    const response = await fetch(`${API_BASE_URL}/api/notifications/send?userId=${userId}&message=${encodedMessage}`, {
      method: "POST",
    })
    if (!response.ok) {
      throw new Error("Failed to send notification")
    }
  },

  async markAsRead(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/read/${id}`, { method: "PUT" })
    if (!response.ok) {
      throw new Error("Failed to mark notification as read")
    }
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, { method: "DELETE" })
    if (!response.ok) {
      throw new Error("Failed to delete notification")
    }
  },
}
