import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  Search,
  ChevronDown,
  Plus,
  Minus
} from "lucide-react";
import { Calendar } from "../ui/calendar";
import { useLanguage } from "../../context/LanguageContext";
export default function DateRangeBookingForm({ business, selectedService, onSearch }) {
  const { t } = useLanguage();
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [guests, setGuests] = useState({ adults: 2, children: 0, rooms: 1 });
  
  const [activePopover, setActivePopover] = useState(null); // 'dates', 'guests', null
  const popoverRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateGuests = (field, delta) => {
    setGuests(prev => {
      const newVal = prev[field] + delta;
      if (field === "adults" && newVal < 1) return prev;
      if (field === "children" && newVal < 0) return prev;
      if (field === "rooms" && newVal < 1) return prev;
      return { ...prev, [field]: newVal };
    });
  };

  const handleSearch = () => {
    if (!dateRange.from || !dateRange.to) {
      setActivePopover("dates");
      return;
    }
    
    // Pass the selected data back to the parent to check availability
    onSearch({
      start_datetime: dateRange.from,
      end_datetime: dateRange.to,
      guests,
    });
  };

  return (
    <div className="bg-card w-full rounded-xl shadow-xl shadow-primary/5 border border-border/50 relative p-2 lg:p-0">
      <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border w-full">
        
        {/* Destination / Service */}
        <div className="flex-1 p-4 lg:p-5 flex items-center gap-4 hover:bg-muted/30 transition-colors lg:rounded-l-2xl cursor-default">
          <MapPin className="w-6 h-6 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Destination / Service</span>
            <span className="text-lg text-foreground font-semibold truncate pt-0.5">
              {selectedService.province || selectedService.district || selectedService.location || business.business_name} - {selectedService.name}
            </span>
          </div>
        </div>

        {/* Dates */}
        <div 
          onClick={() => setActivePopover(activePopover === "dates" ? null : "dates")}
          className="flex-[1.5] p-4 lg:p-5 flex flex-col justify-center hover:bg-muted/50 transition-colors cursor-pointer relative"
        >
          <div className="flex items-center gap-4">
            <CalendarIcon className="w-6 h-6 text-muted-foreground" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Check-in — Check-out</span>
              <span className="text-lg text-foreground font-semibold pt-0.5">
                {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : "Select Dates"}
                {dateRange.to ? ` — ${format(dateRange.to, "MMM d, yyyy")}` : (dateRange.from ? " — Select out" : "")}
              </span>
            </div>
          </div>
        </div>

        {/* Guests & Rooms */}
        <div 
          onClick={() => setActivePopover(activePopover === "guests" ? null : "guests")}
          className="flex-1 p-4 lg:p-5 flex flex-col justify-center hover:bg-muted/50 transition-colors cursor-pointer relative"
        >
          <div className="flex items-center gap-4">
            <Users className="w-6 h-6 text-muted-foreground" />
            <div className="flex flex-col flex-1">
              <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Guests & Rooms</span>
              <span className="text-lg text-foreground font-semibold pt-0.5 flex items-center justify-between">
                {guests.adults + guests.children} Guest{guests.adults + guests.children > 1 ? 's' : ''}, {guests.rooms} Room{guests.rooms > 1 ? 's' : ''}
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </span>
            </div>
          </div>
        </div>

        {/* Search / Book Button */}
        <div className="p-2 lg:p-3 flex items-center justify-center bg-card lg:rounded-r-2xl">
          <button 
            onClick={handleSearch}
            className="w-full lg:w-32 h-16 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center justify-center font-bold text-xl transition-transform active:scale-95 flex-shrink-0 shadow-md shadow-primary/20"
          >
            {t("common.search") || "Search"}
          </button>
        </div>

      </div>

      {/* --- Popovers --- */}
      <div ref={popoverRef}>
        
        {/* Date Picker Popover */}
        {activePopover === "dates" && (
          <div className="absolute top-full left-0 lg:left-1/4 xl:left-1/3 mt-2 p-4 bg-card rounded-xl shadow-2xl border border-border z-50 w-full lg:w-auto animate-in fade-in slide-in-from-top-4">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={window.innerWidth >= 1024 ? 2 : 1}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              className="border-none p-0"
            />
          </div>
        )}

        {/* Guests Popover */}
        {activePopover === "guests" && (
          <div className="absolute top-full right-0 lg:right-32 mt-2 p-6 bg-card rounded-lg shadow-2xl border border-border z-50 w-full lg:w-80 animate-in fade-in slide-in-from-top-4 space-y-6">
            
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground">Adults</h4>
                <p className="text-xs text-muted-foreground">Ages 13 or above</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateGuests("adults", -1)} disabled={guests.adults <= 1} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="w-4 text-center font-medium">{guests.adults}</span>
                <button onClick={() => updateGuests("adults", 1)} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent">
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-foreground">Children</h4>
                <p className="text-xs text-muted-foreground">Ages 0-12</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateGuests("children", -1)} disabled={guests.children <= 0} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="w-4 text-center font-medium">{guests.children}</span>
                <button onClick={() => updateGuests("children", 1)} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent">
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

            {/* Rooms */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <h4 className="font-bold text-foreground">Rooms</h4>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => updateGuests("rooms", -1)} disabled={guests.rooms <= 1} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed">
                  <Minus className="w-4 h-4 text-foreground" />
                </button>
                <span className="w-4 text-center font-medium">{guests.rooms}</span>
                <button onClick={() => updateGuests("rooms", 1)} className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-accent">
                  <Plus className="w-4 h-4 text-foreground" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
