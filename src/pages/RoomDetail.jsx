import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Share, Heart, ChevronLeft, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoGallery from "@/components/booking/PhotoGallery";
import PropertyInfo from "@/components/booking/PropertyInfo";
import AmenitiesList from "@/components/booking/AmenitiesList";
import ReviewsSection from "@/components/booking/ReviewsSection";
import HostSection from "@/components/booking/HostSection";
import BookingCard from "@/components/booking/BookingCard";
import LocationMap from "@/components/booking/LocationMap";
import Navbar from "@/components/Navbar";
import { resourceAPI, bookingAPI, serviceAPI } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function RoomDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [resource, setResource] = useState(null);
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [disabledDates, setDisabledDates] = useState([]);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await resourceAPI.get(id);
        const resourceData = res.data.data;
        setResource(resourceData);

        // Fetch service if serviceId is provided in URL
        const svcId = searchParams.get("serviceId");
        if (svcId) {
          const svcRes = await serviceAPI.get(svcId);
          if (svcRes.data.success) setService(svcRes.data.data);
        }

        // Fetch bookings to disable dates
        const bookingsRes = await bookingAPI.getResourceCalendar(id);
        if (bookingsRes.data.success) {
          const bookings = bookingsRes.data.data;
          const dates = [];
          const counts = {}; // date_string -> total_quantity

          bookings.forEach((b) => {
            const start = new Date(b.start_datetime);
            const end = new Date(b.end_datetime);
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split("T")[0];
              counts[dateStr] = (counts[dateStr] || 0) + (b.quantity || 1);
            }
          });

          // If quantity booked >= resource quantity, the date is unavailable
          const totalQty = resourceData.quantity || 1;
          Object.keys(counts).forEach((dateStr) => {
            if (counts[dateStr] >= totalQty) {
              dates.push(new Date(dateStr));
            }
          });
          setDisabledDates(dates);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, searchParams]);

  const handleReserve = async (bookingData) => {
    if (!user) {
      navigate("/login", {
        state: {
          from: `/room/${id}`,
          serviceId: searchParams.get("serviceId"),
        },
      });
      return;
    }

    try {
      setSubmitting(true);

      const checkIn = new Date(bookingData.checkIn);
      const checkOut = new Date(bookingData.checkOut);
      const nights = Math.max(
        1,
        Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
      );
      const unitPrice = resource.price_override || service?.price || 0;
      const totalPrice = unitPrice * nights;

      // Sum adults and children for total guest count
      const totalGuests =
        (bookingData.guests.adults || 0) + (bookingData.guests.children || 0);

      const payload = {
        business_id: resource.business_id?._id || resource.business_id,
        service_id: searchParams.get("serviceId"),
        resource_id: id,
        start_datetime: checkIn.toISOString(),
        end_datetime: checkOut.toISOString(),
        total_price: totalPrice,
        currency: service?.currency || "LAK",
        guests: totalGuests,
        guest_details: bookingData.guests,
        payment_method: "full",
        // Receipt info for Payment.jsx
        location: {
          name: resource.business_id?.business_name || "Business",
          address: resource.business_id
            ? `${resource.business_id.district || ""}, ${resource.business_id.province || ""}`
            : "Vientiane, Laos",
          image: resource.business_id?.image
            ? resource.business_id.image.startsWith("http")
              ? resource.business_id.image
              : `http://localhost:3000${resource.business_id.image}`
            : "/images/placeholder.jpg",
        },
        court: {
          name: resource.name,
          pricePerHour: totalPrice, // Payment.jsx uses this field for total
          sportId: service?.name || "Stay",
        },
        date: checkIn,
        time: `Check-in: 14:00 | ${nights} night${nights !== 1 ? "s" : ""}`,
      };

      navigate("/payment", { state: payload });
    } catch (err) {
      console.error("Navigation to payment failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Resource not found</h1>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    );
  }

  // Fallback images if none provided
  const images =
    resource.images && resource.images.length > 0
      ? resource.images
      : [resource.image || "/images/placeholder.jpg"];

  return (
    <div className="min-h-screen  bg-background font-sans selection:bg-primary/20">
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div className="space-y-2">
          <button
  onClick={() => navigate(-1)}
  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
  text-blue-600
  border border-blue-500
  px-3 py-1.5 rounded-md
  hover:bg-blue-500 hover:text-white
  transition-all duration-200 mb-2 group cursor-pointer"
>
  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
  Back
</button>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
              {resource.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-foreground">
                  {resource.rating?.toFixed(1) || "5.0"}
                </span>
                <span className="text-muted-foreground underline">
                  ({resource.review_count || 0} reviews)
                </span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="underline text-foreground cursor-pointer hover:text-muted-foreground transition-colors">
                {resource.location_text || "Vientiane, Laos"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="font-bold underline text-foreground flex items-center gap-2 hover:bg-muted/50 rounded-lg h-10"
            >
              <Share className="w-4 h-4" /> Share
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`font-bold underline flex items-center gap-2 hover:bg-muted/50 rounded-lg h-10 transition-colors ${liked ? "text-primary" : "text-foreground"}`}
              onClick={() => setLiked(!liked)}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />{" "}
              {liked ? "Saved" : "Save"}
            </Button>
          </div>
        </div>

        {/* Gallery */}
        <div className="mb-10">
          <PhotoGallery images={images} title={resource.name} />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 relative">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            <PropertyInfo
              title={resource.name}
              guests={resource.capacity || 1}
              bedrooms={resource.bedrooms || 1}
              beds={resource.beds || 1}
              baths={resource.baths || 1}
              rating={resource.rating || 5.0}
              reviewCount={resource.review_count || 0}
              hostName={resource.host_name}
              hostYears={resource.host_years}
              description={resource.description || resource.host_intro}
              isSuperhost={resource.is_superhost}
              hostAvatar={resource.host_avatar}
            />

            <AmenitiesList amenities={resource.amenities} />

            <LocationMap address={resource.location_text} />

            <ReviewsSection
              rating={resource.rating}
              count={resource.review_count}
            />

            <HostSection
              hostName={resource.host_name}
              hostYears={resource.host_years}
              hostIntro={resource.host_intro}
              isSuperhost={resource.is_superhost}
              hostAvatar={resource.host_avatar}
              rating={resource.rating}
              reviewCount={resource.review_count}
              hostResponseRate={resource.host_response_rate}
              hostResponseTime={resource.host_response_time}
              hostLanguages={resource.host_languages}
            />
          </div>

          {/* Right Column: Booking Card (Sticky) */}
          <div className="relative">
            <BookingCard
              price={
                resource.price_override ||
                service?.price ||
                resource.service_ids?.[0]?.price ||
                0
              }
              currency={
                service?.currency ||
                resource.service_ids?.[0]?.currency ||
                "LAK"
              }
              disabledDates={disabledDates}
              rating={resource.rating}
              reviewCount={resource.review_count}
              onReserve={handleReserve}
              submitting={submitting}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
