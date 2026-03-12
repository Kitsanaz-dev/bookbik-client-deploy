import React, { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent } from "../ui/dialog";
import { ChevronLeft, ChevronRight, X, Grid3X3 } from "lucide-react";

const getUrl = (img) =>
  img && (img.startsWith("http") ? img : `http://localhost:3000${img}`);

function Cell({
  src,
  index,
  label,
  onOpen,
  className = "",
}) {
  return (
    <div
      className={`relative overflow-hidden cursor-pointer group bg-muted/50 ${className}`}
      onClick={() => onOpen(index)}
    >
      <img
        src={getUrl(src)}
        alt={label}
        loading={index === 0 ? "eager" : "lazy"}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
    </div>
  );
}

function ShowAllBtn({ onOpen }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onOpen(0);
      }}
      className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-card hover:bg-secondary border border-border shadow-md text-foreground text-[11px] font-semibold px-4 py-2 rounded-lg hover:scale-105 transition-all"
    >
      <Grid3X3 className="w-3.5 h-3.5" />
      Show all photos
    </button>
  );
}

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
  title,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onPrev, onNext, onClose]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] w-full h-screen p-0 bg-black border-none flex items-center justify-center overflow-hidden outline-none [&>button]:hidden">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 z-50 bg-white/10 hover:bg-white/20 rounded-full p-2.5 transition-all backdrop-blur-md border border-white/10"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="absolute top-5 right-5 z-50 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
          <span className="text-white/90 text-xs font-mono">
            {index + 1} / {images.length}
          </span>
        </div>

        <button
          onClick={onPrev}
          className="absolute left-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all backdrop-blur-md border border-white/20 hidden sm:block"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <img
          src={getUrl(images[index])}
          alt={`${title} - ${index + 1}`}
          className="max-h-[85vh] max-w-[90vw] object-contain select-none"
        />

        <button
          onClick={onNext}
          className="absolute right-4 z-50 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all backdrop-blur-md border border-white/20 hidden sm:block"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>
      </DialogContent>
    </Dialog>
  );
}

export default function PhotoGallery({
  images,
  title = "Gallery",
}) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const open = useCallback((i) => setLightboxIndex(i), []);
  const close = useCallback(() => setLightboxIndex(null), []);
  const prev = useCallback(
    () => setLightboxIndex((i) => ((i ?? 0) - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setLightboxIndex((i) => ((i ?? 0) + 1) % images.length),
    [images.length]
  );

  if (!images || images.length === 0) return null;

  const display = images.slice(0, 5);
  const count = display.length;

  const renderGrid = () => {
    // 1 Image
    if (count === 1) {
      return (
        <div className="relative overflow-hidden aspect-[16/9] sm:aspect-[2/1] border border-border">
          <Cell src={display[0]} index={0} label={title} onOpen={open} className="absolute inset-0" />
        </div>
      );
    }

    // 2 Images
    if (count === 2) {
      return (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2  overflow-hidden border border-border">
          <div className="aspect-[16/9] sm:aspect-auto sm:h-[550px]">
            <Cell src={display[0]} index={0} label={`${title} 1`} onOpen={open} className="h-full w-full" />
          </div>
          <div className="aspect-[16/9] sm:aspect-auto sm:h-[550px]">
            <Cell src={display[1]} index={1} label={`${title} 2`} onOpen={open} className="h-full w-full" />
          </div>
          <ShowAllBtn onOpen={open} />
        </div>
      );
    }

    // 3 Images
    if (count === 3) {
      return (
        <div className="relative  overflow-hidden border border-border">
          <div className="sm:hidden aspect-[16/9] relative">
            <Cell src={display[0]} index={0} label={title} onOpen={open} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-2 h-[550px]">
            <Cell src={display[0]} index={0} label={`${title} 1`} onOpen={open} className="h-full" />
            <div className="grid grid-rows-2 gap-2 h-full min-h-0">
              <Cell src={display[1]} index={1} label={`${title} 2`} onOpen={open} className="h-full min-h-0 overflow-hidden" />
              <Cell src={display[2]} index={2} label={`${title} 3`} onOpen={open} className="h-full min-h-0 overflow-hidden" />
            </div>
          </div>
          <ShowAllBtn onOpen={open} />
        </div>
      );
    }

    // 4 Images
    if (count === 4) {
      return (
        <div className="relative  overflow-hidden border border-border">
          <div className="sm:hidden aspect-[16/9] relative">
            <Cell src={display[0]} index={0} label={title} onOpen={open} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="hidden sm:grid grid-cols-2 gap-2 h-[550px]">
            <Cell src={display[0]} index={0} label={`${title} 1`} onOpen={open} className="h-full" />
            <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full min-h-0">
              <Cell src={display[1]} index={1} label={`${title} 2`} onOpen={open} className="h-full min-h-0 overflow-hidden" />
              <Cell src={display[2]} index={2} label={`${title} 3`} onOpen={open} className="h-full min-h-0 overflow-hidden" />
              <Cell src={display[3]} index={3} label={`${title} 4`} onOpen={open} className="h-full min-h-0 overflow-hidden col-span-2" />
            </div>
          </div>
          <ShowAllBtn onOpen={open} />
        </div>
      );
    }

    // 5+ images: Airbnb classic layout
    return (
      <div className="relative  overflow-hidden border border-border">
        {/* Mobile: hero only */}
        <div className="sm:hidden aspect-[16/9] relative">
          <Cell src={display[0]} index={0} label={title} onOpen={open} className="absolute inset-0 w-full h-full" />
        </div>
        {/* Desktop: 50% left hero + 2×2 right grid */}
        <div className="hidden sm:grid grid-cols-2 gap-2 h-[400px]">
          <Cell src={display[0]} index={0} label={`${title} 1`} onOpen={open} className="h-full" />
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">
            {display.slice(1, 5).map((img, i) => (
              <Cell
                key={i}
                src={img}
                index={i + 1}
                label={`${title} ${i + 2}`}
                onOpen={open}
                className="h-full"
              />
            ))}
          </div>
        </div>
        <ShowAllBtn onOpen={open} />
      </div>
    );
  };

  return (
    <>
      <div className="relative w-full">{renderGrid()}</div>
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={close}
          onPrev={prev}
          onNext={next}
          title={title}
        />
      )}
    </>
  );
}