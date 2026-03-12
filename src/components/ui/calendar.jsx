import * as React from "react";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function Calendar({ 
  mode = "single", 
  selected, 
  onSelect, 
  disabled, 
  modifiers, 
  modifiersClassNames, 
  className,
  numberOfMonths = 1,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Initialize view based on selected date
  let initDate = today;
  if (mode === "single" && selected instanceof Date) {
    initDate = selected;
  } else if (mode === "range" && selected?.from) {
    initDate = selected.from;
  }

  const [viewYear, setViewYear] = useState(initDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initDate.getMonth());

  useEffect(() => {
    let newInit = today;
    if (mode === "single" && selected instanceof Date) newInit = selected;
    else if (mode === "range" && selected?.from) newInit = selected.from;
    
    setViewYear(newInit.getFullYear());
    setViewMonth(newInit.getMonth());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isBefore = (date1, date2) => {
    const d1 = new Date(date1).setHours(0,0,0,0);
    const d2 = new Date(date2).setHours(0,0,0,0);
    return d1 < d2;
  };
  const isAfter = (date1, date2) => {
    const d1 = new Date(date1).setHours(0,0,0,0);
    const d2 = new Date(date2).setHours(0,0,0,0);
    return d1 > d2;
  };
  const isBetween = (date, start, end) => {
    if (!start || !end || !date) return false;
    const d = new Date(date).setHours(0,0,0,0);
    const s = new Date(start).setHours(0,0,0,0);
    const e = new Date(end).setHours(0,0,0,0);
    return d > s && d < e;
  };

  const handleDayClick = (date) => {
    if (mode === "single") {
      onSelect?.(date);
    } else if (mode === "range") {
      if (!selected?.from) {
        onSelect?.({ from: date, to: undefined });
      } else if (selected?.from && !selected?.to) {
        if (isBefore(date, selected.from)) {
          // clicked before from -> make it the new from
          onSelect?.({ from: date, to: undefined });
        } else {
          onSelect?.({ from: selected.from, to: date });
        }
      } else if (selected?.from && selected?.to) {
        // Reset to new from
        onSelect?.({ from: date, to: undefined });
      }
    }
  };

  const renderMonth = (monthOffset) => {
    let m = viewMonth + monthOffset;
    let y = viewYear;
    if (m > 11) { m -= 12; y += 1; }

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();

    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, outside: true, date: new Date(y, m - 1, daysInPrevMonth - i) });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, outside: false, date: new Date(y, m, d) });
    }
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, outside: true, date: new Date(y, m + 1, d) });
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
      <div key={monthOffset} className="flex-1 w-full sm:w-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 h-9">
          {monthOffset === 0 ? (
            <button type="button" onClick={prevMonth} className="w-8 h-8 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center">
              <ChevronLeft className="w-4 h-4 text-primary" />
            </button>
          ) : <div className="w-8 h-8" />}
          
          <span className="text-sm font-bold text-foreground mx-auto">
            {MONTH_NAMES[m]} {y}
          </span>

          {monthOffset === numberOfMonths - 1 ? (
            <button type="button" onClick={nextMonth} className="w-8 h-8 rounded-md border border-input bg-background hover:bg-accent flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
          ) : <div className="w-8 h-8" />}
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((wd) => (
            <div key={wd} className="text-center text-[0.8rem] font-medium text-muted-foreground w-9">
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-y-1">
          {weeks.flat().map((cell, idx) => {
            const isDisabled = disabled ? disabled(cell.date) : false;
            let isSelected = false;
            let isRangeStart = false;
            let isRangeEnd = false;
            let isRangeMiddle = false;

            if (mode === "single") {
              isSelected = isSameDay(selected, cell.date);
            } else if (mode === "range") {
              isRangeStart = isSameDay(selected?.from, cell.date);
              isRangeEnd = isSameDay(selected?.to, cell.date);
              isSelected = isRangeStart || isRangeEnd;
              isRangeMiddle = isBetween(cell.date, selected?.from, selected?.to);
            }

            const isToday = isSameDay(today, cell.date);
            const isAvailable = modifiers?.available ? modifiers.available(cell.date) : false;

            return (
              <div key={idx} className={cn("relative w-9 h-9 flex items-center justify-center p-0", 
                 isRangeMiddle && "bg-accent",
                 isRangeStart && selected?.to && "bg-accent rounded-l-md",
                 isRangeEnd && selected?.from && "bg-accent rounded-r-md",
                 cell.outside && "opacity-0 pointer-events-none" // Hide outside days completely for cleaner look
              )}>
                {!cell.outside && (
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && handleDayClick(cell.date)}
                    className={cn(
                      "w-9 h-9 rounded-md text-sm text-gray-600 font-medium transition-colors flex items-center justify-center",
                      isDisabled && "text-muted-foreground/30 cursor-not-allowed",
                      !isDisabled && !isSelected && isAvailable && (modifiersClassNames?.available || "bg-green-50 text-green-700 font-bold hover:bg-green-100"),
                      !isDisabled && !isSelected && !isAvailable && !isRangeMiddle && "hover:bg-accent hover:text-accent-foreground",
                      isRangeMiddle && !isSelected && "hover:bg-primary/20",
                      isSelected && "bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary hover:text-primary-foreground",
                      isToday && !isSelected && !isRangeMiddle && "ring-1 ring-primary",
                    )}
                  >
                    {cell.day}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const calendars = [];
  for (let i = 0; i < numberOfMonths; i++) {
    calendars.push(renderMonth(i));
  }

  return (
    <div className={cn("inline-flex flex-col sm:flex-row gap-6 p-4 select-none", className)}>
      {calendars}
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
