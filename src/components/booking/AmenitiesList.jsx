import { useState } from "react";
import {
  Wifi, Car, WashingMachine, Snowflake, Monitor, Briefcase,
  ShieldCheck, Flame, Luggage, Camera, Eye, Bath, Bed, Tv,
  Dumbbell, BookOpen, ThermometerSun, Fan, Lock, UtensilsCrossed,
  Coffee, ParkingCircle, Waves, Dog, Clock, Sparkles, XCircle,
  CookingPot, Refrigerator, Microwave, IceCreamCone, Wine, Shirt,
  Paintbrush, GlassWater, Heater
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const AMENITY_MAP = {
  wifi: { icon: Wifi, label: "Wifi" },
  parking: { icon: Car, label: "Free parking on premises" },
  washer: { icon: WashingMachine, label: "Free washer – In building" },
  ac: { icon: Snowflake, label: "Air conditioning" },
  tv: { icon: Tv, label: "TV" },
  kitchen: { icon: UtensilsCrossed, label: "Kitchen" },
  workspace: { icon: Briefcase, label: "Dedicated workspace" },
  pool: { icon: Waves, label: "Pool" },
  gym: { icon: Dumbbell, label: "Gym" },
  pets: { icon: Dog, label: "Pets allowed" }
};

const CATEGORIZED_AMENITIES = [
  {
    title: "Internet and office",
    items: [
      { key: "wifi", icon: Wifi, label: "Wifi" },
      { key: "workspace", icon: Briefcase, label: "Dedicated workspace" },
    ],
  },
  {
    title: "Parking and facilities",
    items: [
      { key: "parking", icon: ParkingCircle, label: "Free parking on premises" },
      { key: "pool", icon: Waves, label: "Pool" },
      { key: "gym", icon: Dumbbell, label: "Gym" },
    ],
  },
  {
    title: "Kitchen and dining",
    items: [
      { key: "kitchen", icon: UtensilsCrossed, label: "Kitchen" },
    ],
  },
  {
    title: "Bedroom and laundry",
    items: [
      { key: "washer", icon: WashingMachine, label: "Washer" },
    ],
  },
  {
      title: "Heating and cooling",
      items: [
        { key: "ac", icon: Snowflake, label: "Air conditioning" },
      ],
    },
];

export default function AmenitiesList({ amenities = [] }) {
  const [open, setOpen] = useState(false);

  // If no amenities provided, show a placeholder or nothing
  if (!amenities || amenities.length === 0) return null;

  const activeAmenities = amenities.map(key => AMENITY_MAP[key]).filter(Boolean);
  const previewList = activeAmenities.slice(0, 10);

  return (
    <div className="py-8 border-b border-border">
      <h2 className="text-xl font-bold text-foreground mb-6">What this place offers</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {previewList.map((item, i) => (
          <div key={i} className="flex items-center gap-4 group">
            <item.icon className="w-6 h-6 text-foreground/70 group-hover:text-primary transition-colors shrink-0" />
            <span className="text-sm font-medium text-foreground/80">{item.label}</span>
          </div>
        ))}
      </div>
      
      {activeAmenities.length > 5 && (
        <Button
            variant="outline"
            className="mt-8 rounded-lg font-bold border-foreground hover:bg-muted/30 px-6 h-12"
            onClick={() => setOpen(true)}
        >
            Show all {activeAmenities.length} amenities
        </Button>
      )}

      {/* Amenities Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl w-full p-0 gap-0 border-none shadow-2xl">
          <DialogHeader className="p-6 border-b border-border bg-card">
            <DialogTitle className="text-xl font-bold text-foreground">
              What this place offers
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] p-6 bg-background">
            {CATEGORIZED_AMENITIES.map((category, ci) => {
               const filteredItems = category.items.filter(item => amenities.includes(item.key));
               if (filteredItems.length === 0) return null;

               return (
                <div key={ci} className="mb-8 last:mb-0">
                    <h3 className="font-bold text-lg text-foreground mb-4">{category.title}</h3>
                    {filteredItems.map((item, ii) => (
                    <div key={item.key}>
                        <div className="flex items-center gap-4 py-4">
                        <item.icon className="w-7 h-7 shrink-0 text-foreground" />
                        <div className="flex-1">
                            <span className="text-base font-medium text-foreground/90">{item.label}</span>
                        </div>
                        </div>
                        {ii < filteredItems.length - 1 && <Separator className="bg-border/50" />}
                    </div>
                    ))}
                </div>
               );
            })}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
