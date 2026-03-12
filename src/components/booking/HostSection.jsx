import { Star, Shield, Globe, MapPin, MessageSquare } from "lucide-react";
import { Button } from "../ui/button";

export default function HostSection({ 
  hostName = "Host", 
  hostYears = 1, 
  hostIntro = "", 
  isSuperhost = false, 
  hostAvatar = "",
  rating = 4.8,
  reviewCount = 170,
  hostResponseRate = 100,
  hostResponseTime = "within an hour",
  hostLanguages = []
}) {
  return (
    <div className="py-12 border-b border-border">
      <h2 className="text-2xl font-bold text-foreground mb-8 tracking-tight">Meet your host</h2>
      <div className="flex flex-col md:flex-row gap-12">
        {/* Host card */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl flex items-center gap-8 min-w-[320px] max-w-sm hover:shadow-2xl transition-all duration-300">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black mx-auto mb-3 relative border-2 border-primary/20 overflow-hidden shadow-inner">
              {hostAvatar ? (
                <img src={hostAvatar.startsWith('http') ? hostAvatar : `http://localhost:3000${hostAvatar}`} alt={hostName} className="w-full h-full object-cover" />
              ) : (
                hostName?.charAt(0) || "H"
              )}
              {isSuperhost && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-4 border-card shadow-lg">
                  <Shield className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
              )}
            </div>
            <p className="text-xl font-black text-foreground">{hostName}</p>
            {isSuperhost && (
                <p className="text-xs font-bold text-primary flex items-center gap-1 justify-center mt-1 uppercase tracking-tighter">
                  <Shield className="w-3 h-3 fill-current" /> Superhost
                </p>
            )}
          </div>
          <div className="space-y-4 border-l border-border pl-8 py-2">
            <div className="group">
              <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{reviewCount}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Reviews</p>
            </div>
            <div className="group">
              <p className="text-2xl font-black text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
                {rating?.toFixed(1)} <Star className="w-5 h-5 fill-current text-primary" />
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</p>
            </div>
            <div className="group">
              <p className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{hostYears}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Years hosting</p>
            </div>
          </div>
        </div>

        {/* Host details */}
        <div className="space-y-6 flex-1 max-w-lg">
          {isSuperhost && (
            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                <p className="font-bold text-foreground flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary fill-current" />
                    {hostName} is a Superhost
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
                </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-bold text-lg text-foreground">Host introduction</p>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              "{hostIntro || "Hello! I'm happy to host you at my place. Feel free to reach out if you have any questions."}"
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
                <p className="font-bold text-[13px] text-foreground uppercase tracking-tighter">Response rate</p>
                <p className="text-sm text-muted-foreground">{hostResponseRate}%</p>
            </div>
            <div className="space-y-1">
                <p className="font-bold text-[13px] text-foreground uppercase tracking-tighter">Response time</p>
                <p className="text-sm text-muted-foreground">{hostResponseTime}</p>
            </div>
            <div className="space-y-1">
                <p className="font-bold text-[13px] text-foreground uppercase tracking-tighter">Speaks</p>
                <p className="text-sm text-muted-foreground">
                  {hostLanguages && hostLanguages.length > 0 
                    ? hostLanguages.join(', ') 
                    : "English, Lao, Thai"}
                </p>
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4">
            <Button variant="outline" className="rounded-xl font-bold h-12 px-8 border-foreground hover:bg-muted group">
                <MessageSquare className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Message host
            </Button>
            <Button variant="ghost" className="rounded-xl font-bold h-12 text-muted-foreground">
                View profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
