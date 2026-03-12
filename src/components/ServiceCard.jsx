import { Heart, Star, MapPin } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useAuth } from "../context/AuthContext";
import { favoritesAPI } from "../services/api";

export default function ServiceCard({ 
  service: svc, 
  resource: res, 
  startDate, 
  endDate, 
  selectedTime,
  isHighlighted = false,
  onMouseEnter,
  onMouseLeave
}) {
  const { user, isAuthenticated, setUser } = useAuth();
  const navigate = useNavigate();
  
  const businessId = svc.business_id?._id || svc.business_id;
  const itemId = res?._id || svc._id;
  const itemType = res ? 'resource' : 'service';

  const isFavorited = res 
    ? user?.favorite_resources?.some(fid => fid.toString() === res._id)
    : user?.favorite_services?.some(fid => fid.toString() === svc._id);

  const [localLiked, setLocalLiked] = useState(isFavorited);

  // Sync local liked state with auth user favorites if it changes elsewhere
  useEffect(() => {
    setLocalLiked(isFavorited);
  }, [isFavorited, user?.favorite_resources, user?.favorite_services]);

  const toggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/" } });
      return;
    }

    try {
      // Optimistic update
      setLocalLiked(!localLiked);
      const response = await favoritesAPI.toggle(itemId, itemType);
      
      // Update global user state with the updated favorites from backend
      if (response.data.success && response.data.user) {
        setUser(prev => ({
          ...prev,
          favorite_services: response.data.user.favorite_services,
          favorite_resources: response.data.user.favorite_resources
        }));
      }
    } catch (err) {
      console.error("Failed to toggle favorite", err);
      setLocalLiked(isFavorited); // Revert on failure
    }
  };

  // Stabilize the random rating so it doesn't change on re-render (hover)
  const rating = useMemo(() => {
    if (svc.rating) return svc.rating.toFixed(2);
    // Use the ID to seed a "random" but stable number if possible, or just memoize one
    return (4.5 + Math.random() * 0.5).toFixed(2);
  }, [svc._id, res?._id]);

  const displayImage = res?.image || svc.image;
  const imageUrl = displayImage ? (displayImage.startsWith('http') ? displayImage : `http://localhost:3000${displayImage}`) : null;
  const displayPrice = res?.price_override ?? svc.price;
  const displayName = res ? res.name : svc.name;
  
  const bookingUrl = res && svc.booking_type === "date_range"
    ? `/room/${res._id}?serviceId=${svc._id}${startDate ? `&start=${startDate}` : ''}${endDate ? `&end=${endDate}` : ''}`
    : `/business/${businessId}?serviceId=${svc._id}${res ? `&resourceId=${res._id}` : ''}${startDate ? `&start=${startDate}` : ''}${endDate ? `&end=${endDate}` : ''}${selectedTime ? `&time=${selectedTime}` : ''}`;

  return (
    <div 
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group flex flex-col cursor-pointer animate-fade-in relative transition-all duration-300 rounded-3xl p-1 ${
        isHighlighted ? "ring-2 ring-primary ring-offset-2 shadow-xl bg-card" : ""
      }`}
    >
      <Link to={bookingUrl} className="block w-full">
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-3 bg-muted shadow-sm">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={displayName}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary/30 text-muted-foreground/20 italic text-xs font-bold">
              Phajay
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={toggleLike}
            className="absolute top-3 right-3 z-20 p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Toggle favorite"
          >
            <Heart
              className={`w-6 h-6 drop-shadow-md transition-all ${
                localLiked ? "fill-primary text-primary scale-110" : "fill-black/30 text-white stroke-[2px]"
              }`}
            />
          </button>

          {/* Guest Favorite Badge */}
          {svc.rating >= 4.5 && (
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-foreground border-none shadow-xl px-3 py-1.5 text-[11px] font-black rounded-full uppercase tracking-tighter">
              Guest favorite
            </div>
          )}

          {/* Booking Type Badge (Floating) */}
          <div className="absolute bottom-3 left-3 flex gap-1">
             <Badge className="bg-black/60 backdrop-blur-md text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
               {svc.category || "General"}
             </Badge>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-col gap-0.5 px-0.5 pb-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors">
              {displayName}
            </h3>
            <span className="flex items-center gap-1 text-[13px] font-semibold text-foreground shrink-0">
              <Star className="w-3 h-3 fill-current text-primary" /> {rating}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground truncate">
            <MapPin className="w-3 h-3 text-primary/60" />
            <span>{svc.district || svc.province || svc.location || "Laos"}</span>
          </div>

          <div className="mt-1 flex flex-col">
            <p className="text-[14px] text-foreground font-medium">
              <span className="font-black text-[15px]">
                {displayPrice.toLocaleString()} {svc.currency}
              </span>
              <span className="text-muted-foreground font-medium ml-1">
                {svc.booking_type === "date_range" ? "/ night" : "/ session"}
              </span>
            </p>
            {res && (
               <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mt-0.5">
                 {svc.name}
               </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
