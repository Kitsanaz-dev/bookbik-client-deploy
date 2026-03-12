import { Loader2, Users } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

export default function DateRangeResults({ 
  availableRooms, 
  selectedService, 
  nights, 
  searchParams, 
  submitting, 
  onBook 
}) {
  if (!availableRooms) return null;

  return (
    <div className="mt-8 space-y-4 animate-fade-in">
      <h3 className="text-2xl font-bold text-foreground">Available Room Types</h3>
      {availableRooms.length === 0 ? (
        <p className="text-muted-foreground p-4 bg-muted/30 rounded-xl text-center">No rooms available for the selected dates.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {availableRooms.map((room) => {
            const actualPrice = (room.price_override !== null && room.price_override !== undefined) ? room.price_override : (selectedService?.price || 0);
            const requestedRooms = searchParams?.guests?.rooms || 1;
            const totalGuests = (searchParams?.guests?.adults || 0) + (searchParams?.guests?.children || 0);
            const capacityLimit = room.capacity * requestedRooms;
            
            const isInsufficient = room.available_quantity > 0 && room.available_quantity < requestedRooms;
            const isSoldOut = room.available_quantity === 0;
            const isOverCapacity = totalGuests > capacityLimit;

            return (
              <Card key={room.resource_id} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow border-muted flex flex-col sm:flex-row h-full">
                {room.image ? (
                  <img src={room.image.startsWith('http') ? room.image : `http://localhost:3000${room.image}`} alt={room.name} className="w-full sm:w-48 h-48 sm:h-auto object-cover" />
                ) : (
                  <div className="w-full sm:w-48 h-48 sm:h-auto bg-muted/60 flex items-center justify-center">
                    <span className="text-muted-foreground text-sm font-medium">No Image</span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1 justify-between bg-card">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-xl text-foreground text-left">{room.name}</h4>
                      <Badge variant={room.available_quantity > 0 ? "success" : "destructive"} className="shrink-0">
                        {room.available_quantity} Left
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 text-left">{room.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <Users className="w-4 h-4" /> {room.capacity} Guests / Room
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
                    <div className="text-left">
                      <span className="text-2xl font-extrabold text-primary">
                        {(actualPrice * nights * requestedRooms).toLocaleString()}
                      </span>
                      <span className="text-sm font-medium text-muted-foreground ml-1">{selectedService?.currency} Total</span>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {actualPrice.toLocaleString()} {selectedService?.currency} / night x {nights} night{nights > 1 ? "s" : ""} x {requestedRooms} room{requestedRooms > 1 ? "s" : ""}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {isOverCapacity && (
                        <span className="text-[10px] text-orange-500 font-bold bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                          Exceeds Capacity
                        </span>
                      )}
                      <Button 
                        size="lg"
                        onClick={() => onBook(room)} 
                        disabled={submitting || isSoldOut}
                        className="font-bold shadow-sm"
                      >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        {isSoldOut ? "Sold Out" : isInsufficient ? `Available (Only ${room.available_quantity} left)` : "Available"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
