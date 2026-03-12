import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";

export default function ResourceList({ 
  resources, 
  selectedService, 
  selectedResource, 
  serviceIdParam, 
  onSelectResource, 
  onBack 
}) {
  const filteredResources = resources
    .filter((r) => r.service_ids?.some((s) => s._id === selectedService?._id || s === selectedService?._id))
    .concat(resources.filter((r) => !r.service_ids || r.service_ids.length === 0))
    .filter((r, index, self) => self.findIndex(x => (x._id === r._id)) === index);

  return (
    <section className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center text-foreground">
        <span className="w-10 h-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-base mr-3 font-bold shadow-sm">
          3
        </span>
        Select Court
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => (
          <button
            key={res._id}
            onClick={() => onSelectResource(res)}
            className={`p-6 rounded-xl border text-left transition-all relative overflow-hidden group ${
              selectedResource?._id === res._id
                ? "border-primary bg-background ring-2 ring-primary/20 shadow-lg"
                : "border-border hover:border-primary/50 hover:shadow-md bg-background"
            }`}
          >
            {res.image && (
              <div className="mb-4 -mx-6 -mt-6 h-32 overflow-hidden">
                <img 
                  src={res.image.startsWith('http') ? res.image : `http://localhost:3000${res.image}`} 
                  alt={res.name} 
                  className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" 
                />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                {res.name}
              </span>
              {selectedResource?._id === res._id && (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex items-center justify-between mt-4 border-t border-border/50 pt-4">
               <span className="text-base font-medium text-muted-foreground">
                {res.resource_type} • Cap: {res.capacity}
              </span>
            </div>
          </button>
        ))}
      </div>
      {!serviceIdParam && (
        <Button variant="ghost" onClick={onBack} className="mt-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      )}
    </section>
  );
}
