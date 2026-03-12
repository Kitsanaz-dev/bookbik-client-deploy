import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

import api from "../services/api";
import { CheckCircle, Calendar, Clock, MapPin, ArrowLeft, Download, Copy, Check, XCircle, Banknote, PartyPopper, Maximize2, X } from "lucide-react";

export default function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const linkCode = query.get("linkCode");
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showFullQR, setShowFullQR] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/bookings/${id}`);
      setBooking(res.data.data);
    } catch (err) {
      console.error("Error fetching booking:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (booking?.verification_code) {
      navigator.clipboard.writeText(booking.verification_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("booking-qr-svg");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement("a");
      link.download = `booking-${booking.verification_code}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgStr);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-lg">Booking not found.</p>
        <Link to="/" className="text-primary font-bold mt-4 inline-block">← Back home</Link>
      </div>
    );
  }

  const qrPayload = JSON.stringify({
    code: booking.verification_code,
    booking_id: booking._id,
    service: booking.service_id?._id || booking.service_id,
    date: booking.start_datetime,
  });

  const formatDate = (d) => new Date(d).toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric"
  });
  const formatTime = (d) => new Date(d).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <button onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
            text-blue-600
            border border-blue-500
            px-3 py-1.5 rounded-md
            hover:bg-blue-500 hover:text-white
            transition-all duration-200 mb-2 group cursor-pointer"
          >
        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Home
      </button>

      {/* Success Banner */}
      <div className="text-center mb-8">
        {linkCode ? (
            <div className="animate-in fade-in zoom-in duration-500">
                <div className="relative inline-block">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
                    <PartyPopper className="w-8 h-8 text-yellow-500 absolute -top-2 -right-2 animate-bounce" />
                </div>
                <h1 className="text-3xl font-black text-foreground ">Payment Successful!</h1>
                <div className=" text-green-700  rounded-full text-sm font-bold inline-block">
                    Your transaction has been verified
                </div>
                <p className="text-muted-foreground text-sm mt-4 max-w-[280px] mx-auto">
                    The payment was received. You can now use the QR code below for your booking.
                </p>
            </div>
        ) : booking.status === "cancelled" ? (
            <>
                <XCircle className="w-14 h-14 text-red-500 mx-auto mb-3" />
                <h1 className="text-2xl font-extrabold text-foreground">Booking Cancelled</h1>
                <p className="text-red-700 dark:text-red-400 text-sm mt-2 font-medium">
                    {booking.payment_status === "refunded" ? "Refund processed and completed" : "Refund is being processed"}
                </p>
            </>
        ) : (
            <>
                <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
                <h1 className="text-2xl font-extrabold text-foreground">Booking Confirmed!</h1>
                <p className="text-green-700 dark:text-green-400 text-sm mt-2 font-medium">
                    Payment received — your QR code is ready
                </p>
            </>
        )}
      </div>

      {/* Combined Card: Booking Details & QR Code/Refund Slip */}
      <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden mb-6">
        
        {/* TOP SECTION: Booking Details */}
        <div className="p-6 md:p-8 space-y-6 border-b border-border">
          <h2 className="font-bold text-foreground text-lg border-b border-border pb-2">Booking Info</h2>

          <div className="space-y-4 text-sm">
            
            {/* Customer Information */}
            <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-border/50">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                {booking.customer_id?.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Booked By</p>
                <p className="font-bold text-foreground text-base">{booking.customer_id?.name || "Guest User"}</p>
                {booking.customer_id?.phone && (
                  <p className="text-xs text-muted-foreground mt-0.5">{booking.customer_id.phone}</p>
                )}
              </div>
              <div className="text-right border-l border-border/50 pl-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">Booked On</p>
                <p className="text-sm font-bold text-foreground">{formatDate(booking.createdAt)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatTime(booking.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Check-in</p>
                    <p className="font-bold text-foreground">{formatDate(booking.start_datetime)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {booking.service_id?.booking_type === "date_range" 
                        ? (booking.service_id?.open_time || "14:00") 
                        : formatTime(booking.start_datetime)}
                    </p>
                  </div>
                  <div className="bg-muted/40 p-3 rounded-2xl border border-border/50">
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Check-out</p>
                    <p className="font-bold text-foreground">{formatDate(booking.end_datetime)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                      {booking.service_id?.booking_type === "date_range" 
                        ? (booking.service_id?.close_time || "12:00") 
                        : formatTime(booking.end_datetime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="pt-1">
                <p className="font-bold text-foreground text-base">
                  {booking.service_id?.name || "Service"}
                </p>
                <p className="text-muted-foreground font-medium mt-0.5">
                  {booking.resource_id?.name || "Resource"}
                </p>
              </div>
            </div>

            {booking.group_id && (
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex items-center justify-between mt-2">
                <span className="text-indigo-700 font-bold text-xs uppercase tracking-wider">Group Booking</span>
                <span className="bg-indigo-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm">All Sessions Paid</span>
              </div>
            )}
          </div>  

          <div className="pt-5 mt-2 border-t border-border flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-muted-foreground text-sm font-medium">Total Paid</span>
              {booking.sessions_count > 1 && (
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight mt-0.5">For {booking.sessions_count} sessions</span>
              )}
            </div>
            <span className="text-2xl font-black text-primary">
              {(booking.group_total || booking.total_price)?.toLocaleString()} <span className="text-sm font-bold text-muted-foreground ml-1">{booking.currency}</span>
            </span>
          </div>

          <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border">
            <span className="text-sm font-bold text-foreground">Status</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold border border-green-200">
                ✓ Paid
              </span>
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20 capitalize">
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: QR or Refund */}
        <div className="p-8 text-center bg-muted/10">
          {booking.status === "cancelled" ? (
              <div className="w-full">
                  {booking.refund_proof_image ? (
                      <div className="space-y-4">
                          <p className="text-sm font-bold text-foreground mb-4 flex items-center justify-center gap-2">
                              <Banknote className="w-5 h-5 text-green-600" /> Refund Proof Transfer Slip
                          </p>
                          <a href={booking.refund_proof_image} target="_blank" rel="noopener noreferrer" className="block">
                              <img 
                                  src={booking.refund_proof_image} 
                                  alt="Refund proof" 
                                  className="w-full max-h-[400px] object-contain rounded-2xl border border-border bg-white shadow-inner mx-auto"
                              />
                          </a>
                          <p className="text-xs text-muted-foreground">This slip was uploaded by the venue owner as proof of refund.</p>
                      </div>
                  ) : (
                      <div className="py-12 flex flex-col items-center">
                          <Clock className="w-16 h-16 text-muted-foreground/20 mb-4" />
                          <h3 className="text-lg font-bold text-muted-foreground">Refund Processing</h3>
                          <p className="text-sm text-muted-foreground/60 mt-2 max-w-[240px]">
                              The venue owner is processing your refund. Once completed, the transfer slip will appear here.
                          </p>
                      </div>
                  )}
              </div>
          ) : (
              <>
                  <p className="text-sm text-foreground font-bold mb-4">
                      Show this QR code at the venue for check-in
                  </p>

                  <div className="inline-block bg-white p-4 rounded-3xl shadow-md border border-border mb-4">
                      <QRCodeSVG
                          id="booking-qr-svg"
                          value={qrPayload}
                          size={220}
                          level="H"
                          includeMargin
                          fgColor="#1a1a2e"
                          bgColor="#ffffff"
                      />
                  </div>

                  {/* Verification Code */}
                  <div className="mt-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Verification Code</p>
                      <div className="flex items-center justify-center gap-2">
                          <span className="text-3xl font-mono font-black tracking-[0.2em] text-primary">
                              {booking.verification_code}
                          </span>
                          <button onClick={copyCode}
                              className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors text-foreground">
                              {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                          </button>
                      </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                      <button onClick={() => setShowFullQR(true)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-sm">
                          <Maximize2 className="w-4 h-4" /> Expand QR
                      </button>
                      <button onClick={downloadQR}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground text-sm font-bold hover:bg-secondary/80 transition-all shadow-sm">
                          <Download className="w-4 h-4" /> Save QR Image
                      </button>
                  </div>
              </>
          )}
        </div>
      </div>

      {/* Full Screen QR Overlay */}
      {showFullQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 lg:p-12 animate-in fade-in zoom-in duration-200">
          <button 
            onClick={() => setShowFullQR(false)}
            className="absolute top-6 right-6 lg:top-8 lg:right-8 p-2 lg:p-4 rounded-full bg-muted/80 hover:bg-muted text-foreground transition-colors z-[110]"
          >
            <X className="w-8 h-8 lg:w-10 lg:h-10" />
          </button>
          
          <div className="bg-card p-10 lg:p-14 rounded-3xl lg:rounded-[3rem] shadow-2xl border border-border flex flex-col items-center max-w-sm lg:max-w-4xl w-full max-h-full overflow-y-auto">
            <h3 className="font-bold text-xl lg:text-3xl mb-8 lg:mb-10 text-foreground text-center">Scan at the Venue</h3>
            <div className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[2.5rem] shadow-md border border-border w-full aspect-square flex items-center justify-center">
              <QRCodeSVG
                value={qrPayload}
                size={280}
                level="H"
                includeMargin
                fgColor="#1a1a2e"
                bgColor="#ffffff"
                style={{ width: "100%", height: "100%", maxHeight: "100%" }}
              />
            </div>
            <p className="mt-8 lg:mt-10 font-mono text-3xl lg:text-5xl font-black tracking-widest text-primary shrink-0">
              {booking.verification_code}
            </p>
          </div>
        </div>
      )}


      <div className="text-center mt-8">
        <Link to="/my-bookings"
          className="text-primary font-bold hover:underline text-sm">
          View All Bookings →
        </Link>
      </div>
    </div>
  );
}
