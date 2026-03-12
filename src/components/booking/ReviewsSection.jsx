import { Star } from "lucide-react";
import { Progress } from "../ui/progress";

// Mock reviews for aesthetic
const reviews = [
  {
    name: "Jerry",
    location: "Mauritius",
    date: "December 2025",
    stay: "Stayed over a week",
    text: "The place and host amazing. Host always here to help. The place is very close to every point of interest nearby. Also there is a vegetable and fruits seller in front of the place.",
    avatar: "J",
  },
  {
    name: "Aneta",
    location: "8 years on platform",
    date: "November 2025",
    stay: "Stayed a few nights",
    text: "It's a great place to stay when you need a rest or want to be far away from busy streets. The apartment has everything you need to feel like home.",
    avatar: "A",
  },
  {
    name: "Vladimir",
    location: "7 months on platform",
    date: "November 2025",
    stay: "",
    text: "Everything was good, clean and comfortable apartment in a great location. The host was very responsive and helpful.",
    avatar: "V",
  },
  {
    name: "Lisa",
    location: "Denver, Colorado",
    date: "January 2026",
    stay: "Stayed over a week",
    text: "I highly recommend this place for visitors. It's very quiet and comfortable. Host was very responsive and friendly. Close to everything.",
    avatar: "L",
  },
];

const categories = [
  { label: "Cleanliness", score: 4.9 },
  { label: "Accuracy", score: 5.0 },
  { label: "Check-in", score: 5.0 },
  { label: "Communication", score: 5.0 },
  { label: "Location", score: 4.7 },
  { label: "Value", score: 5.0 },
];

export default function ReviewsSection({ rating = 5.0, count = 22 }) {
  return (
    <div className="py-12 border-b border-border">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Star className="w-10 h-10 fill-foreground text-foreground" />
          <span className="text-6xl font-bold text-foreground tracking-tighter">{rating?.toFixed(1) || "5.0"}</span>
        </div>
        <div className="space-y-1">
          <p className="text-xl font-bold text-foreground">Guest favorite</p>
          <p className="text-sm text-muted-foreground font-medium">One of the most loved homes on Phajay based on {count} reviews</p>
        </div>
      </div>

      {/* Category scores grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-12 pb-12 border-b border-border">
        {categories.map((cat, i) => (
          <div key={i} className="text-center group">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 group-hover:text-primary transition-colors">{cat.label}</p>
            <p className="text-2xl font-bold text-foreground">{cat.score.toFixed(1)}</p>
            <div className="mt-2 flex items-center justify-center">
                <Progress value={cat.score * 20} className="h-1 w-12 bg-muted transition-all" />
            </div>
          </div>
        ))}
      </div>

      {/* Reviews grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
        {reviews.map((review, i) => (
          <div key={i} className="space-y-4 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center font-bold text-lg border-2 border-border shadow-sm">
                {review.avatar}
              </div>
              <div>
                <p className="font-bold text-[15px] text-foreground">{review.name}</p>
                <p className="text-xs text-muted-foreground font-medium leading-tight">{review.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-muted-foreground">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-2.5 h-2.5 fill-foreground text-foreground" />
                ))}
              </div>
              <span>·</span>
              <span className="text-foreground">{review.date}</span>
              {review.stay && (
                <>
                    <span>·</span>
                    <span>{review.stay}</span>
                </>
              )}
            </div>
            <p className="text-[15px] text-foreground/90 leading-relaxed line-clamp-4">
              {review.text}
            </p>
            <button className="text-sm font-bold underline text-foreground hover:text-muted-foreground transition-all">
                Show more
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-12">
        <button className="border-2 border-foreground rounded-lg px-8 py-3 font-bold text-foreground hover:bg-muted transition-all">
          Show all {count} reviews
        </button>
      </div>
    </div>
  );
}
