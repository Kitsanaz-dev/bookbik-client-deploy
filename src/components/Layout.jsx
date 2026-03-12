import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useLanguage } from "../context/LanguageContext";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
      <Navbar />

      <main className={`min-h-[80vh] ${isHome ? "" : "pt-8 max-w-[1800px] mx-auto px-6 pb-20"}`}>
        <Outlet />
      </main>

      <footer className="bg-card border-t border-border/50 py-12 md:py-16">
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
             <div className="col-span-1 md:col-span-1">
                <p className="font-black text-xl text-primary tracking-tighter mb-4">Phajay</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t("nav.footer_desc") || "Discover and book the best local services across Laos."}
                </p>
             </div>
             <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/70">Explore</h4>
                <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
                  <li className="hover:text-primary cursor-pointer transition-colors">Stays</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Sports</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Dining</li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/70">Support</h4>
                <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
                  <li className="hover:text-primary cursor-pointer transition-colors">Help Center</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Safety</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Cancellation</li>
                </ul>
             </div>
             <div>
                <h4 className="font-bold text-sm mb-4 uppercase tracking-widest text-foreground/70">Community</h4>
                <ul className="space-y-3 text-sm font-semibold text-muted-foreground">
                  <li className="hover:text-primary cursor-pointer transition-colors">Become a host</li>
                  <li className="hover:text-primary cursor-pointer transition-colors">Affiliates</li>
                </ul>
             </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border/40 gap-4">
            <p className="text-[13px] font-medium text-muted-foreground">
              &copy; {new Date().getFullYear()} Phajay BookBik. {t("nav.rights")}
            </p>
            <div className="flex items-center gap-6 text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
               <span className="hover:text-primary cursor-pointer">Privacy</span>
               <span className="hover:text-primary cursor-pointer">Terms</span>
               <span className="hover:text-primary cursor-pointer">Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
