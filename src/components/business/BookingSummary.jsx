import { format } from "date-fns";
import { ChevronRight, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export default function BookingSummary({ 
  selectedService, 
  selectedResource, 
  selectedDate, 
  selectedTimes, 
  step, 
  nights, 
  searchParams, 
  submitting, 
  t, 
  onBook,
}) {
  const isVisible = selectedService && selectedDate && (selectedTimes.length > 0 || step === 'date_range_form');
  
  const calculateTotal = () => {
    if (!selectedService) return 0;
    const actualPrice = (selectedResource?.price_override !== null && selectedResource?.price_override !== undefined) ? selectedResource.price_override : selectedService.price;
    if (step === "date_range_form") {
      return actualPrice * nights * (searchParams?.guests?.rooms || 1);
    }
    return selectedTimes.length > 0 ? actualPrice * selectedTimes.length : actualPrice;
  };

  return (
    <div className="lg:col-span-1">
      <div
        className={`sticky top-24 bg-card rounded-xl shadow-xl p-8 border border-border transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-50 translate-y-4"
        }`}
      >
        <h3 className="text-xl font-extrabold text-foreground mb-6">
          {t("booking.summary")}
        </h3>

        <div className="space-y-6 mb-8">
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground font-medium">Service</span>
            <span className="font-bold text-foreground text-right">{selectedService?.name || "—"}</span>
          </div>
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground font-medium">
              {selectedService?.booking_type === "date_range" ? "Check-in" : t("booking.date")}
            </span>
            <span className="font-bold text-foreground text-right">
              {selectedDate ? format(new Date(selectedDate), "MMM d, yyyy") : "—"}
            </span>
          </div>
          {step !== "date_range_form" && (
            <div className="flex justify-between items-center text-base">
              <span className="text-muted-foreground font-medium">{t("booking.time")}</span>
              <span className="font-bold text-foreground text-right">
                {selectedTimes.length > 0 ? selectedTimes.sort().join(", ") : "—"}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center text-base">
            <span className="text-muted-foreground font-medium">Court</span>
            <span className="font-bold text-foreground text-right">{selectedResource?.name || "—"}</span>
          </div>
          
          <div className="pt-6 border-t border-border/50 flex justify-between items-center">
            <span className="text-lg font-bold text-foreground">{t("booking.total")}</span>
            <span className="text-2xl font-extrabold text-primary">
              {selectedService ? `${calculateTotal().toLocaleString()} ${selectedService.currency}` : "—"}
            </span>
          </div>
        </div>

        {step !== "date_range_form" && (
          <Button
            onClick={onBook}
            disabled={!isVisible || !selectedResource || submitting}
            className={`w-full py-8 rounded-lg font-bold text-xl shadow-lg transition-all duration-300 flex items-center justify-center ${
              isVisible && selectedResource && !submitting
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/20 hover:scale-[1.02]"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                {t("payment.btn.processing")}
              </>
            ) : (
                <>
                {t("booking.btn.confirm") || "Confirm Booking"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
