import { Card, CardContent } from "@/components/ui/card"
import type { Review } from "@/lib/api"
import { Star, User } from "lucide-react"

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="font-medium">{review.userName}</p>
              <p className="text-xs text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
      </CardContent>
    </Card>
  )
}
