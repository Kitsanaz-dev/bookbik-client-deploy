import { useState, useMemo } from "react";
import { Star, ChevronDown, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Separator } from "../ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { format, differenceInDays } from "date-fns";
import { cn } from "../../lib/utils";

export default function BookingCard({ 
  price = 0, 
  currency = "LAK", 
  rating = 5.0, 
  reviewCount = 0, 
  onReserve,
  submitting = false,
  disabledDates = []
}) {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);
  const [guestOpen, setGuestOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const totalGuests = adults + children;
  const guestLabel = `${totalGuests} guest${totalGuests !== 1 ? 's' : ''}${infants > 0 ? `, ${infants} infant${infants !== 1 ? 's' : ''}` : ''}${pets > 0 ? `, ${pets} pet${pets !== 1 ? 's' : ''}` : ''}`;

  const GuestRow = ({ title, subtitle, value, setValue, min = 0, max = 10, disabled = false }) => (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col">
        <span className="text-[15px] font-bold text-foreground">{title}</span>
        <span className="text-[14px] text-muted-foreground">{subtitle}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setValue(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          disabled={value <= min || disabled}
        >
          −
        </button>
        <span className="text-[16px] font-medium w-4 text-center text-foreground">{value}</span>
        <button
          onClick={() => setValue(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full border border-input flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all disabled:opacity-20 disabled:cursor-not-allowed"
          disabled={value >= max || disabled}
        >
          +
        </button>
      </div>
    </div>
  )

  const nights = useMemo(() => {
    if (dateRange.from && dateRange.to && dateRange.to > dateRange.from) {
      return differenceInDays(dateRange.to, dateRange.from);
    }
    return 0;
  }, [dateRange]);

  const unitPrice = Number(price) || 0;
  const totalPrice = unitPrice * (nights || 1);

  const canReserve = dateRange.from && dateRange.to && nights > 0;

  return (
    <div className="border border-border rounded-3xl p-8 shadow-2xl bg-card float-none lg:sticky lg:top-24 animate-fade-in group hover:shadow-primary/5 transition-all duration-500">
      {/* Price Header */}
      <div className="flex items-baseline justify-between mb-8">
        <div>
            {nights > 0 ? (
                <>
                    <span className="text-3xl font-black text-foreground tracking-tighter">{currency} {totalPrice.toLocaleString()}</span>
                    <span className="text-muted-foreground font-medium ml-1.5 text-sm">for {nights} night{nights !== 1 ? 's' : ''}</span>
                </>
            ) : (
                <>
                    <span className="text-3xl font-black text-foreground tracking-tighter">{currency} {unitPrice.toLocaleString()}</span>
                    <span className="text-muted-foreground font-medium ml-1.5 text-sm">/ night</span>
                </>
            )}
        </div>
      </div>
        <div className="flex mb-4 items-center gap-1.5 text-sm font-bold text-foreground">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            <span>{rating?.toFixed(1)}</span>
            <span className="text-muted-foreground font-medium underline">({reviewCount} reviews)</span>
        </div>

      {/* Date & Guest Selectors */}
      <div className="border-2 border-border/60 rounded-2xl mb-6 focus-within:border-primary transition-colors shadow-sm bg-background">
        <Popover open={dateOpen} onOpenChange={setDateOpen}>
          <PopoverTrigger asChild>
            <div className="grid grid-cols-2 divide-x divide-border cursor-pointer">
              <div className="p-4 text-left hover:bg-muted/30 transition-all group/pop rounded-tl-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1 group-hover/pop:text-primary transition-colors">Check-in</p>
                <p className="text-sm font-bold text-foreground">
                    {dateRange.from ? format(dateRange.from, "M/d/yyyy") : "Add date"}
                </p>
              </div>
              <div className="p-4 text-left hover:bg-muted/30 transition-all group/pop rounded-tr-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1 group-hover/pop:text-primary transition-colors">Checkout</p>
                <p className="text-sm font-bold text-foreground">
                    {dateRange.to ? format(dateRange.to, "M/d/yyyy") : "Add date"}
                </p>
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-none shadow-2xl lg:min-w-[700px]" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range);
              }}
              numberOfMonths={2}
              disabled={(date) => 
                date < new Date().setHours(0,0,0,0) || 
                disabledDates.some(d => d.toDateString() === date.toDateString())
              }
              initialFocus
              className="p-3 border-none bg-card"
            />
            <div className="p-4 border-t border-border flex justify-end">
               <Button variant="ghost" className="font-bold underline text-sm" onClick={() => setDateOpen(false)}>Close</Button>
            </div>
          </PopoverContent>
        </Popover>

        {/* Guest Selector */}
        <Popover open={guestOpen} onOpenChange={setGuestOpen}>
          <PopoverTrigger asChild>
            <button className="w-full p-5 text-left border-t border-border flex items-center justify-between hover:bg-muted/30 transition-all group/pop rounded-b-2xl">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50 mb-1 group-hover/pop:text-primary transition-colors">Guests</p>
                <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{guestLabel}</p>
              </div>
              <ChevronDown className={cn("w-5 h-5 text-muted-foreground transition-transform duration-300", guestOpen && "rotate-180")} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-6 border-none shadow-2xl rounded-2xl bg-card" align="end">
            <div className="space-y-2 divide-y divide-border">
              <GuestRow title="Adults" subtitle="Age 13+" value={adults} setValue={setAdults} min={1} />
              <GuestRow title="Children" subtitle="Ages 2–12" value={children} setValue={setChildren} />
              <GuestRow title="Infants" subtitle="Under 2" value={infants} setValue={setInfants} />
              <GuestRow title="Pets" subtitle="Bringing a service animal?" value={pets} setValue={setPets} />
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground leading-snug">
                This place has a maximum of {10} guests, not including infants. Pets aren't allowed unless specified.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
                <Button 
                    variant="ghost" 
                    className="font-bold text-sm underline p-0 h-auto hover:bg-transparent" 
                    onClick={() => setGuestOpen(false)}
                >
                  Close
                </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Button */}
      <Button 
        onClick={() => {
          if (!canReserve) return;
          setShowConfirmModal(true);
        }}
        disabled={!canReserve || submitting}
        className="w-full h-16 rounded-2xl text-lg font-black bg-gradient-to-r from-primary via-rose-500 to-primary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none bg-[length:200%_auto] hover:bg-right duration-500"
      >
        {submitting ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : !canReserve ? (
          "Check availability"
        ) : (
          "Reserve Now"
        )}
      </Button>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-gradient-to-br from-primary/10 to-rose-500/10 p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-foreground tracking-tight">Confirm Reservation</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground mt-2">
                Please review your booking details before proceeding.
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Check-in</p>
                  <p className="font-bold text-foreground">{dateRange.from && format(dateRange.from, "MMM d, yyyy")}</p>
                </div>
                <div className="bg-background/80 backdrop-blur-sm p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Checkout</p>
                  <p className="font-bold text-foreground">{dateRange.to && format(dateRange.to, "MMM d, yyyy")}</p>
                </div>
              </div>

              <div className="bg-background/80 backdrop-blur-sm p-5 rounded-2xl border border-border/50 flex justify-between items-center">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Guests</p>
                  <p className="font-bold text-foreground">{guestLabel}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-1">Duration</p>
                    <p className="font-bold text-foreground">{nights} nights</p>
                </div>
              </div>

              <Separator className="bg-border/50" />

              <div className="flex justify-between items-end px-2">
                <div>
                  <p className="text-sm font-bold text-muted-foreground">Total Price</p>
                  <p className="text-3xl font-black text-primary tracking-tighter">{currency} {totalPrice.toLocaleString()}</p>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground/60 italic">Taxes & fees included</p>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-background flex flex-col sm:flex-row gap-3">
            <Button variant="ghost" className="rounded-xl font-bold flex-1 h-12" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              className="flex-1 h-12 rounded-xl font-black bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
              disabled={submitting}
              onClick={() => {
                onReserve({ checkIn: dateRange.from, checkOut: dateRange.to, guests: { adults, children, infants, pets } });
              }}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              {submitting ? "Processing..." : "Verify & Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <p className="text-center text-[11px] font-bold text-muted-foreground mt-4 uppercase tracking-widest italic animate-pulse">
        ⚡ Best price guaranteed on Phajay
      </p>

      {/* Price breakdown - Only show if dates selected */}
      {nights > 0 && (
        <div className="mt-8 pt-8 border-t-2 border-border/40 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex justify-between text-sm font-medium">
            <span className="underline decoration-muted-foreground/30 underline-offset-4 text-foreground/80">{currency} {price.toLocaleString()} × {nights} nights</span>
            <span className="font-bold text-foreground">{currency} {(price * nights).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="underline decoration-muted-foreground/30 underline-offset-4 text-foreground/80">Cleaning fee</span>
            <span className="font-bold text-foreground">{currency} 0</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="underline decoration-muted-foreground/30 underline-offset-4 text-foreground/80">Phajay service fee</span>
            <span className="font-bold text-foreground">{currency} 0</span>
          </div>
          
          <Separator className="bg-border/60" />
          
          <div className="flex justify-between text-xl font-black pt-2">
            <span className="text-foreground tracking-tight">Total</span>
            <span className="text-primary tracking-tight">{currency} {totalPrice.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="mt-8 pt-8 border-t border-border/40">
        <button className="flex items-center justify-center gap-2 w-full text-[10px] font-bold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors group">
            <span className="bg-muted p-1 rounded group-hover:bg-primary/10 transition-colors">🚩</span>
            Report this listing
        </button>
      </div>
    </div>
  );
}
