import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  CreditCard,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Trophy,
  CheckCircle2,
  PartyPopper,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import axios from "axios";
import { bookingAPI } from "../services/api";

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Check if this is a date range booking - check multiple possible fields
  const isDateRangeBooking =
    state?.booking_type === "date_range" ||
    state?.displayTime?.includes("Check-in");

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("full");
  const [showDemoModal, setShowDemoModal] = useState(false);
  const { t } = useLanguage();

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No booking details found.</p>
          <button
            onClick={() => navigate("/")}
            className="text-indigo-600 font-bold hover:underline"
          >
            {t("booking.return_home") || "Return Home"}
          </button>
        </div>
      </div>
    );
  }

  const { location, court, date, time } = state;
  const fullPrice = court.pricePerHour;
  const halfPrice = Math.ceil(fullPrice / 2);
  const payAmount =
    isDateRangeBooking || paymentMethod === "full" ? fullPrice : halfPrice;

  const BASE_URL = "https://payment-gateway.phajay.co";
  const KEY = "$2a$10$Wu4DnsWSZZP12nXutDAWeu9CAdcoY5ZhXzrgdRiVg/Y5lwM5e92ai";

  const handlePayment = async (isDemo = false) => {
    setIsProcessing(true);

    try {
      // 1. Create booking in DB
      const apiPayload = { ...state };
      delete apiPayload.location;
      delete apiPayload.court;
      delete apiPayload.date;
      delete apiPayload.time;
      delete apiPayload.serviceName;
      delete apiPayload.resourceName;
      delete apiPayload.displayDate;
      delete apiPayload.displayTime;
      delete apiPayload.totalPrice;
      delete apiPayload.currency;
      delete apiPayload.booking_type;

      apiPayload.payment_method = paymentMethod;

      const res = await bookingAPI.create(apiPayload);
      const created = res.data.data;
      const firstId = Array.isArray(created) ? created[0]._id : created._id;

      // 2. Process external payment gateway
      if (
        !isDemo &&
        (paymentMethod === "full" || paymentMethod === "half") &&
        payAmount > 0
      ) {
        const authToken = `Basic ${btoa(KEY)}`;
        const orderNo = firstId || Date.now().toString();
        const gatewayAmount = Math.min(Number(payAmount), 1); // DeV max 1 kip

        const data = {
          amount: gatewayAmount,
          description: `Booking ${orderNo}`,
          orderNo: orderNo,
          tag1: firstId,
        };

        const headers = {
          "Content-Type": "application/json",
          Authorization: authToken,
        };

        try {
          const response = await axios.post(
            `${BASE_URL}/v1/api/link/payment-link`,
            data,
            { headers },
          );
          const { redirectURL } = response.data;

          if (redirectURL) {
            window.location.href = redirectURL;
            return;
          } else {
            throw new Error("No redirect URL received");
          }
        } catch (gatewayError) {
          // If gateway fails or rejects the payload, delete the draft backend booking!
          if (firstId) {
            try {
              await bookingAPI.deleteDraft(firstId);
            } catch (cleanupErr) {
              console.error("Failed to cleanup draft booking:", cleanupErr);
            }
          }
          throw gatewayError; // Bubble up to outer catch for alert UI
        }
      }

      // If it's a demo, use a bypass linkCode and mark as paid on backend
      const queryParam = isDemo
        ? `?linkCode=demo_bypass&orderNo=${firstId}`
        : "";

      if (isDemo && firstId) {
        try {
          await bookingAPI.confirmPayment(firstId);
        } catch (confirmErr) {
          console.error("Demo confirmation failed:", confirmErr);
        }
      }

      navigate(`/booking-confirmation/${firstId}${queryParam}`);
    } catch (error) {
      console.error("Error creating payment link:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        alert(
          `Payment failed: ${error.response.data.message || "Bad Request"}`,
        );
      } else {
        alert("Payment initialization failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-screen max-w-none px-0 py-0 animate-fade-in bg-background">
      <div className="px-4 sm:px-8 py-12">
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

        {/* Grid: Stacks on mobile, Side-by-side on desktop */}
        <div className="grid md:grid-cols-5 gap-6 max-w-6xl mx-auto">
          {/* Right Col (Booking Receipt) - Shows FIRST on mobile via order-first */}
          <div className="md:col-span-2 order-first md:order-last">
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-200 border border-gray-100 overflow-hidden relative">
              {/* Decorative Ticket Circles */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gray-50 rounded-full -mt-3"></div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-indigo-400" />
                <h3 className="font-bold text-lg">
                  {t("payment.receipt.title") || "Booking Receipt"}
                </h3>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-start">
                  <img
                    src={location.image}
                    alt="Venue"
                    className="w-16 h-16 rounded-lg object-cover mr-4"
                  />
                  <div>
                    <div className="font-bold text-gray-900">
                      {location.name}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <MapPin className="w-3 h-3 mr-1" />
                      {location.address}
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4"></div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />{" "}
                      {t("booking.date") || "Date"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {format(date, "MMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />{" "}
                      {t("booking.time") || "Time"}
                    </span>
                    <span className="font-semibold text-gray-900">{time}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 flex items-center">
                      <Trophy className="w-4 h-4 mr-2" />{" "}
                      {court.sportId || t("booking.service") || "Service"}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {court.name}
                    </span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4"></div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t("payment.subtotal") || "Subtotal"}</span>
                    <span>{court.pricePerHour.toLocaleString()} LAK</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t("payment.service_fee") || "Service Fee"}</span>
                    <span>0 LAK</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="font-bold text-gray-900">
                      {t("payment.total") || "Total"}
                    </span>
                    <span className="text-xl font-extrabold text-indigo-600">
                      {payAmount.toLocaleString()} LAK
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Col (Payment Info) - Shows SECOND on mobile */}
          <div className="md:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-2">
                {t("payment.checkout") || "Checkout"}
              </h1>
              <p className="text-gray-500 mb-8">
                {t("payment.subtitle") || "Complete your secure payment"}
              </p>

              <div className="space-y-2">
                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 flex items-start">
                  <ShieldCheck className="w-8 h-8 text-indigo-600 mr-4 shrink-0" />
                  <div>
                    <h3 className="font-bold text-indigo-900">
                      {t("payment.secure.title") || "Secure Payment"}
                    </h3>
                    <p className="text-sm text-indigo-700 mt-1">
                      {t("payment.secure.desc") ||
                        "Your payment is secured and encrypted by our payment gateway."}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6"></div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">
                    Select Payment Plan
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* Full Payment Option */}
                    <button
                      onClick={() => setPaymentMethod("full")}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${isDateRangeBooking ? "md:col-span-2" : ""} ${
                        paymentMethod === "full"
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">
                          Full Payment (100%)
                        </span>
                        <ShieldCheck
                          className={`w-5 h-5 ${paymentMethod === "full" ? "text-indigo-600" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="font-extrabold text-indigo-600 mb-2">
                        {fullPrice.toLocaleString()} LAK
                      </div>
                      <p className="text-xs text-gray-500 leading-tight">
                        ✅ Your court is <strong>guaranteed</strong>. No early
                        cancellation by the admin.
                      </p>
                    </button>

                    {/* Half Payment Option - Only show for non-date-range bookings */}
                    <button
                      onClick={() => {
                        if (!isDateRangeBooking) {
                          setPaymentMethod("half");
                        }
                      }}
                      disabled={isDateRangeBooking}
                      style={{ display: isDateRangeBooking ? "none" : "block" }}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        !isDateRangeBooking && paymentMethod === "half"
                          ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-gray-900">
                          Half Payment (50%)
                        </span>
                        <ShieldCheck
                          className={`w-5 h-5 ${!isDateRangeBooking && paymentMethod === "half" ? "text-indigo-600" : "text-gray-400"}`}
                        />
                      </div>
                      <div className="font-extrabold text-indigo-600 mb-2">
                        {halfPrice.toLocaleString()} LAK
                      </div>
                      <p className="text-xs text-gray-500 leading-tight">
                        ⚠️ The admin can cancel if you arrive late.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-6"></div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">
                    {t("payment.method") || "Payment Method"}
                  </h3>
                  <div className="p-4 border-2 border-indigo-600 bg-indigo-50/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-xs mr-4">
                        PAY
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {t("payment.wallet") || "Online Payment Hub"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {t("payment.wallet.desc") ||
                            "Pay securely via your preferred App"}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => handlePayment(false)}
                  disabled={isProcessing}
                  className={`w-full py-4 rounded-xl flex items-center justify-center font-bold text-lg shadow-xl shadow-indigo-100 transition-all transform duration-200 ${
                    isProcessing
                      ? "bg-gray-100 text-gray-400 cursor-wait scale-95"
                      : "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:shadow-indigo-200 hover:-translate-y-1 active:scale-95"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-3"></div>
                      {t("payment.btn.processing") || "Processing..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6 mr-2" />
                      {t("payment.btn.pay") || "Pay"}{" "}
                      {payAmount.toLocaleString()} LAK
                    </>
                  )}
                </button>

                {/* Demo Bypass Button */}
                <button
                  onClick={() => setShowDemoModal(true)}
                  disabled={isProcessing}
                  className="w-full mt-4 py-3 rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <PartyPopper className="w-5 h-5" />
                  Demo: Simulate Success
                </button>

                <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
                  <Lock className="w-3 h-3 mr-1" />
                  {t("payment.encrypted") ||
                    "Payments are secure and encrypted"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Demo Confirmation Modal */}
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">
                  Simulate Payment?
                </h3>
                <p className="text-gray-500 leading-relaxed mb-8">
                  This will create a real booking in the database for your demo,
                  but it will skip the external payment gateway.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowDemoModal(false);
                      handlePayment(true);
                    }}
                    className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                  >
                    Yes, Confirm Demo
                  </button>
                  <button
                    onClick={() => setShowDemoModal(false)}
                    className="w-full py-3 rounded-2xl bg-gray-50 text-gray-400 font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
