import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LightboxModal({
  lightboxImage,
  setLightboxImage,
  selectedProduct,
  activeImageIndex,
  setActiveImageIndex
}) {
  const images = selectedProduct?.images || (lightboxImage ? [lightboxImage] : []);
  const total = images.length;

  useEffect(() => {
    if (!lightboxImage) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" && total > 1) {
        setActiveImageIndex((prev) => (prev + 1) % total);
      } else if (e.key === "ArrowLeft" && total > 1) {
        setActiveImageIndex((prev) => (prev - 1 + total) % total);
      } else if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, total, setActiveImageIndex, setLightboxImage]);

  if (!lightboxImage) return null;

  const currentImage = images[activeImageIndex] || lightboxImage;

  return (
    <div
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 cursor-zoom-out select-none"
      role="dialog"
      aria-modal="true"
      aria-label="სურათის სრული ეკრანი"
    >
      {/* Top Left: SKU / Index Badge */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-5 sm:top-6 left-5 sm:left-8 z-50 flex items-center gap-2.5 px-4 py-2 rounded-full bg-black/60 border border-white/15 backdrop-blur-md text-white shadow-xl pointer-events-auto"
      >
        <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
          {selectedProduct?.sku || "MATARE"}
        </span>
        {total > 1 && (
          <>
            <span className="opacity-30">•</span>
            <span className="font-mono text-xs font-medium text-stone-200">
              {activeImageIndex + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Top Right: Close Button */}
      <button
        type="button"
        onClick={() => setLightboxImage(null)}
        aria-label="ფანჯრის დახურვა"
        title="დახურვა (ESC)"
        className="absolute top-5 sm:top-6 right-5 sm:right-8 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-white/20 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-xl hover:scale-105"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Left Navigation Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveImageIndex((prev) => (prev - 1 + total) % total);
          }}
          aria-label="წინა ფოტო"
          title="წინა ფოტო (←)"
          className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white border border-white/20 hover:border-amber-500 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      )}

      {/* Center Image Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-[92vw] sm:max-w-[85vw] max-h-[74vh] sm:max-h-[76vh] flex items-center justify-center cursor-default"
      >
        <img
          key={currentImage}
          src={currentImage}
          alt={selectedProduct?.name ? `${selectedProduct.name} - სრული ზომა` : "სამკაულის ფოტო"}
          className="max-w-full max-h-[74vh] sm:max-h-[76vh] w-auto h-auto object-contain rounded-2xl shadow-2xl shadow-black/90 transition-all duration-300"
        />
      </div>

      {/* Right Navigation Arrow */}
      {total > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveImageIndex((prev) => (prev + 1) % total);
          }}
          aria-label="შემდეგი ფოტო"
          title="შემდეგი ფოტო (→)"
          className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black text-white border border-white/20 hover:border-amber-500 backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-2xl hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      )}

      {/* Bottom Thumbnails Strip */}
      {total > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[92vw] overflow-x-auto p-1.5 rounded-2xl bg-black/60 border border-white/15 backdrop-blur-md shadow-2xl flex items-center gap-2"
        >
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              aria-label={`ფოტო ${idx + 1}`}
              className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 shrink-0 ${
                activeImageIndex === idx
                  ? "border-amber-500 scale-105 ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/20"
                  : "border-transparent opacity-50 hover:opacity-100 hover:border-white/30"
              }`}
            >
              <img
                src={imgUrl}
                alt={`${selectedProduct?.name || "სამკაული"} - ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
