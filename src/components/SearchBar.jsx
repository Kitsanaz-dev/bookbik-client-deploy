import { Search, MapPin, Calendar as CalendarIcon, Clock, Users, Globe, Building, Landmark, Palmtree } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "./ui/calendar";
import { cn } from "@/lib/utils";

const SUGGESTED_DESTINATIONS = [
  { id: "nearby", name: "Nearby", desc: "Find what's around you", icon: MapPin },
  { id: "vcap", name: "Vientiane Capital", desc: "The vibrant capital city", icon: Landmark },
  { id: "lpbr", name: "Luang Prabang", desc: "UNESCO heritage town", icon: Building },
  { id: "cps", name: "Champasak", desc: "Ancient temples & waterfalls", icon: Globe },
  { id: "svk", name: "Savannakhet", desc: "Colonial charm & culture", icon: Palmtree },
];

export default function SearchBar({
  searchQuery, setSearchQuery,
  startDate, setStartDate,
  endDate, setEndDate,
  selectedTime, setSelectedTime,
  bookingType,
  onSearch,
  collapsed = false,
  onExpand,
}) {
  const [activeField, setActiveField] = useState(null);
  const popoverRef = useRef(null);
  const [dateTab, setDateTab] = useState("Dates");

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setActiveField(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "Add dates";
    const date = new Date(dateStr + "T00:00:00");
    return format(date, "MMM d");
  };

  return (
    <div className="relative" ref={popoverRef}>
      <div className="relative min-h-[66px] flex items-center justify-center">
        {/* Collapsed mini bar */}
        <button
          onClick={onExpand}
          className={cn(
            "absolute inset-0 flex items-center bg-card rounded-full border border-border shadow-sm hover:shadow-md transition-all px-2 py-3 gap-0 h-fit my-auto z-10",
            collapsed ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
            "duration-300 ease-in-out"
          )}
        >
          <span className="px-5 py-2 text-sm font-semibold text-foreground border-r border-border truncate max-w-[120px]">
            {searchQuery || "Anywhere"}
          </span>
          <span className="px-5 py-2 text-sm font-semibold text-foreground border-r border-border truncate max-w-[120px]">
            {startDate ? formatDateLabel(startDate) : "Any week"}
            {endDate && startDate !== endDate ? ` – ${formatDateLabel(endDate)}` : ""}
          </span>
          <span className="px-5 py-2 text-sm text-muted-foreground font-medium truncate max-w-[100px]">
            {bookingType === "time_slot" ? (selectedTime || "Add time") : "Add guests"}
          </span>
          <div className="bg-primary rounded-full p-2.5 ml-6">
            <Search className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
        </button>

        {/* Expanded bar */}
        <div
          className={cn(
            "w-full flex flex-col md:flex-row items-center bg-card rounded-full border border-border shadow-sm hover:shadow-md transition-all p-1 relative",
            !collapsed ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 -translate-y-4 scale-95 pointer-events-none",
            "duration-300 ease-in-out"
          )}
        >
          {/* Where */}
          <div
            onClick={() => setActiveField("where")}
            className={cn(
              "flex-[1.5] text-left px-8 py-3 rounded-full transition-all cursor-pointer relative",
              activeField === "where" ? "bg-card shadow-md" : "hover:bg-muted"
            )}
          >
            <div className="text-xs font-bold text-foreground tracking-wide uppercase">Where</div>
            <input
              type="text"
              placeholder="Search destinations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-normal w-full placeholder:text-muted-foreground pt-0.5"
            />
            {activeField === "where" && (
              <div className="absolute top-[110%] left-0 w-[400px] bg-card rounded-3xl shadow-xl border border-border z-[100] p-6 animate-in fade-in slide-in-from-top-4">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 px-2">Suggested Destinations</div>
                <div className="space-y-1">
                  {SUGGESTED_DESTINATIONS.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={(e) => { e.stopPropagation(); setSearchQuery(dest.name); setActiveField("when"); }}
                      className="flex items-center gap-4 p-3 rounded-2xl hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <dest.icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{dest.name}</div>
                        <div className="text-xs text-muted-foreground">{dest.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-border self-center" />

          {/* When */}
          <div
            onClick={() => setActiveField("when")}
            className={cn(
              "flex-[1.2] text-left px-8 py-3 rounded-full transition-all cursor-pointer relative",
              activeField === "when" ? "bg-card shadow-md" : "hover:bg-muted"
            )}
          >
            <div className="text-xs font-bold text-foreground tracking-wide uppercase">
              {bookingType === "date_range" ? "When" : "Date"}
            </div>
            <div className="text-sm font-normal text-muted-foreground truncate pt-0.5">
              {bookingType === "date_range"
                ? (startDate && endDate ? `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}` : "Add dates")
                : (startDate ? formatDateLabel(startDate) : "Add dates")}
            </div>

            {activeField === "when" && (
              <div
                className="absolute top-[110%] left-1/2 -translate-x-1/2 bg-card rounded-3xl shadow-xl border border-border z-[100] p-8 animate-in fade-in slide-in-from-top-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-muted p-1 rounded-full flex gap-1">
                    {["Dates", "Months", "Flexible"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setDateTab(tab)}
                        className={cn(
                          "px-6 py-2 rounded-full text-sm font-semibold transition-all",
                          dateTab === tab ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {bookingType === "date_range" ? (
                  <div className="min-w-[700px]">
                    <Calendar
                      mode="range"
                      selected={{ from: startDate ? new Date(startDate + "T00:00:00") : undefined, to: endDate ? new Date(endDate + "T00:00:00") : undefined }}
                      onSelect={(range) => {
                        setStartDate(range?.from ? format(range.from, "yyyy-MM-dd") : "");
                        setEndDate(range?.to ? format(range.to, "yyyy-MM-dd") : "");
                      }}
                      numberOfMonths={2}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="p-0 border-none"
                    />
                  </div>
                ) : (
                  <div className="min-w-[350px]">
                    <Calendar
                      mode="single"
                      selected={startDate ? new Date(startDate + "T00:00:00") : undefined}
                      onSelect={(date) => {
                        const dateStr = date ? format(date, "yyyy-MM-dd") : "";
                        setStartDate(dateStr);
                        setEndDate(dateStr);
                        if (bookingType === "time_slot") setActiveField("time");
                        else setActiveField(null);
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      className="p-0 border-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-8 bg-border self-center" />

          {/* Who / Time */}
          <div
            onClick={() => setActiveField(bookingType === "time_slot" ? "time" : "who")}
            className={cn(
              "flex-1 text-left px-8 py-3 rounded-full transition-all cursor-pointer relative",
              (activeField === "time" || activeField === "who") ? "bg-card shadow-md" : "hover:bg-muted"
            )}
          >
            <div className="text-xs font-bold text-foreground tracking-wide uppercase">
              {bookingType === "time_slot" ? "Time" : "Who"}
            </div>
            <div className="text-sm font-normal text-muted-foreground truncate pt-0.5">
              {bookingType === "time_slot" ? (selectedTime || "Add time") : "Add guests"}
            </div>

            {activeField === "time" && bookingType === "time_slot" && (
              <div
                className="absolute top-[110%] right-0 bg-card rounded-3xl shadow-xl border border-border z-[100] p-6 w-56 animate-in fade-in slide-in-from-top-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-bold mb-4 px-2 tracking-wide uppercase">Select Time</div>
                <div className="grid grid-cols-1 gap-1 max-h-[300px] overflow-y-auto no-scrollbar px-1">
                  {Array.from({ length: 24 }, (_, h) =>
                    ["00", "30"].map((m) => {
                      const t = `${String(h).padStart(2, "0")}:${m}`;
                      return (
                        <button
                          key={t}
                          onClick={() => { setSelectedTime(t); setActiveField(null); }}
                          className={cn(
                            "px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-colors",
                            selectedTime === t ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          )}
                        >
                          {t}
                        </button>
                      );
                    })
                  ).flat()}
                </div>
              </div>
            )}

            {activeField === "who" && bookingType !== "time_slot" && (
              <div
                className="absolute top-[110%] right-0 bg-card rounded-3xl shadow-xl border border-border z-[100] p-8 w-80 animate-in fade-in slide-in-from-top-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <Users className="w-8 h-8 mx-auto mb-4 text-muted-foreground/30" />
                <div className="text-base font-bold mb-1">Add guests</div>
                <div className="text-sm text-muted-foreground">Select guest count for better results</div>
              </div>
            )}
          </div>

          {/* Search button */}
          <div className="p-2">
            <button
              onClick={(e) => { e.stopPropagation(); onSearch(); setActiveField(null); }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground h-14 md:px-6 md:w-auto w-14 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 group"
            >
              <Search className="w-5 h-5 md:mr-2" />
              <span className="font-bold text-sm hidden md:inline">Search</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
