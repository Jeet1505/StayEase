import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Shield, Star } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold mb-6 text-balance">Find Your Perfect Rental with Confidence</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
          StayEase connects tenants with property owners through transparent, appointment-based visits. No hidden fees,
          no online payments—just honest rentals.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="text-lg px-8">
              Get Started
            </Button>
          </Link>
          <Link href="/auth">
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent">
              List Your Property
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose StayEase?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Appointment-Based Visits</CardTitle>
              <CardDescription>
                Schedule physical visits before committing. See the property in person and meet the owner.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>No Payment Risks</CardTitle>
              <CardDescription>
                No online payments required. Build trust through in-person meetings and transparent communication.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                <Star className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>Verified Reviews</CardTitle>
              <CardDescription>
                Read authentic reviews from tenants who have actually visited and stayed at the properties.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50 -mx-4 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Browse Listings</h3>
              <p className="text-muted-foreground">
                Search through verified property listings including hostels, PG accommodations, and rental houses.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Schedule a Visit</h3>
              <p className="text-muted-foreground">
                Book an appointment to visit the property at your convenience. No commitment required.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xl flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Visit & Decide</h3>
              <p className="text-muted-foreground">
                Meet the owner, inspect the property, and make an informed decision. Leave a review to help others.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-20">
        <h2 className="text-3xl font-bold mb-4">Ready to Find Your Next Home?</h2>
        <p className="text-muted-foreground mb-8">
          Join thousands of students, bachelors, and workers who trust StayEase
        </p>
        <Link href="/auth">
          <Button size="lg" className="text-lg px-8">
            Start Your Search
          </Button>
        </Link>
      </section>
    </div>
  )
}
