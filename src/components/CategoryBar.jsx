import { Home, Building2, Sparkles, Trophy, Utensils, Ticket, LayoutGrid, Waves, Mountain, TreePine, Grid3X3 } from "lucide-react";

const iconMap = {
  all: Grid3X3,
  Stay: Home,
  Dining: Utensils,
  Sports: Trophy,
  Beauty: Sparkles,
  Events: Ticket,
  General: Building2,
};

export default function CategoryBar({ categories, selected, onSelect }) {
  return (
    <div className="flex gap-8 overflow-x-auto scrollbar-hide py-6 border-b border-border no-scrollbar">
      {categories.map((cat) => {
        const Icon = iconMap[cat.id] || Grid3X3;
        const isActive = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`flex flex-col items-center gap-2 min-w-[66px] pb-3 border-b-2 transition-all text-[16px] font-semibold ${
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
            }`}
          >
            <Icon className={`w-7 h-7 ${isActive ? "text-primary" : ""}`} />
            <span className="whitespace-nowrap tracking-tight text-[16px]">{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
