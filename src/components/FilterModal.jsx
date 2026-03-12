import { 
  SlidersHorizontal, X, CalendarDays, Clock, Sparkles, Check, 
  Wifi, Waves, Car, Utensils, Dumbbell, Tv, Wind, Coffee, WashingMachine, 
  Home, Building2, Hotel, Landmark, Warehouse, Palmtree,
  Trophy, Target, Disc, Circle, LayoutGrid, Ticket
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const BOOKING_TYPES = [
  {
    id: "any",
    label: "All Flow",
    desc: "Show everything",
    icon: Sparkles,
  },
  {
    id: "date_range",
    label: "Stays",
    desc: "Book by night — hotels, villas",
    icon: CalendarDays,
  },
  {
    id: "time_slot",
    label: "Experiences",
    desc: "Book by time — classes, tours",
    icon: Clock,
  },
  {
    id: "quantity_based",
    label: "Tickets",
    desc: "Book passes — events, parks",
    icon: Ticket,
  },
];

const PROPERTY_TYPES = [
  { id: "any", label: "Any type", icon: Warehouse },
  { id: "hotel", label: "Hotel", icon: Hotel },
  { id: "villa", label: "Villa", icon: Landmark },
  { id: "guesthouse", label: "Guesthouse", icon: Building2 },
  { id: "hostel", label: "Hostel", icon: Warehouse },
  { id: "resort", label: "Resort", icon: Palmtree },
];

const AMENITIES_LIST = [
  { id: "WiFi", label: "WiFi", icon: Wifi },
  { id: "Pool", label: "Pool", icon: Waves },
  { id: "Kitchen", label: "Kitchen", icon: Utensils },
  { id: "Air conditioning", label: "Air conditioning", icon: Wind },
  { id: "Parking", label: "Parking", icon: Car },
  { id: "Washer", label: "Washer", icon: WashingMachine },
  { id: "TV", label: "TV", icon: Tv },
  { id: "Gym", label: "Gym", icon: Dumbbell },
  { id: "Breakfast", label: "Breakfast", icon: Coffee },
];

const EXPERIENCE_DIFFICULTY = [
  { id: "easy", label: "Beginner", desc: "For everyone" },
  { id: "moderate", label: "Moderate", desc: "A bit active" },
  { id: "hard", label: "Advanced", desc: "Challenging" },
];

const SPORT_TYPES = [
  { id: "any", label: "All Sports", icon: Trophy },
  { id: "football", label: "Football", icon: Circle },
  { id: "badminton", label: "Badminton", icon: Target },
  { id: "basketball", label: "Basketball", icon: Disc },
  { id: "gym", label: "Fitness/Gym", icon: Dumbbell },
];

const SPORT_BOOKING_TYPES = [
  { id: "any", label: "Any type" },
  { id: "full", label: "Full Court / Area" },
  { id: "half", label: "Half Court / Side" },
  { id: "person", label: "Per Person" },
];

export default function FilterModal({ filters, setFilters, totalResults }) {
  const [isOpen, setIsOpen] = useState(false);
  const [local, setLocal] = useState(filters);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCount = [
    filters.minPrice,
    filters.maxPrice,
    filters.bookingType && filters.bookingType !== "any",
    filters.bedrooms > 0,
    filters.beds > 0,
    filters.bathrooms > 0,
    filters.propertyType && filters.propertyType !== "any",
    filters.sportType && filters.sportType !== "any",
    filters.sportBookingType && filters.sportBookingType !== "any",
    filters.amenities.length > 0,
    filters.difficulty && filters.difficulty !== "any",
  ].filter(Boolean).length;

  const open = () => { setLocal(filters); setIsOpen(true); };

  const clearAll = () => setLocal({
    minPrice: "", maxPrice: "", typeOfPlace: "any", bookingType: "any",
    bedrooms: 0, beds: 0, bathrooms: 0, amenities: [], propertyType: "any",
    difficulty: "any", sportType: "any", sportBookingType: "any",
  });

  const toggleAmenity = (amenityId) => {
    setLocal(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const isStayType = local.bookingType === "date_range";
  const isExpType = local.bookingType === "time_slot";

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 lg:p-12 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-300" 
        onClick={() => setIsOpen(false)} 
      />
      <div className="relative bg-card rounded-[32px] shadow-[0_32px_128px_rgba(0,0,0,0.3)] w-full max-w-xl max-h-full flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 origin-center border border-border">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10">
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors active:scale-95">
            <X className="w-5 h-5" />
          </button>
          <span className="font-extrabold text-foreground text-lg tracking-tight uppercase">
            {local.bookingType === "any" ? "General Filters" : local.bookingType === "date_range" ? "Stay Filters" : "Experience Filters"}
          </span>
          <div className="w-9" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 no-scrollbar overscroll-contain">
          <div className="p-8 space-y-12 pb-24">

            {/* ===== CATEGORY SWITCHER ===== */}
            <div>
              <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-2">Category</h3>
              <p className="text-sm text-muted-foreground mb-6">Choose types to see relevant filters below</p>
              <div className="flex gap-2">
                {BOOKING_TYPES.map((bt) => {
                  const selected = local.bookingType === bt.id;
                  const Icon = bt.icon;
                  return (
                    <button
                      key={bt.id}
                      onClick={() => setLocal({ ...local, bookingType: bt.id })}
                      className={cn(
                        "flex-1 flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all group",
                        selected
                          ? "border-foreground bg-muted shadow-sm scale-[0.98]"
                          : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", selected ? "text-foreground" : "text-muted-foreground")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", selected ? "text-foreground" : "text-muted-foreground")}>
                        {bt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="h-px bg-border/40" />

            {/* ===== PRICE BUDGET ===== */}
            <div>
              <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-2">Price budget</h3>
              <p className="text-sm text-muted-foreground mb-6">Narrow down by LAK per night / session</p>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From</div>
                  <div className="flex items-center pl-4 pt-6 border-2 border-border rounded-2xl bg-card focus-within:border-foreground transition-all">
                    <span className="text-xs font-black opacity-30 mr-1">LAK</span>
                    <input
                      type="number" placeholder="0" value={local.minPrice}
                      onChange={(e) => setLocal({ ...local, minPrice: e.target.value })}
                      className="w-full bg-transparent border-none outline-none py-3 text-sm font-bold text-foreground"
                    />
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="absolute left-4 top-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">To</div>
                  <div className="flex items-center pl-4 pt-6 border-2 border-border rounded-2xl bg-card focus-within:border-foreground transition-all">
                    <span className="text-xs font-black opacity-30 mr-1">LAK</span>
                    <input
                      type="number" placeholder="Any" value={local.maxPrice}
                      onChange={(e) => setLocal({ ...local, maxPrice: e.target.value })}
                      className="w-full bg-transparent border-none outline-none py-3 text-sm font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ===== STAY SPECIFIC SECTION ===== */}
            {isStayType && (
              <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="h-px bg-border/40" />
                
                {/* Rooms and beds */}
                <div>
                  <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-6">Space Requirements</h3>
                  {["bedrooms", "beds", "bathrooms"].map((key) => (
                    <div key={key} className="flex items-center justify-between mb-6 last:mb-0">
                      <span className="text-sm font-bold text-foreground uppercase tracking-widest">{key}</span>
                      <div className="flex items-center gap-6">
                        <button
                          onClick={() => setLocal({ ...local, [key]: Math.max(0, local[key] - 1) })}
                          className={cn("w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all", local[key] > 0 ? "border-foreground text-foreground hover:bg-muted" : "border-border text-muted-foreground/20")}
                          disabled={local[key] === 0}
                        ><span className="text-xl font-bold">−</span></button>
                        <span className="w-8 text-center font-black text-sm text-foreground">{local[key] || "Any"}</span>
                        <button
                          onClick={() => setLocal({ ...local, [key]: local[key] + 1 })}
                          className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-foreground transition-all hover:bg-muted"
                        ><span className="text-xl font-bold">+</span></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-border/40" />

                {/* Property type */}
                <div>
                  <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-6">Property type</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {PROPERTY_TYPES.map((pt) => {
                      const selected = local.propertyType === pt.id;
                      const Icon = pt.icon;
                      return (
                        <button
                          key={pt.id}
                          onClick={() => setLocal({ ...local, propertyType: pt.id })}
                          className={cn("px-4 py-6 rounded-2xl border-2 text-sm font-bold transition-all text-left flex flex-col gap-4", selected ? "border-foreground bg-muted text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/10")}
                        >
                          <Icon className={cn("w-6 h-6", selected ? "text-foreground" : "text-muted-foreground/50")} />
                          <span className="text-[10px] uppercase tracking-wider font-black">{pt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ===== EXPERIENCE SPECIFIC SECTION ===== */}
            {local.bookingType === "time_slot" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="h-px bg-border/40" />

                {/* Sport Selection */}
                <div>
                  <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-2">Service Selection</h3>
                  <p className="text-sm text-muted-foreground mb-6">Select the specific sport or activity</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {SPORT_TYPES.map((pt) => {
                      const selected = local.sportType === pt.id;
                      const Icon = pt.icon;
                      return (
                        <button
                          key={pt.id}
                          onClick={() => setLocal({ ...local, sportType: pt.id })}
                          className={cn(
                            "px-4 py-6 rounded-2xl border-2 text-sm font-bold transition-all text-left flex flex-col gap-4",
                            selected
                              ? "border-foreground bg-muted text-foreground"
                              : "border-border text-muted-foreground hover:border-muted-foreground/30 hover:bg-muted/10"
                          )}
                        >
                          <Icon className={cn("w-6 h-6", selected ? "text-foreground" : "text-muted-foreground/50")} />
                          <span className="text-[10px] uppercase tracking-wider font-extrabold">{pt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <div className="h-px bg-border/40" />

                {/* Booking Type / Slot Type */}
                <div>
                  <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-2">Booking Category</h3>
                  <p className="text-sm text-muted-foreground mb-6">Choose how you want to book the session</p>
                  <div className="grid grid-cols-2 gap-3">
                    {SPORT_BOOKING_TYPES.map((st) => {
                      const selected = local.sportBookingType === st.id;
                      return (
                        <button
                          key={st.id}
                          onClick={() => setLocal({ ...local, sportBookingType: st.id })}
                          className={cn(
                            "px-4 py-4 rounded-xl border-2 text-left transition-all flex items-center gap-3",
                            selected ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground/30"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            selected ? "border-foreground" : "border-muted-foreground/30"
                          )}>
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-foreground" />}
                          </div>
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            selected ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {st.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="h-px bg-border/40" />
                
                {/* Experience Level */}
                <div>
                  <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-2">Activity Level</h3>
                  <p className="text-sm text-muted-foreground mb-6">Choose how intense you want the experience to be</p>
                  <div className="grid grid-cols-3 gap-3">
                    {EXPERIENCE_DIFFICULTY.map((d) => {
                      const selected = local.difficulty === d.id;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setLocal({ ...local, difficulty: d.id })}
                          className={cn("p-4 rounded-xl border-2 text-left transition-all", selected ? "border-foreground bg-muted" : "border-border hover:border-muted-foreground/30")}
                        >
                          <div className={cn("text-[10px] font-black uppercase tracking-widest", selected ? "text-foreground" : "text-muted-foreground")}>{d.label}</div>
                          <div className="text-[9px] text-muted-foreground mt-0.5 font-medium leading-tight">{d.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="h-px bg-border/40" />

            {/* ===== AMENITIES (Common except Time Slot) ===== */}
            {local.bookingType !== "time_slot" && (
              <div>
                <h3 className="font-extrabold text-foreground text-xl tracking-tight mb-6">Amenities & Inclusions</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES_LIST.map((amenity) => {
                    const selected = local.amenities.includes(amenity.id);
                    const Icon = amenity.icon;
                    return (
                      <button
                        key={amenity.id}
                        onClick={() => toggleAmenity(amenity.id)}
                        className={cn("px-4 py-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-3", selected ? "border-foreground bg-muted text-foreground" : "border-border text-muted-foreground hover:border-muted-foreground/30")}
                      >
                        <Icon className={cn("w-4 h-4", selected ? "text-foreground" : "text-muted-foreground/40")} />
                        <span className="text-[10px] font-bold uppercase tracking-tight line-clamp-1">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-card border-t border-border px-8 py-4 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
          <button
            onClick={clearAll}
            className="text-sm font-bold text-foreground underline underline-offset-4 hover:opacity-70 transition-opacity"
          >
            Clear all
          </button>
          <button
            onClick={() => { setFilters(local); setIsOpen(false); }}
            className="bg-foreground text-background px-10 py-4 rounded-2xl font-black text-sm hover:opacity-90 transition-all active:scale-95 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
          >
            Show {totalResults} results
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={open}
        className={cn(
          "flex items-center gap-2 h-[48px] px-4 rounded-xl border border-border bg-card hover:border-foreground transition-all text-sm font-semibold",
          activeCount > 0 && "border-foreground shadow-sm"
        )}
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span className="hidden sm:inline">Filters</span>
        {activeCount > 0 && (
          <span className="bg-foreground text-background text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && mounted && createPortal(modalContent, document.body)}
    </>
  );
}
