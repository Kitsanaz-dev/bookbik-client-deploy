import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, addDays, startOfToday } from "date-fns";
import { LOCATIONS, COURTS } from "../data/mockData";
import { MapPin, ChevronRight, CheckCircle2, ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = LOCATIONS.find((l) => l.id === id);
  const today = startOfToday();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("pay_now"); // "pay_now" or "pay_at_venue"

  if (!location) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("booking.not_found") || "Booking Not Found"}
          </h2>
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 font-medium hover:underline"
          >
            {t("booking.return_home") || "Return Home"}
          </button>
        </div>
      </div>
    );
  }

  // Filter courts by location
  const availableCourts = COURTS.filter((c) => c.locationId === location.id);

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  // Mock time slots (10:00 to 22:00)
  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = 10 + i;
    return `${hour}:00`;
  });

  const selectedCourt = availableCourts.find((c) => c.id === selectedCourtId);

  const handleBooking = () => {
    if (selectedCourtId && selectedTimeSlot && selectedDate) {
      if (paymentMethod === "pay_now") {
        navigate("/payment", {
          state: {
            location,
            court: selectedCourt,
            date: selectedDate,
            time: selectedTimeSlot,
            paymentMethod
          },
        });
      } else {
        // If Pay at Venue, we probably skip the payment UI and go straight to confirmation
        // But for this mockup, we can either pass them to Payment to see a 'success' or navigate back to Home.
        alert("Booking confirmed with Pay at Venue!");
        navigate("/my-bookings");
      }
    }
  };

  const calculateTotal = () => {
    if (!selectedCourt) return 0;
    return selectedCourt.pricePerHour;
  };

  return (
    <div className="pb-32 animate-fade-in font-sans">
      {/* Header */}
      <div className="relative h-[300px] md:h-[400px] -mt-8 mb-8 md:mb-12">
        <img
          src={location.image}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        <div className="absolute top-6 left-4 md:left-8 z-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center text-white/90 hover:text-white transition-colors font-medium bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t("booking.return_home") || "Return Home"}
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-[1440px] mx-auto">
          <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold mb-4 border border-white/30">
            {t("booking.premium_venue") || "Premium Venue"}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
            {location.name}
          </h1>
          <div className="flex items-center text-gray-200 text-sm md:text-lg">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-indigo-400 shrink-0" />
            <span className="truncate">{location.address}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-16 animate-slide-up-delay-1">
          <div className="lg:col-span-2 space-y-12">
            {/* Step 1: Select Date */}
            <section>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3">
                  1
                </span>
                {t("booking.step.1") || "Select Day"}
              </h2>
              <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {dates.map((date, i) => {
                  const isSelected =
                    format(date, "yyyy-MM-dd") ===
                    format(selectedDate, "yyyy-MM-dd");
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedDate(date);
                        setSelectedTimeSlot(null);
                        setSelectedCourtId(null);
                      }}
                      className={`flex-shrink-0 w-20 p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105"
                          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-semibold uppercase mb-1">
                        {format(date, "EEE")}
                      </div>
                      <div className="text-2xl font-bold">
                        {format(date, "d")}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Choose Time */}
            {selectedDate && (
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3">
                    2
                  </span>
                  {t("booking.step.2") || "Choose Time"}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => {
                        setSelectedTimeSlot(time);
                        setSelectedCourtId(null);
                      }}
                      className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                        selectedTimeSlot === time
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105"
                          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Step 3: Pick Court/Unit */}
            {selectedTimeSlot && (
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3">
                    3
                  </span>
                  {t("booking.step.3") || "Choose Court"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCourts.length > 0 ? (
                    availableCourts.map((court) => (
                      <button
                        key={court.id}
                        onClick={() => setSelectedCourtId(court.id)}
                        className={`p-6 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          selectedCourtId === court.id
                            ? "border-indigo-600 bg-white ring-2 ring-indigo-100 shadow-lg"
                            : "border-gray-200 hover:border-indigo-300 hover:shadow-md bg-white"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {court.name}
                          </span>
                          {selectedCourtId === court.id && (
                            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          <span className="font-bold text-indigo-600 text-lg">
                            {court.pricePerHour.toLocaleString()} LAK
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                            / booking
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">
                      No options available for this selected time.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Step 4: Select Payment */}
            {selectedCourtId && (
              <section className="animate-fade-in">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm mr-3">
                    4
                  </span>
                  {t("booking.step.4") || "Select Payment Method"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod("pay_now")}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-center gap-2 ${
                      paymentMethod === "pay_now"
                        ? "border-indigo-600 bg-indigo-50 leading-tight ring-2 ring-indigo-100 shadow-lg"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                          <CreditCard className="w-5 h-5"/>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-none">Pay Now</div>
                          <div className="text-xs text-gray-500 mt-1">Online Payment Gateway</div>
                        </div>
                      </div>
                      {paymentMethod === "pay_now" && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("pay_at_venue")}
                    className={`p-5 rounded-2xl border text-left transition-all relative flex flex-col justify-center gap-2 ${
                      paymentMethod === "pay_at_venue"
                        ? "border-indigo-600 bg-indigo-50 leading-tight ring-2 ring-indigo-100 shadow-lg"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50 bg-white"
                    }`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <Banknote className="w-5 h-5"/>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 leading-none">Pay at Venue</div>
                          <div className="text-xs text-gray-500 mt-1">Cash or local transfer</div>
                        </div>
                      </div>
                      {paymentMethod === "pay_at_venue" && <CheckCircle2 className="w-6 h-6 text-indigo-600" />}
                    </div>
                  </button>
                </div>
              </section>
            )}
            
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div
              className={`sticky top-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100 transition-all duration-500 ${
                selectedCourtId && selectedTimeSlot
                  ? "opacity-100 translate-y-0"
                  : "opacity-50 translate-y-4"
              }`}
            >
              <h3 className="text-xl font-extrabold text-gray-900 mb-6">
                {t("booking.summary") || "Booking Summary"}
              </h3>

              <div className="space-y-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium whitespace-nowrap">
                    {t("booking.date") || "Date"}
                  </span>
                  <span className="font-bold text-gray-900 text-right">
                    {format(selectedDate, "MMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium whitespace-nowrap">
                    {t("booking.time") || "Time"}
                  </span>
                  <span className="font-bold text-gray-900 text-right">
                    {selectedTimeSlot || (t("booking.not_selected") || "Not selected")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium whitespace-nowrap">
                    {t("booking.court") || "Court"}
                  </span>
                  <span className="font-bold text-gray-900 text-right">
                    {selectedCourt
                      ? selectedCourt.name
                      : (t("booking.not_selected") || "Not selected")}
                  </span>
                </div>
                {selectedCourtId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium whitespace-nowrap">
                      Payment
                    </span>
                    <span className="font-bold text-gray-900 text-right">
                      {paymentMethod === "pay_now" ? "Pay Now" : "Pay at Venue"}
                    </span>
                  </div>
                )}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">
                    {t("booking.total") || "Total"}
                  </span>
                  <span className="text-2xl font-extrabold text-indigo-600">
                    {calculateTotal().toLocaleString()} LAK
                  </span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!selectedCourtId || !selectedTimeSlot || !selectedDate}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 flex items-center justify-center ${
                  selectedCourtId && selectedTimeSlot && selectedDate
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:scale-[1.02]"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {paymentMethod === 'pay_now' ? (t("booking.btn.confirm") || "Proceed to Payment") : "Confirm Booking"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
