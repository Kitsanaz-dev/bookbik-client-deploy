import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  ChevronRight,
  Loader2,
  Check,
  Star,
  MapPin,
  Phone,
  Clock,
  Users
} from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { businessAPI, serviceAPI, resourceAPI, bookingAPI, availabilityAPI } from "../services/api";
// Sub-components
import BusinessHeader from "../components/business/BusinessHeader";
import ServiceList from "../components/business/ServiceList";
import ResourceList from "../components/business/ResourceList";
import BookingDateTime from "../components/business/BookingDateTime";
import BookingSummary from "../components/business/BookingSummary";
import DateRangeResults from "../components/business/DateRangeResults";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import DateRangeBookingForm from "../components/booking/DateRangeBookingForm";
import ServiceMap from "../components/ServiceMap";

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceIdParam = queryParams.get("serviceId");
  const resourceIdParam = queryParams.get("resourceId");
  const startParam = queryParams.get("start");
  const endParam = queryParams.get("end");
  const timeParam = queryParams.get("time");
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking state
  const [step, setStep] = useState(1); // 1: Date, 2: Time, 3: Court
  const [selectedService, setSelectedService] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]); // All bookings for the service/date
  const [availability, setAvailability] = useState([]);
  const [availableRooms, setAvailableRooms] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const [nights, setNights] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("full");

  useEffect(() => {
    loadBusiness();
  }, [id]);

  const loadBusiness = async () => {
    setLoading(true);
    try {
      const [bizRes, svcRes, resRes] = await Promise.all([
        businessAPI.get(id),
        serviceAPI.list(id),
        resourceAPI.list(id),
      ]);
      const biz = bizRes.data.data;
      const svcs = svcRes.data.data;
      const rers = resRes.data.data;

      setBusiness(biz);
      setServices(svcs);
      setResources(rers);
      
      // Auto-select first service if only one exists or from URL
      if (serviceIdParam) {
        const svc = svcs.find(s => s._id === serviceIdParam);
        if (svc) setSelectedService(svc);
      } else if (svcs.length === 1) {
        setSelectedService(svcs[0]);
      }
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // Load service-wide bookings when date changes
  useEffect(() => {
    if (selectedService && selectedDate && selectedService.booking_type !== "date_range") {
      bookingAPI.checkAvailability({ 
        service_id: selectedService._id, 
        date: selectedDate 
      }).then((res) => {
        setBookedSlots(res.data.data || []);
      });
    }
  }, [selectedService, selectedDate]);

  const handleServiceSelect = (svc) => {
    setSelectedService(svc);
    setSelectedDate("");
    setSelectedTimes([]);
    setSelectedResource(null);
    if (svc.booking_type === "date_range") {
      setStep("date_range_form");
    } else {
      setStep(1); // Start at Date
    }
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  // Step handling
  const STEPS = [
    { label: "Date", key: 1 },
    { label: "Time", key: 2 },
    { label: "Court", key: 3 },
  ];

  const canGoToStep = (s) => {
    if (s === 1) return true;
    if (s === 2) return !!selectedDate;
    if (s === 3) return selectedTimes.length > 0;
    return false;
  };

  const completedSteps = {
    1: !!selectedDate,
    2: selectedTimes.length > 0,
    3: !!selectedResource,
  };

  // Generate time slots based on service-wide availability
  const generateTimeSlots = () => {
    if (!selectedDate || !selectedService) return [];

    const dayOfWeek = new Date(selectedDate).getDay();
    const serviceDays = selectedService.available_days || [0, 1, 2, 3, 4, 5, 6];
    if (!serviceDays.includes(dayOfWeek)) return [];

    // Filter resources that belong to this service
    const matchedResources = resources.filter((r) => 
        r.service_ids?.some((s) => s._id === selectedService._id || s === selectedService._id)
    );
    const totalResourceCount = matchedResources.length || 1;

    const duration = selectedService.duration_minutes;
    const bufferTime = selectedService.buffer_time || 0;

    // Manual mode
    if (selectedService.slot_mode === "manual" && selectedService.custom_slots?.length > 0) {
      return selectedService.custom_slots.map((slot) => {
        const slotStart = new Date(`${selectedDate}T${slot.start}:00`);
        const slotEnd = new Date(`${selectedDate}T${slot.end}:00`);
        
        // A slot is booked if ALL resources for this service are booked at this time
        const overlappingBookings = bookedSlots.filter((b) => {
          const bStart = new Date(b.start_datetime);
          const bEnd = new Date(b.end_datetime);
          return slotStart < bEnd && slotEnd > bStart;
        });

        const isFullyBooked = overlappingBookings.length >= totalResourceCount;

        return {
          time: slot.start,
          endTime: slot.end,
          label: `${slot.start} - ${slot.end}`,
          booked: isFullyBooked,
          availableCount: totalResourceCount - overlappingBookings.length
        };
      });
    }

    // Auto slots
    const openTime = selectedService.open_time || "09:00";
    const closeTime = selectedService.close_time || "17:00";
    const breakStart = selectedService.break_start;
    const breakEnd = selectedService.break_end;

    const toMinutes = (t) => {
        const [h, m] = t.split(":").map(Number);
        return h * 60 + m;
    };
    const toTime = (mins) => `${Math.floor(mins / 60).toString().padStart(2, "0")}:${(mins % 60).toString().padStart(2, "0")}`;

    const openMin = toMinutes(openTime);
    const closeMin = toMinutes(closeTime);
    const bsMin = breakStart ? toMinutes(breakStart) : null;
    const beMin = breakEnd ? toMinutes(breakEnd) : null;

    const slots = [];
    for (let m = openMin; m + duration <= closeMin; m += duration + bufferTime) {
      // Check for break overlap
      if (bsMin !== null && beMin !== null) {
          if (!(m + duration <= bsMin || m >= beMin)) continue;
      }

      const timeStr = toTime(m);
      const endStr = toTime(m + duration);
      const slotStart = new Date(`${selectedDate}T${timeStr}:00`);
      const slotEnd = new Date(`${selectedDate}T${endStr}:00`);

      const overlappingBookings = bookedSlots.filter((b) => {
        const bStart = new Date(b.start_datetime);
        const bEnd = new Date(b.end_datetime);
        return slotStart < bEnd && slotEnd > bStart;
      });

      const isFullyBooked = overlappingBookings.length >= totalResourceCount;

      slots.push({
        time: timeStr,
        endTime: endStr,
        label: `${timeStr} - ${endStr}`,
        booked: isFullyBooked,
        availableCount: totalResourceCount - overlappingBookings.length
      });
    }
    return slots;
  };

  const handleBook = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/business/${id}` } });
      return;
    }

    const actualPrice = (selectedResource?.price_override !== null && selectedResource?.price_override !== undefined) ? selectedResource.price_override : selectedService.price;
    const sortedTimes = [...selectedTimes].sort();
    
    const time_slots = sortedTimes.map(timeStr => {
        const startDatetime = new Date(`${selectedDate}T${timeStr}:00`);
        const endMinutes = startDatetime.getTime() + selectedService.duration_minutes * 60000;
        return {
            start_datetime: startDatetime.toISOString(),
            end_datetime: new Date(endMinutes).toISOString()
        };
    });
    
    const payload = {
      business_id: id,
      service_id: selectedService._id,
      resource_id: selectedResource._id,
      start_datetime: time_slots[0].start_datetime,
      end_datetime: time_slots[time_slots.length - 1].end_datetime,
      time_slots: time_slots,
      quantity: 1,
      payment_method: "full",
      booking_type: selectedService.booking_type,
      serviceName: selectedService.name,
      resourceName: selectedResource?.name,
      displayDate: format(new Date(selectedDate), "EEEE, MMM d, yyyy"),
      displayTime: sortedTimes.join(", "),
      totalPrice: actualPrice * sortedTimes.length,
      currency: selectedService.currency,
      location: { 
        name: business.business_name, 
        address: `${business.district}, ${business.province}`, 
        image: business.images?.[0] ? `${import.meta.env.VITE_API_BASE_URL}${business.images[0]}` : "/placeholder.svg" 
      },
      court: { 
        name: selectedResource?.name || selectedService.name, 
        pricePerHour: actualPrice * sortedTimes.length, 
        sportId: selectedService.name 
      },
      date: new Date(selectedDate),
      time: sortedTimes.join(", "),
    };

    navigate("/payment", { state: payload });
  };


  const handleDateRangeSearch = async (data) => {
    setSubmitting(true);
    try {
      setSearchParams(data);
      const res = await availabilityAPI.checkDates(selectedService._id, data.start_datetime.toISOString(), data.end_datetime.toISOString());
      setAvailableRooms(res.data.data);
      setNights(Math.max(1, Math.ceil((new Date(data.end_datetime) - new Date(data.start_datetime)) / (1000 * 60 * 60 * 24))));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to check availability.");
    } finally {
      setSubmitting(false);
    }
  };

  const proceedToBookDateRange = (resource) => {
    if (!isAuthenticated) return navigate("/login", { state: { from: `/business/${id}` } });
    const actualPrice = resource.price_override ?? selectedService.price;
    const finalQuantity = Math.min(searchParams.guests.rooms || 1, resource.available_quantity || 1);
    
    const payload = {
      business_id: id, service_id: selectedService._id, resource_id: resource.resource_id,
      start_datetime: searchParams.start_datetime.toISOString(), end_datetime: searchParams.end_datetime.toISOString(),
      quantity: finalQuantity, payment_method: "full", booking_type: selectedService.booking_type, serviceName: selectedService.name, resourceName: resource.name,
      displayDate: `${format(searchParams.start_datetime, "MMM d")} - ${format(searchParams.end_datetime, "MMM d, yyyy")}`,
      displayTime: `Check-in: 14:00 | Check-out: 12:00`, totalPrice: actualPrice * nights * finalQuantity, currency: selectedService.currency,
      location: { 
        name: business.business_name, 
        address: `${business.district}, ${business.province}`, 
        image: business.images?.[0] ? `${import.meta.env.VITE_API_BASE_URL}${business.images[0]}` : "/placeholder.svg" 
      },
      court: { 
        name: resource.name, 
        pricePerHour: actualPrice * nights * finalQuantity, 
        sportId: selectedService.name 
      },
      date: searchParams.start_datetime,
      time: `14:00 - 12:00`,
    };

    navigate("/payment", { state: payload });
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;
  if (!business) return null;

  const timeSlots = generateTimeSlots();
  const matchedResources = resources.filter((r) => r.service_ids?.some((s) => s._id === selectedService?._id || s === selectedService?._id));

  return (
    <div className="pb-32 bg-background min-h-screen">
      <BusinessHeader business={business} selectedService={selectedService} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 mt-6">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4 -ml-2 text-muted-foreground hover:text-primary group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("booking.return_home")}
        </Button>

        {/* Step Indicator */}
        {selectedService && selectedService.booking_type !== "date_range" && (
          <div className="flex items-center gap-1 sm:gap-2 bg-card p-3 sm:p-4 rounded-lg border border-border mb-8 shadow-sm">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => canGoToStep(s.key) && setStep(s.key)}
                  disabled={!canGoToStep(s.key)}
                  className="flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                    completedSteps[s.key] && step > s.key ? "bg-primary text-primary-foreground" : 
                    step === s.key ? "bg-primary text-primary-foreground ring-4 ring-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    {completedSteps[s.key] && step > s.key ? "✓" : s.key}
                  </div>
                  <span className={cn("text-sm sm:text-base font-semibold", step === s.key ? "text-primary" : "text-muted-foreground")}>
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/30 mx-1 sm:mx-2" />}
              </div>
            ))}
          </div>
        )}

        {/* Action: Change Service if selected */}
        {selectedService && !serviceIdParam && (
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-3">
                 <span className="text-2xl">{selectedService.icon}</span>
                 <div>
                    <h2 className="text-2xl font-bold">{selectedService.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                 </div>
             </div>
             <Button variant="outline" size="sm" onClick={() => setSelectedService(null)}>Change Service</Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {!selectedService ? (
                    <ServiceList services={services} onSelectService={handleServiceSelect} t={t} />
                ) : selectedService.booking_type === "date_range" ? (
                    <div className="space-y-6">
                        <DateRangeBookingForm business={business} selectedService={selectedService} onSearch={handleDateRangeSearch} />
                        <DateRangeResults availableRooms={availableRooms} selectedService={selectedService} nights={nights} searchParams={searchParams} submitting={submitting} onBook={proceedToBookDateRange} />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Step 1: Date */}
                        {step === 1 && (
                            <section className="bg-card rounded-xl border border-border p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-2xl font-bold mb-6">Select a Date</h2>
                                <div className="flex justify-center">
                                    <Calendar
                                        mode="single"
                                        selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
                                        onSelect={(d) => {
                                            if (!d) return;
                                            const dateStr = format(d, "yyyy-MM-dd");
                                            setSelectedDate(dateStr);
                                            setSelectedTimes([]);
                                            setSelectedResource(null);
                                            setStep(2);
                                        }}
                                        disabled={(d) => {
                                            const today = new Date(); today.setHours(0,0,0,0);
                                            if (d < today) return true;
                                            return !selectedService.available_days.includes(d.getDay());
                                        }}
                                        className="p-3 rounded-lg border border-border bg-card"
                                    />
                                </div>
                            </section>
                        )}

                        {/* Step 2: Time */}
                        {step === 2 && (
                            <section className="bg-card rounded-xl border border-border p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">Select Time</h2>
                                    <p className="text-lg font-medium text-muted-foreground">
                                        {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMM d, yyyy")}
                                    </p>
                                </div>
                                {timeSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {timeSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                disabled={slot.booked}
                                                onClick={() => {
                                                    setSelectedTimes(prev => 
                                                        prev.includes(slot.time) ? prev.filter(t => t !== slot.time) : [...prev, slot.time].sort()
                                                    );
                                                    setSelectedResource(null);
                                                }}
                                                className={cn(
                                                    "py-4 px-2 rounded-lg text-base font-bold border transition-all flex flex-col items-center",
                                                    slot.booked ? "bg-muted text-muted-foreground/30 cursor-not-allowed line-through border-transparent" :
                                                    selectedTimes.includes(slot.time) ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" :
                                                    "bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary/50"
                                                )}
                                            >
                                                <span>{slot.time}</span>
                                                <span className="text-sm font-normal opacity-60">
                                                    {slot.endStr ? `Ends ${slot.endStr}` : `${selectedService.duration_minutes}m`}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-10 bg-muted/20 rounded-lg border border-dashed border-border text-muted-foreground">
                                        No slots available on this date.
                                    </div>
                                )}
                                {selectedTimes.length > 0 && (
                                    <div className="mt-8 flex justify-end">
                                        <Button onClick={() => setStep(3)} className="px-10 h-14 rounded-lg text-lg font-bold">
                                            Next: Select Court <ChevronRight className="w-6 h-6 ml-1" />
                                        </Button>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* Step 3: Court */}
                        {step === 3 && (
                            <section className="bg-card rounded-xl border border-border p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4">
                                <h2 className="text-2xl font-bold mb-6">Select a Court</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {matchedResources.map((res) => {
                                        // Overlap check: is this resource booked during any of the selected times?
                                        const isResourceBooked = selectedTimes.some(timeStr => {
                                            const slotStart = new Date(`${selectedDate}T${timeStr}:00`);
                                            const slotEnd = new Date(slotStart.getTime() + selectedService.duration_minutes * 60000);
                                            return bookedSlots.some(b => {
                                                if (b.resource_id !== res._id) return false;
                                                const bStart = new Date(b.start_datetime);
                                                const bEnd = new Date(b.end_datetime);
                                                return slotStart < bEnd && slotEnd > bStart;
                                            });
                                        });

                                        return (
                                            <button
                                                key={res._id}
                                                disabled={isResourceBooked}
                                                onClick={() => setSelectedResource(res)}
                                                className={cn(
                                                    "rounded-lg border text-left transition-all overflow-hidden group h-full flex flex-col",
                                                    isResourceBooked ? "opacity-50 cursor-not-allowed grayscale" : 
                                                    selectedResource?._id === res._id ? "border-primary ring-4 ring-primary/20 shadow-xl" : "border-border hover:border-primary/50 shadow-sm"
                                                )}
                                            >
                                                <div className="h-40 overflow-hidden relative">
                                                    <img 
                                                        src={res.image ? (res.image.startsWith('http') ? res.image : `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${res.image}`) : "https://via.placeholder.com/400x200?text=No+Image"} 
                                                        alt={res.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                    />
                                                    {isResourceBooked && (
                                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                            <span className="bg-destructive text-destructive-foreground px-4 py-1.5 rounded-lg text-base font-black uppercase tracking-tighter shadow-lg ring-2 ring-white">Already Booked</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-5 flex-1 flex flex-col bg-background">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{res.name}</h3>
                                                        {selectedResource?._id === res._id && <Check className="w-5 h-5 text-primary" />}
                                                    </div>
                                                     <div className="mt-auto pt-4 border-t border-border/50 flex justify-between text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                                                        <span>{res.resource_type}</span>
                                                        <span>Cap: {res.capacity}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>

            <div className="lg:col-span-1">
                <div className="sticky top-6">
                    <BookingSummary 
                      selectedService={selectedService} selectedResource={selectedResource} 
                      selectedDate={selectedDate} selectedTimes={selectedTimes} 
                      step={step} nights={nights} searchParams={searchParams} 
                      submitting={submitting} t={t} onBook={handleBook} 
                    />
                </div>
            </div>
        </div>
      </div>

    </div>
  );
}