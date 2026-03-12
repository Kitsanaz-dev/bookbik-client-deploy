import { Clock, MapPin } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";

export default function ServiceList({ services, serviceIdParam, t, onSelectService }) {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm mr-3 font-bold shadow-sm">
          1
        </span>
        {t("booking.step.1") || "Select Service"}
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {services
          .filter(svc => !serviceIdParam || svc._id === serviceIdParam)
          .map((svc) => (
          <Card 
            key={svc._id} 
            className="rounded-xl border-border/50 hover:shadow-xl hover:border-primary/30 transition-all group flex flex-col"
          >
            <div className="aspect-video w-full overflow-hidden bg-muted relative">
              {svc.image ? (
                <img 
                  src={svc.image.startsWith('http') ? svc.image : `http://localhost:3000${svc.image}`} 
                  alt={svc.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 hover:brightness-110" 
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/30">
                  <svg className="w-12 h-12 text-muted-foreground/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
                <Badge variant="secondary" className="bg-background/80 backdrop-blur-md rounded-lg border-none px-3 py-1 font-bold text-sm shadow-sm text-foreground">
                  {svc.price?.toLocaleString()} {svc.currency}
                </Badge>
                <Badge className="bg-primary/90 text-white rounded-lg border-none shadow-lg px-2.5 py-1 text-xs uppercase tracking-wider font-black">
                  {svc.category || "General"}
                </Badge>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="mb-4">
                <h4 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{svc.name}</h4>
                <p className="text-base text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {svc.duration_minutes} min • {svc.booking_type?.replace("_", " ")}
                </p>
                {svc.location && (
                  <p className="text-sm text-primary/70 mt-2 flex items-center gap-1.5 font-medium">
                    <MapPin className="w-4 h-4" /> {svc.location}
                  </p>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-border/50">
                <Button
                  onClick={() => onSelectService(svc)}
                  className="w-full py-8 rounded-lg font-extrabold text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
                >
                  {t("booking.select")}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {services.length === 0 && (
          <div className="sm:col-span-2 text-center py-12 bg-muted/10 rounded-xl border border-dashed text-muted-foreground">
            No services available for this business yet.
          </div>
        )}
      </div>
    </section>
  );
}
