import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Loader2, ArrowLeft, Ghost } from "lucide-react";
import { favoritesAPI } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import ServiceCard from "../components/ServiceCard";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/favorites" } });
      return;
    }
    fetchFavorites();
  }, [isAuthenticated, authLoading]);

  const fetchFavorites = async () => {
    try {
      const res = await favoritesAPI.list();
      setFavorites(res.data.data);
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (e, businessId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await favoritesAPI.toggle(businessId);
      // Remove from local state immediately for better UX
      setFavorites((prev) => prev.filter((b) => b._id !== businessId));
    } catch (err) {
      console.error("Failed to toggle favorite", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
        <p className="text-muted-foreground font-bold animate-pulse text-sm uppercase tracking-widest">
          Loading your favorites...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1450px] mx-auto px-6 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
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
          <h1 className="text-4xl font-black text-foreground tracking-tighter">
            My Favorites
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Businesses you've saved for later
          </p>
        </div>

        <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
          <Heart className="w-5 h-5 text-primary fill-primary" />
          <span className="font-bold text-primary">
            {favorites.length} Saved
          </span>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {favorites.map((item, i) => (
            <div
              key={item.key}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <ServiceCard service={item.svc} resource={item.res} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-card rounded-[3rem] border border-dashed border-border/60 max-w-2xl mx-auto animate-in fade-in zoom-in duration-700">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
            <Ghost className="w-12 h-12 text-primary opacity-20" />
          </div>
          <h3 className="text-3xl font-black mb-4 tracking-tight">
            Your favorites list is empty
          </h3>
          <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
            Save businesses you love to find them quickly and book your next
            session.
          </p>
          <Button
            onClick={() => navigate("/")}
            className="px-8 h-14 rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            Explore Businesses
          </Button>
        </div>
      )}
    </div>
  );
}
