import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";

export default function BookingDateTime({ 
  selectedService, 
  selectedResource, 
  selectedDate, 
  selectedTimes, 
  timeSlots, 
  t, 
  onSelectDate, 
  onSelectTime, 
  onBack,
  onNext,
  showNextButton, 
}) {
  return (
    <section className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-foreground">
        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mr-3 font-bold shadow-sm">
          2
        </span>
        {t("booking.step.2")} & {t("booking.step.4")}
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            selected={selectedDate ? new Date(selectedDate + "T00:00:00") : undefined}
            onSelect={(date) => {
              if (date) {
                const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
                onSelectDate(dateStr);
              }
            }}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              if (date < today) return true;
              const serviceDays = selectedService?.available_days || [0, 1, 2, 3, 4, 5, 6];
              return !serviceDays.includes(date.getDay());
            }}
            modifiers={{
              available: (date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) return false;
                const serviceDays = selectedService?.available_days || [0, 1, 2, 3, 4, 5, 6];
                return serviceDays.includes(date.getDay());
              },
            }}
            modifiersClassNames={{
              available: "bg-green-50 text-green-700 font-bold hover:bg-green-100",
            }}
            className="rounded-xl border border-border shadow-sm text-foreground bg-card"
          />
        </div>

        {/* Time Slots */}
        <div className="flex-1">
          {selectedDate ? (
            <>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {format(new Date(selectedDate + "T00:00:00"), "EEEE, MMM d, yyyy")}
              </p>
              {timeSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        disabled={slot.booked}
                        onClick={() => onSelectTime(slot.time)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold border transition-all ${
                          slot.booked
                            ? "bg-muted text-muted-foreground/40 cursor-not-allowed line-through border-transparent"
                            : selectedTimes.includes(slot.time)
                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                            : "bg-background text-foreground border-border hover:border-primary/50 hover:bg-secondary/50"
                        }`}
                      >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground">
                  <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="font-medium">
                    No available time slots on this date.
                  </p>
                  <p className="text-xs mt-1">Try selecting another date.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border">
              <CalendarIcon className="w-10 h-10 mx-auto mb-3 opacity-30 cursor-default" />
              <p className="font-medium">Select a date to see available slots</p>
              <p className="text-xs mt-1">Green days are available for booking</p>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-8">
        <Button variant="ghost" onClick={onBack} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {showNextButton && onNext && (
          <Button onClick={onNext} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-6">
            Continue to Select Resource
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </section>
  );
}
