import { Globe, Menu, User, LogOut, CalendarDays, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useState, useRef, useEffect } from "react";
import logo from "../assets/logo.svg";
export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-[120] bg-card/80 backdrop-blur-xl border-b border-border/50 py-2">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-20 ">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className=" rounded-full   shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform overflow-hidden">
           <img src={logo} alt="logo" className="w-16 h-16" />
          </div>
           <span className="font-bold text-2xl">bookbik</span>
        </Link>

        {/* Right */}
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link 
              to="/my-bookings" 
              className="hidden sm:flex items-center gap-2 text-sm font-bold text-foreground hover:bg-secondary rounded-full px-4 py-2.5 transition-all active:scale-95"
            >
              <CalendarDays className="w-4 h-4 text-primary" />
              My Bookings
            </Link>
          )}

          {isAuthenticated && (
            <Link 
              to="/favorites" 
              className="hidden md:flex items-center gap-2 text-sm font-bold text-foreground hover:bg-secondary rounded-full px-4 py-2.5 transition-all active:scale-95"
            >
              <Heart className="w-4 h-4 text-primary fill-primary" />
              Favorites
            </Link>
          )}
          
          <button 
            onClick={toggleLanguage}
            className="w-10 h-10 flex items-center justify-center hover:bg-secondary rounded-full transition-all active:scale-90"
          >
            <Globe className="w-4 h-4 text-foreground" />
            <span className="text-[10px] font-bold ml-0.5 uppercase">{language === "en" ? "EN" : "LA"}</span>
          </button>

          <div className="flex items-center gap-2 border border-border bg-card rounded-full p-1.5 pl-4 hover:shadow-md transition-all cursor-pointer group relative" ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 w-full focus:outline-none"
            >
              <Menu className={`w-4 h-4 ${dropdownOpen ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
              {isAuthenticated && (
                <span className="hidden sm:inline text-sm font-semibold text-foreground truncate max-w-[100px]">{user.name}</span>
              )}
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-sm">
                {isAuthenticated ? user.name[0].toUpperCase() : <User className="w-5 h-5" />}
              </div>
            </button>
            
            {/* Dropdown Menu - Click Based */}
            {dropdownOpen && (
              <div className="fixed top-auto left-auto w-64 bg-card rounded-2xl border border-border shadow-2xl p-2 z-[9999] animate-in fade-in zoom-in-95 duration-200" style={{
                top: `${dropdownRef.current?.getBoundingClientRect().bottom + 8}px`,
                right: `${window.innerWidth - (dropdownRef.current?.getBoundingClientRect().right || 0)}px`
              }}>
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-border/50 mb-1">
                      <p className="text-sm font-bold truncate">{user.name}</p>
                      <p className="text-xs text-black truncate">{user.email}</p>
                    </div>
                    <Link to="/my-bookings" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition-colors">My Bookings</Link>
                    <Link to="/favorites" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-semibold hover:bg-secondary rounded-xl transition-colors">Favorites</Link>
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 rounded-xl transition-colors flex items-center gap-2">
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" state={{ from: location.pathname }} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-bold hover:bg-secondary rounded-xl transition-colors">Sign up</Link>
                    <Link to="/login" state={{ from: location.pathname }} onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-sm font-medium hover:bg-secondary rounded-xl transition-colors">Log in</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
