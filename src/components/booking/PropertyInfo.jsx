import { Star, Award, Smartphone, Wind, Car, Shield } from "lucide-react";
import { Separator } from "../ui/separator";

export default function PropertyInfo({
  title,
  guests,
  bedrooms,
  beds,
  baths,
  rating,
  reviewCount,
  hostName,
  hostYears,
  description,
  isSuperhost,
  hostAvatar
}) {
  return (
    <div className="space-y-6">
      {/* Title area */}
      <div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          {guests} guest{guests > 1 ? 's' : ''} · {bedrooms} bedroom{bedrooms > 1 ? 's' : ''} · {beds} bed{beds > 1 ? 's' : ''} · {baths} bath{baths > 1 ? 's' : ''}
        </p>
      </div>

      {/* Guest favorite badge - Only if high rating */}
      {rating >= 4.8 && (
        <div className="flex items-center gap-4 border border-border rounded-xl p-4 bg-muted/5">
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-primary" />
            <div>
              <p className="font-bold text-sm text-foreground">Guest favorite</p>
              <p className="text-[11px] text-muted-foreground leading-tight">One of the most loved homes on Phajay based on ratings and reliability</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4 text-center">
            <div>
              <p className="text-lg font-bold text-foreground">{rating}</p>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />
                ))}
              </div>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div>
              <p className="text-lg font-bold text-foreground">{reviewCount}</p>
              <p className="text-[11px] text-muted-foreground underline font-medium">Reviews</p>
            </div>
          </div>
        </div>
      )}

      {/* Host info teaser */}
      <div className="flex items-center gap-4 py-4 border-b border-border">
        <div className="relative">
          {hostAvatar ? (
            <img 
              src={hostAvatar.startsWith('http') ? hostAvatar : `http://localhost:3000${hostAvatar}`} 
              className="w-12 h-12 rounded-full object-cover border border-border" 
              alt={hostName}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg border border-primary/20">
              {hostName?.charAt(0) || "H"}
            </div>
          )}
          {isSuperhost && (
            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1 border-2 border-background shadow-sm">
              <Shield className="w-2.5 h-2.5 text-primary-foreground fill-current" />
            </div>
          )}
        </div>
        <div>
          <p className="font-bold text-[15px] text-foreground">Hosted by {hostName || "Host"}</p>
          <p className="text-xs text-muted-foreground font-medium">
            {isSuperhost ? "Superhost" : "Host"} · {hostYears || 1} years hosting
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="space-y-5 py-5 border-b border-border">
        {[
          { icon: Smartphone, title: "Self check-in", desc: "Check yourself in with the keypad or smart lock." },
          { icon: Wind, title: "Designed for comfort", desc: "Equipped with air conditioning and essential amenities." },
          { icon: Car, title: "Parking available", desc: "Free parking on premises or nearby." },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-4 group">
            <item.icon className="w-6 h-6 text-foreground mt-0.5 shrink-0 group-hover:text-primary transition-colors" />
            <div>
              <p className="font-bold text-[15px] text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="py-4">
        <h2 className="text-lg font-bold text-foreground mb-3">About this space</h2>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
          {description || "No description available for this resource."}
        </p>
      </div>
    </div>
  );
}
