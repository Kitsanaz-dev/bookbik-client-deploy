import { useState, useMemo, useEffect } from "react";
import { Loader2, LayoutGrid, Map as MapIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import ServiceCard from "../components/ServiceCard";
import ServiceMap from "../components/ServiceMap";
import SearchBar from "../components/SearchBar";
import CategoryBar from "../components/CategoryBar";
import { CATEGORIES } from "../data/mockData";
import { serviceAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import FilterModal from "../components/FilterModal";

export default function Home() {

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("all");

  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [showMap, setShowMap] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    typeOfPlace: "any",
    bookingType: "any",
    bedrooms: 0,
    beds: 0,
    bathrooms: 0,
    amenities: [],
    propertyType: "any",
    difficulty: "any",
    sportType: "any",
    sportBookingType: "any",
  });

  const [visibleItems, setVisibleItems] = useState(20);

  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [disableScrollCollapse, setDisableScrollCollapse] = useState(false);

  const { t } = useLanguage();

  /* ---------------- Fetch Services ---------------- */

  const fetchServices = async () => {
    setLoading(true);

    try {
      const res = await serviceAPI.list();
      setServices(res.data.data);
    } catch (err) {
      console.error("Failed to fetch services", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Initial Load ---------------- */

  useEffect(() => {
    fetchServices();
  }, []);

  /* ---------------- Smart Scroll Collapse ---------------- */

  useEffect(() => {

    const handleScroll = () => {

      if (disableScrollCollapse) return;

      if (window.scrollY > 50 && isSearchExpanded) {
        setIsSearchExpanded(false);
      }

    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);

  }, [isSearchExpanded, disableScrollCollapse]);

  /* ---------------- Booking Type ---------------- */

  const bookingType = useMemo(() => {

    if (selectedCategory === "Stay") return "date_range";

    if (selectedCategory === "Sports") return "time_slot";

    return "general";

  }, [selectedCategory]);

  /* ---------------- Filter Services ---------------- */

  const filteredServices = useMemo(() => {

    let data = [...services];

    if (selectedCategory !== "all") {
      data = data.filter((s) => s.category === selectedCategory);
    }

    if (startDate) {
      const searchDay = new Date(startDate).getDay();

      data = data.filter(
        (s) => !s.available_days || s.available_days.includes(searchDay)
      );
    }

    if (searchQuery) {

      const q = searchQuery.toLowerCase();

      data = data.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.province?.toLowerCase().includes(q) ||
        s.district?.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.business_id?.business_name?.toLowerCase().includes(q)
      );

    }

    // --- Flexible Match Scoring System (Match >= 70%) ---
    let activeFiltersCount = 0;

    // Determine which filters are actually active
    const hasMinPrice = filters.minPrice !== "" && Number(filters.minPrice) > 0;
    const hasMaxPrice = filters.maxPrice !== "" && Number(filters.maxPrice) > 0;
    const hasBedrooms = filters.bedrooms > 0;
    const hasBeds = filters.beds > 0;
    const hasBathrooms = filters.bathrooms > 0;
    const hasPropertyType = filters.propertyType !== "any";
    const hasDifficulty = filters.difficulty !== "any";
    const hasSportType = filters.sportType !== "any";
    const hasSportBookingType = filters.sportBookingType !== "any";
    const hasBookingType = filters.bookingType !== "any";
    const hasAmenities = filters.amenities && filters.amenities.length > 0;

    if (hasMinPrice) activeFiltersCount++;
    if (hasMaxPrice) activeFiltersCount++;
    if (hasBedrooms) activeFiltersCount++;
    if (hasBeds) activeFiltersCount++;
    if (hasBathrooms) activeFiltersCount++;
    if (hasPropertyType) activeFiltersCount++;
    if (hasDifficulty) activeFiltersCount++;
    if (hasSportType) activeFiltersCount++;
    if (hasSportBookingType) activeFiltersCount++;
    if (hasBookingType) activeFiltersCount++;
    if (hasAmenities) activeFiltersCount += filters.amenities.length; // Count each amenity as a filter requirement

    // If no flexible filters are selected, return the base data (only searched/date filtered)
    if (activeFiltersCount === 0) return data;

    // Calculate match score for each service
    data = data.filter(s => {
      let score = 0;
      const priceToUse = s.price || s.pricePerHour || 0;

      if (hasMinPrice && priceToUse >= Number(filters.minPrice)) score++;
      if (hasMaxPrice && priceToUse <= Number(filters.maxPrice)) score++;
      if (hasBedrooms && (s.bedrooms || 0) >= filters.bedrooms) score++;
      if (hasBeds && (s.beds || 0) >= filters.beds) score++;
      if (hasBathrooms && (s.bathrooms || 0) >= filters.bathrooms) score++;
      if (hasPropertyType && s.property_type?.toLowerCase() === filters.propertyType.toLowerCase()) score++;
      if (hasDifficulty && s.difficulty === filters.difficulty) score++;
      
      if (hasSportType) {
        const query = filters.sportType.toLowerCase();
        if ((s.name?.toLowerCase().includes(query)) || (s.category?.toLowerCase() === query)) {
          score++;
        }
      }

      if (hasSportBookingType && s.slot_type === filters.sportBookingType) score++;
      if (hasBookingType && s.booking_type === filters.bookingType) score++;
      
      if (hasAmenities) {
        const serviceAmenities = s.amenities || [];
        filters.amenities.forEach(amenity => {
          if (serviceAmenities.includes(amenity)) {
            score++;
          }
        });
      }

      const matchPercentage = score / activeFiltersCount;
      return matchPercentage >= 0.70; // 70% threshold
    });

    return data;

  }, [services, selectedCategory, searchQuery, startDate, filters]);

  /* ---------------- Display Items ---------------- */

  const displayItems = useMemo(() => {

    const items = [];

    filteredServices.forEach((svc) => {

      if (svc.booking_type === "date_range" && svc.resources?.length > 0) {

        svc.resources.forEach((res) => {

          items.push({
            svc,
            res,
            key: `${svc._id}_${res._id}`
          });

        });

      } else {

        items.push({
          svc,
          key: svc._id
        });

      }

    });

    return items;

  }, [filteredServices]);

  /* ---------------- Expand Search ---------------- */

  const handleExpandSearch = () => {

    setIsSearchExpanded(true);

    setShowMap(true);
    setDisableScrollCollapse(true);

    setTimeout(() => {
      setDisableScrollCollapse(false);
    }, 800);

  };

  /* ---------------- Map Context ---------------- */

  const isFiltered = useMemo(() => {
    const hasActiveFilters = Object.values(filters).some(v => 
      v !== "" && v !== "any" && v !== 0 && (Array.isArray(v) ? v.length > 0 : true)
    );
    return searchQuery.length > 0 || selectedCategory !== "all" || startDate !== "" || hasActiveFilters;
  }, [searchQuery, selectedCategory, startDate, filters]);

  // Sync category with booking type
  useEffect(() => {
    if (filters.bookingType === "date_range") {
      setSelectedCategory("Stay");
    } else if (filters.bookingType === "time_slot") {
      // Keep category as is if it's already an experience category, 
      // or default to Sports if it's "all" or "Stay"
      if (selectedCategory === "all" || selectedCategory === "Stay") {
        setSelectedCategory("Sports");
      }
    } else if (filters.bookingType === "any") {
      setSelectedCategory("all");
    }
  }, [filters.bookingType]);

  useEffect(() => {
    if (selectedCategory === "Stay") {
      setFilters(prev => ({ ...prev, bookingType: "date_range" }));
    } else if (selectedCategory === "Sports") {
      setFilters(prev => ({ ...prev, bookingType: "time_slot" }));
    } else if (selectedCategory === "all") {
      setFilters(prev => ({ ...prev, bookingType: "any" }));
    }
  }, [selectedCategory]);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex flex-col bg-background relative">

      {/* Header */}

      <header
        className={`sticky top-[96px] z-[100] bg-background/80 backdrop-blur-xl border-b border-border/40 transition-all duration-300 ${
          isSearchExpanded ? "py-6" : "py-3"
        }`}
      >

        <div className="max-w-[1550px] mx-auto px-6">
          <div className="flex items-center justify-center gap-2">
            <div className={`transition-all duration-500 ease-in-out ${isSearchExpanded ? "max-w-4xl w-full" : "max-w-[420px] flex-1"}`}>
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                bookingType={bookingType}
                collapsed={!isSearchExpanded}
                onExpand={handleExpandSearch}
                onSearch={() => {
                  fetchServices();
                  setIsSearchExpanded(false);
                  setShowMap(true);
                }}
              />
            </div>

            <div className="shrink-0 flex items-center">
              <FilterModal 
                filters={filters} 
                setFilters={setFilters} 
                totalResults={displayItems.length}
              />
            </div>
          </div>

          {isSearchExpanded && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <CategoryBar
                categories={CATEGORIES}
                selected={selectedCategory}
                onSelect={setSelectedCategory}
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}

      <main className="flex-1 flex relative m-10">

        {/* List */}

        <div className="flex-1 transition-all duration-500 w-full">

          <div className="max-w-[1800px] mx-auto px-12 py-12 sm:py-22 pb-22">

            {loading ? (

              <div className="flex flex-col items-center justify-center py-40 space-y-4">

                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />

                <p className="text-muted-foreground font-bold animate-pulse text-sm uppercase tracking-widest">
                  Searching...
                </p>

              </div>

            ) : displayItems.length > 0 ? (

              <div className="space-y-6">
                <h3 className="text-2xl font-black text-foreground tracking-tighter">{displayItems.length} Services Found</h3>
                <div
                  className={`grid gap-x-6 gap-y-8 ${
                    showMap
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
                      : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
                  }`}
                >
                  {displayItems.slice(0, visibleItems).map((item, i) => (
                    <div
                      key={item.key}
                      onMouseEnter={() => setHoveredId(item.key)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <ServiceCard
                        service={item.svc}
                        resource={item.res}
                        startDate={startDate}
                        endDate={endDate}
                        selectedTime={selectedTime}
                        isHighlighted={hoveredId === item.key}
                      />
                    </div>
                  ))}
                </div>

                {displayItems.length > visibleItems && (
                  <div className="flex flex-col items-center gap-4 pt-8 animate-in fade-in slide-in-from-top-4 duration-700">
                    <p className="text-sm font-medium text-muted-foreground">
                      Showing {visibleItems} of {displayItems.length} results
                    </p>
                    <button
                      onClick={() => setVisibleItems(prev => prev + 20)}
                      className="px-8 py-3.5 rounded-2xl border-2 border-foreground bg-foreground text-background font-black text-sm hover:bg-background hover:text-foreground transition-all active:scale-95 shadow-lg shadow-foreground/10"
                    >
                      Show more results
                    </button>
                  </div>
                )}
              </div>

            ) : (

              <div className="text-center py-40 bg-card rounded-[32px] border border-dashed border-border/60">

                <h3 className="text-xl font-black mb-2">No results found</h3>

                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="font-bold text-primary"
                >
                  Clear filters
                </Button>

              </div>

            )}

          </div>

        </div>

        {/* Map */}

        <div
          className={`hidden lg:block transition-all duration-500 ease-in-out border-l border-border/40 bg-muted/20 ${
            isFullscreen 
              ? "fixed inset-0 z-[101] w-full h-full bg-background" 
              : (showMap ? "w-[35%] xl:w-[45%] opacity-100" : "w-0 opacity-0 overflow-hidden border-none")
          }`}
        >

          <div className={`${isFullscreen ? "h-full" : "sticky top-[100px] h-[calc(100vh-100px)]"} overflow-hidden`}>

            <ServiceMap
              services={displayItems}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              isFiltered={isFiltered}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />

          </div>

        </div>

      </main>

      {/* Map Toggle Button */}

      <button
        onClick={() => setShowMap(!showMap)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-[#222] hover:bg-black text-white px-6 py-3.5 rounded-full flex items-center gap-2 shadow-xl hover:scale-105 active:scale-95 transition-all font-bold text-sm"
      >

        {showMap ? (
          <>
            <LayoutGrid className="w-4 h-4" />
            Show list
          </>
        ) : (
          <>
            <MapIcon className="w-4 h-4" />
            Show map
          </>
        )}

      </button>

    </div>
  );
}