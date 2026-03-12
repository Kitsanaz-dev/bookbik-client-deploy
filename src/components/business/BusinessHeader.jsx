import { MapPin } from "lucide-react";

export default function BusinessHeader({ business, selectedService }) {
  if (!business) return null;

  const headerImage = selectedService 
    ? (selectedService.image ? (selectedService.image.startsWith('http') ? selectedService.image : `http://localhost:3000${selectedService.image}`) : "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200")
    : (business.image || "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200");

  const title = selectedService ? selectedService.name : business.business_name;
  const category = selectedService ? (selectedService.category || "PREMIUM SERVICE") : business.business_type;
  const address = selectedService ? (selectedService.location || business.address) : business.address;
  const description = !selectedService ? business.description : null;

  return (
    <div className="relative h-[300px] md:h-[400px] -mt-8 mb-8 md:mb-12">
      <img
        src={headerImage}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 max-w-7xl mx-auto text-left">
        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs md:text-sm font-bold mb-4 border border-white/30 tracking-widest uppercase">
          {category}
        </span>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2 leading-tight">
          {title}
        </h1>
        {address && (
          <div className="flex items-center text-gray-200 text-base md:text-xl">
            <MapPin className="w-5 h-5 md:w-6 h-6 mr-2 text-primary shrink-0" />
            <span className="truncate">{address}</span>
          </div>
        )}
        {description && (
          <p className="mt-4 text-white/80 max-w-2xl leading-relaxed hidden md:block">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
