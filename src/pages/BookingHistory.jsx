import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Loader2,
  ChevronDown,
  ChevronUp,
  MapPin,
  CreditCard,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Banknote,
  ImagePlus,
  X,
  XCircle,
} from "lucide-react";
import axios from "axios";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { bookingAPI } from "../services/api";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

const STATUS_COLORS = {
  pending: "warning",
  confirmed: "default",
  completed: "success",
  cancelled: "destructive",
  no_show: "secondary",
};

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No Show",
};

function BookingCard({ booking, onUpdate }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPostponeModal, setShowPostponeModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [postponeDate, setPostponeDate] = useState("");
  const [postponeTime, setPostponeTime] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Refund states
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankQrFile, setBankQrFile] = useState(null);
  const [bankQrPreview, setBankQrPreview] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Check if this booking needs payment (pending + unpaid + gateway method)
  const needsPayment =
    booking.status === "pending" &&
    booking.payment_status === "unpaid" &&
    ["full", "half"].includes(booking.payment_method);

  const copyCode = () => {
    if (booking.verification_code) {
      navigator.clipboard.writeText(booking.verification_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrPayload = booking.verification_code
    ? JSON.stringify({
        code: booking.verification_code,
        booking_id: booking._id,
        service: booking.service_id?._id || booking.service_id,
        date: booking.start_datetime,
      })
    : null;

  const isPaid = booking.payment_status === "paid";
  const isActive = ["pending", "confirmed"].includes(booking.status);

  // Safe date parsing
  const safeDate = (d) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? null : date;
  };

  const startDate = safeDate(booking.start_datetime);
  const endDate = safeDate(booking.end_datetime);
  const now = new Date();

  const daysUntilStart = startDate
    ? (startDate - now) / (1000 * 60 * 60 * 24)
    : -1;
  const canModify = isActive && startDate && daysUntilStart >= 5;
  const canPostpone = canModify && (booking.postpone_count || 0) < 2;

  const formatDateLabel = () => {
    if (!startDate) return "Invalid Date";
    if (booking.service_id?.booking_type === "date_range" && endDate) {
      return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    return format(startDate, "MMM d, yyyy");
  };

  const formatTimeLabel = () => {
    if (!startDate || !endDate) return "";
    if (booking.sessions?.length > 1) {
      return `${booking.sessions.length} Slots: ${booking.sessions
        .map((s) => {
          const d = safeDate(s.start_datetime);
          return d ? format(d, "HH:mm") : "??:??";
        })
        .join(", ")}`;
    }
    return `${format(startDate, "HH:mm")} - ${format(endDate, "HH:mm")}`;
  };

  // Calculate Calendar Constraints for Postpone
  const minDateFromStart = startDate ? new Date(startDate) : new Date();
  if (startDate) minDateFromStart.setDate(minDateFromStart.getDate() + 5);

  const minDateFromEnd = endDate ? new Date(endDate) : new Date();
  if (endDate) minDateFromEnd.setDate(minDateFromEnd.getDate() + 1);

  // The min date must be both > 5 days from start AND the day after the old booking ends
  const minDateObj =
    minDateFromStart > minDateFromEnd ? minDateFromStart : minDateFromEnd;
  const minDateStr = minDateObj.toISOString().split("T")[0];

  const maxShiftDays = (booking.postpone_count || 0) === 0 ? 14 : 7;
  const maxDateObj = startDate ? new Date(startDate) : new Date();
  if (startDate) maxDateObj.setDate(maxDateObj.getDate() + maxShiftDays);

  // Guard against a case where a booking is so long that min > max
  const finalMaxDateObj = maxDateObj > minDateObj ? maxDateObj : minDateObj;
  const maxDateStr = finalMaxDateObj.toISOString().split("T")[0];

  // Handlers
  const handleCancel = async () => {
    if (isPaid && (!bankName || !accountName || !accountNumber)) {
      setErrorMsg("Please provide your bank details to receive the refund.");
      return;
    }

    setActionLoading(true);
    setErrorMsg("");
    try {
      let qrImageUrl = null;
      // Upload QR image if provided
      if (bankQrFile) {
        const formData = new FormData();
        formData.append("image", bankQrFile);
        const token = localStorage.getItem("bookbik_token");
        const API_URL =
          import.meta.env.VITE_API_URL || "http://localhost:3000/api";
        const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        qrImageUrl = uploadRes.data.data?.url || uploadRes.data.url;
      }

      await bookingAPI.cancel(booking.sessions?.[0]?._id || booking._id, {
        bankName,
        accountName,
        accountNumber,
        customer_bank_qr_image: qrImageUrl,
      });
      setShowCancelModal(false);
      onUpdate();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostpone = async () => {
    if (!postponeDate) return setErrorMsg("Please select a new date");
    setActionLoading(true);
    setErrorMsg("");
    try {
      const newStart = new Date(`${postponeDate}T${postponeTime || "00:00"}`);
      if (!startDate || !endDate)
        return setErrorMsg("Original booking dates missing.");
      // Calculate end date based on original duration
      const durationMs = endDate.getTime() - startDate.getTime();
      const newEnd = new Date(newStart.getTime() + durationMs);

      await bookingAPI.postpone(booking.sessions?.[0]?._id || booking._id, {
        new_start_datetime: newStart.toISOString(),
        new_end_datetime: newEnd.toISOString(),
      });
      setShowPostponeModal(false);
      onUpdate();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to postpone booking");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Card
      className={`transition-all duration-300 ${expanded ? "ring-2 ring-primary/30 shadow-lg" : "hover:shadow-md"}`}
    >
      <CardContent className="p-0">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-5 text-left flex items-center justify-between gap-4"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="font-bold text-foreground text-lg truncate">
                {booking.service_id?.name || "Service"}
              </h3>
              <Badge variant={STATUS_COLORS[booking.status] || "secondary"}>
                {STATUS_LABELS[booking.status] || booking.status}
              </Badge>
              {booking.is_verified && (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-300"
                >
                  ✓ Verified
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                {formatDateLabel()}
              </span>
              {booking.service_id?.booking_type !== "date_range" && (
                <span className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1" />
                  {formatTimeLabel()}
                </span>
              )}
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1" />
                {booking.resource_id?.name || "Resource"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-lg font-extrabold text-primary">
                {booking.total_price?.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                {booking.currency}
              </span>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </button>

        {/* Expanded Detail */}
        {expanded && (
          <div className="border-t border-border px-5 pb-5 pt-4 animate-fade-in">
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Left: Details */}
              <div className="space-y-4">
                <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                  Booking Details
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group ID</span>
                    <span className="font-mono text-xs text-foreground">
                      {booking.group_id || booking._id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booked On</span>
                    <span className="font-medium text-xs text-foreground">
                      {booking.createdAt ? format(new Date(booking.createdAt), "MMM d, yyyy HH:mm") : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service</span>
                    <span className="font-semibold">
                      {booking.service_id?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Resource</span>
                    <span className="font-semibold">
                      {booking.resource_id?.name}
                    </span>
                  </div>

                  <div className="pt-2">
                    <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      {booking.service_id?.booking_type === "date_range"
                        ? "Stay Details"
                        : "Booking Breakdown"}
                    </h5>
                    <div className="space-y-2 bg-muted/50 p-3 rounded-xl border border-border">
                      {booking.sessions?.map((session, idx) => (
                        <div
                          key={session._id}
                          className="flex justify-between items-center text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {booking.service_id?.booking_type !==
                              "date_range" && (
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                {idx + 1}
                              </div>
                            )}
                            <span className="font-medium">
                              {booking.service_id?.booking_type === "date_range"
                                ? `${format(new Date(session.start_datetime), "MMM d")} - ${format(new Date(session.end_datetime), "MMM d, yyyy")}`
                                : `${format(new Date(session.start_datetime), "MMM d: HH:mm")} — ${format(new Date(session.end_datetime), "HH:mm")}`}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {session.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="pt-3 border-t border-border space-y-2">
                  <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                    Payment
                  </h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      variant={isPaid ? "default" : "warning"}
                      className={isPaid ? "bg-green-100 text-green-700" : ""}
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      {isPaid ? "Paid" : booking.payment_status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-semibold capitalize">
                      {booking.payment_method?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount Paid</span>
                    <span className="font-extrabold text-primary">
                      {booking.sessions
                        ?.reduce((sum, s) => sum + (s.amount_paid || 0), 0)
                        .toLocaleString()}{" "}
                      {booking.currency}
                    </span>
                  </div>
                </div>

                {booking.notes && (
                  <div className="pt-3 border-t border-border">
                    <h4 className="font-bold text-foreground text-sm uppercase tracking-wide mb-1">
                      Notes
                    </h4>
                    <div className="space-y-1.5 mt-1">
                      {booking.notes.split("\n").map((line, i) => {
                        if (!line.trim()) return null;

                        // Replace 'Cancelled' and 'Postponed' with styled spans
                        const parts = line.split(/(Cancelled|Postponed)/i);

                        return (
                          <div
                            key={i}
                            className="text-sm text-muted-foreground p-1"
                          >
                            {parts.map((part, index) => {
                              const isCancel =
                                part.toLowerCase() === "cancelled";
                              const isPostpone =
                                part.toLowerCase() === "postponed";

                              if (isCancel || isPostpone) {
                                return (
                                  <span
                                    key={index}
                                    className={`font-bold ${isCancel ? "text-red-600" : "text-orange-500"}`}
                                  >
                                    {part}
                                  </span>
                                );
                              }
                              return <span key={index}>{part}</span>;
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Refund Status & Proof */}
                {booking.status === "cancelled" &&
                  booking.payment_status === "refund_pending" && (
                    <div className="pt-3 border-t border-border">
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                        <p className="text-sm font-bold text-orange-800 flex items-center gap-1.5">
                          <Clock className="w-4 h-4" /> Refund Pending
                        </p>
                        <p className="text-xs text-orange-700 mt-1">
                          Your refund is being processed by the owner. You will
                          see the proof of transfer here once completed.
                        </p>
                      </div>
                    </div>
                  )}

                {booking.status === "cancelled" &&
                  booking.payment_status === "refunded" && (
                    <div className="pt-3 border-t border-border">
                      <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm font-bold text-green-800 flex items-center gap-1.5 mb-1">
                          <Check className="w-4 h-4" /> Refund Completed
                        </p>
                        <p className="text-xs text-green-700">
                          Your refund has been processed.{" "}
                          {booking.cancellation_fee > 0
                            ? `A 15% cancellation fee was deducted.`
                            : ""}
                        </p>
                        <p className="text-[10px] text-green-600 mt-2">
                          See proof of transfer in the right column.
                        </p>
                      </div>
                    </div>
                  )}

                {/* Pay Now for unpaid gateway-payment bookings */}
                {needsPayment && (
                  <div className="pt-4 border-t border-border mt-4">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 mb-3">
                      <p className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
                        <Banknote className="w-4 h-4" /> Payment Pending
                      </p>
                      <p className="text-xs text-amber-700 mt-1">
                        Your booking is reserved but not yet confirmed. Please
                        complete payment to confirm.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-bold"
                      disabled={paymentLoading}
                      onClick={async () => {
                        setPaymentLoading(true);
                        try {
                          const PAYMENT_BASE_URL =
                            "https://payment-gateway.phajay.co";
                          const PAYMENT_KEY =
                            "$2a$10$Wu4DnsWSZZP12nXutDAWeu9CAdcoY5ZhXzrgdRiVg/Y5lwM5e92ai";
                          const authToken = `Basic ${btoa(PAYMENT_KEY)}`;
                          const fullPrice = booking.total_price || 0;
                          const payAmount =
                            booking.payment_method === "half"
                              ? Math.ceil(fullPrice / 2)
                              : fullPrice;
                          const gatewayAmount = Math.min(payAmount, 1); // DEV cap
                          const orderNo = booking._id;

                          const payRes = await axios.post(
                            `${PAYMENT_BASE_URL}/v1/api/link/payment-link`,
                            {
                              amount: gatewayAmount,
                              description: `Booking ${orderNo} (${booking.payment_method === "half" ? "50%" : "100%"} - actual: ${payAmount} ${booking.currency})`,
                              orderNo: orderNo,
                            },
                            {
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: authToken,
                              },
                            },
                          );
                          const { redirectURL } = payRes.data;
                          if (redirectURL) {
                            window.location.href = redirectURL;
                          } else {
                            alert(
                              "Could not generate payment link. Try again.",
                            );
                          }
                        } catch (err) {
                          console.error(err);
                          alert(
                            "Payment link generation failed. Please try again.",
                          );
                        } finally {
                          setPaymentLoading(false);
                        }
                      }}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" /> Pay Now (
                          {booking.payment_method === "half" ? "50%" : "100%"})
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Actions */}
                {(canModify ||
                  booking.status === "cancelled" ||
                  booking.status === "postponed") && (
                  <div className="pt-4 border-t border-border flex gap-3 mt-4">
                    {(canPostpone ||
                      booking.status === "cancelled" ||
                      booking.status === "postponed") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPostponeModal(true)}
                        disabled={booking.status === "cancelled"}
                      >
                        Postpone
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowCancelModal(true)}
                      disabled={booking.status === "cancelled"}
                    >
                      {booking.status === "cancelled"
                        ? "Cancelled"
                        : "Cancel Booking"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Right: QR Code or Refund Slip */}
              <div className="flex flex-col items-center justify-center min-w-[180px]">
                {qrPayload && isActive ? (
                  <div className="text-center">
                    <div className="bg-white p-3 rounded-2xl shadow-inner inline-block mb-3">
                      <QRCodeSVG
                        value={qrPayload}
                        size={160}
                        level="H"
                        includeMargin
                        fgColor="#1a1a2e"
                        bgColor="#ffffff"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">
                      Verification Code
                    </p>
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <span className="text-lg font-mono font-extrabold tracking-[0.2em] text-primary">
                        {booking.verification_code}
                      </span>
                      <button
                        onClick={copyCode}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Show this QR at the venue
                    </p>

                    <Link
                      to={`/booking-confirmation/${booking._id}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Full QR Page
                    </Link>
                  </div>
                ) : booking.status === "cancelled" ? (
                  <div className="text-center w-full">
                    {booking.refund_proof_image ? (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-foreground mb-2 flex items-center justify-center gap-1.5">
                          <Banknote className="w-3.5 h-3.5 text-green-600" />{" "}
                          Refund Proof Slip
                        </p>
                        <a
                          href={booking.refund_proof_image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={booking.refund_proof_image}
                            alt="Refund proof"
                            className="w-full max-h-40 object-contain rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow bg-white"
                          />
                        </a>
                        <p className="text-[10px] text-muted-foreground">
                          Click to view full slip
                        </p>
                      </div>
                    ) : (
                      <div className="py-8 px-4 bg-muted/30 rounded-2xl border border-dashed border-border flex flex-col items-center">
                        <Clock className="w-10 h-10 text-muted-foreground/30 mb-2" />
                        <p className="text-sm font-bold text-muted-foreground">
                          Refund Pending
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1 max-w-[120px]">
                          Waiting for owner to upload transfer slip
                        </p>
                      </div>
                    )}
                  </div>
                ) : booking.is_verified ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="font-bold text-foreground">
                      Booking Verified
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Code: {booking.verification_code}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <QrCode className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">
                      QR not available for {booking.status} bookings
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Cancel Modal */}
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Cancel Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking for{" "}
              {booking.service_id?.name}?
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0 text-sm">
            {isPaid ? (
              <>
                <div className="p-4 bg-orange-50 text-orange-800 rounded-lg border border-orange-200 mb-4">
                  <p className="font-bold mb-1">Cancellation Fee Applied</p>
                  <p>
                    Since this booking is paid, a 15% cancellation fee will be
                    deducted from your refund amount.
                  </p>
                </div>

                <div className="space-y-3 mb-4">
                  <p className="font-bold text-foreground">
                    Refund Details required
                  </p>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Bank Name (e.g. BCEL, JDB)
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="BCEL"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Account Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-md border border-input px-3 py-2 text-sm bg-background"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="010123456789"
                    />
                  </div>

                  {/* QR / Bank Card Image Upload */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      Bank QR Code / Card Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      id="bank-qr-input"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setBankQrFile(file);
                          setBankQrPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    {bankQrPreview ? (
                      <div className="relative">
                        <img
                          src={bankQrPreview}
                          alt="Bank QR"
                          className="w-full max-h-40 object-contain rounded-lg border border-border bg-muted"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setBankQrFile(null);
                            setBankQrPreview(null);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="bank-qr-input"
                        className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Upload QR or bank card image
                        </span>
                      </label>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-muted text-muted-foreground rounded-lg mb-4">
                <p>This action cannot be undone.</p>
              </div>
            )}
            {errorMsg && (
              <p className="text-red-500 font-bold mb-4">{errorMsg}</p>
            )}
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={actionLoading}
            >
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Postpone Modal */}
      <Dialog open={showPostponeModal} onOpenChange={setShowPostponeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Postpone Booking</DialogTitle>
            <DialogDescription>
              You can postpone this booking up to 2 times, and up to 2 weeks
              from the original date.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold">New Date</label>
              <input
                type="date"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)}
                min={minDateStr}
                max={maxDateStr}
              />
            </div>
            {booking.service_id?.booking_type !== "date_range" && (
              <div className="space-y-2">
                <label className="text-sm font-bold">New Time</label>
                <input
                  type="time"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={postponeTime}
                  onChange={(e) => setPostponeTime(e.target.value)}
                />
              </div>
            )}
            {errorMsg && (
              <p className="text-red-500 font-bold text-sm">{errorMsg}</p>
            )}
          </div>
          <DialogFooter className="p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setShowPostponeModal(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePostpone}
              disabled={actionLoading || !postponeDate}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Request Postponement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default function BookingHistory() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/my-bookings" } });
      return;
    }
    loadBookings();
  }, [isAuthenticated, authLoading]);

  const loadBookings = async () => {
    try {
      const res = await bookingAPI.list({});
      setBookings(res.data.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const groupBookings = (list) => {
    if (!Array.isArray(list)) return [];
    const groups = {};
    list.forEach((b) => {
      // Create a fallback key using Date + Service + Resource
      let datePart = "unknown";
      if (b.start_datetime) {
        const d = new Date(b.start_datetime);
        if (!isNaN(d.getTime())) {
          datePart = format(d, "yyyy-MM-dd");
        }
      }

      const serviceId = b.service_id?._id || b.service_id || "unknown";
      const resourceId = b.resource_id?._id || b.resource_id || "none";
      const compositeKey = `${datePart}_${serviceId}_${resourceId}`;

      const gId = b.group_id || compositeKey;

      if (!groups[gId]) {
        groups[gId] = {
          ...b,
          sessions: [],
          total_price: 0,
        };
      }
      groups[gId].sessions.push(b);
      // Ensure we sort sessions within the group by time
      groups[gId].sessions.sort((x, y) => {
        const dx = new Date(x.start_datetime);
        const dy = new Date(y.start_datetime);
        return dx - dy;
      });
      groups[gId].total_price += b.total_price || 0;
    });
    // Sort groups by latest start date
    return Object.values(groups).sort((a, b) => {
      const da = new Date(a.start_datetime);
      const db = new Date(b.start_datetime);
      return db - da;
    });
  };

  const groupedBookings = groupBookings(bookings);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
  text-blue-600
  border border-blue-500
  px-3 py-1.5 rounded-md
  hover:bg-blue-500 hover:text-white
  transition-all duration-200 mb-2 group cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <h1 className="text-3xl font-extrabold text-foreground mb-8">
        My Bookings
      </h1>

      {authLoading || loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            No bookings yet
          </h3>
          <p className="text-muted-foreground">
            Start by browsing businesses and making a booking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedBookings.map((group) => (
            <BookingCard
              key={group.group_id || group._id}
              booking={group}
              onUpdate={loadBookings}
            />
          ))}
        </div>
      )}
    </div>
  );
}
