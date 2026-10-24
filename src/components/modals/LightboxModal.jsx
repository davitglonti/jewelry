import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LightboxModal({
  lightboxImage,
  setLightboxImage,
  selectedProduct,
  activeImageIndex,
  setActiveImageIndex
}) {
  useEffect(() => {
    if (!lightboxImage || !selectedProduct?.images) return;
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        setActiveImageIndex((prev) => (prev + 1) % selectedProduct.images.length);
      } else if (e.key === "ArrowLeft") {
        setActiveImageIndex((prev) => (prev - 1 + selectedProduct.images.length) % selectedProduct.images.length);
      } else if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage, selectedProduct, setActiveImageIndex, setLightboxImage]);

  if (!lightboxImage) return null;

  return (
    <div
      onClick={() => setLightboxImage(null)}
      className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
      role="dialog"
      aria-modal="true"
      aria-label="სურათის სრული ეკრანი"
    >
      <button
        type="button"
        onClick={() => setLightboxImage(null)}
        aria-label="ფანჯრის დახურვა"
        className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6" />
      </button>

      <img
        src={selectedProduct?.images?.[activeImageIndex] || lightboxImage}
        alt={selectedProduct?.name ? `${selectedProduct.name} - სრული ზომა` : "სამკაულის ფოტო"}
        className="max-w-full max-h-[80vh] object-contain rounded-xl mb-4"
      />

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-60 flex flex-col items-center gap-4 w-full max-w-xs">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev - 1 + (selectedProduct.images?.length || 1)) % (selectedProduct.images?.length || 1));
            }}
            aria-label="წინა ფოტო"
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <span className="text-xs text-white/70 font-medium tracking-widest">
            {activeImageIndex + 1} / {selectedProduct?.images?.length || 0}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveImageIndex((prev) => (prev + 1) % (selectedProduct.images?.length || 1));
            }}
            aria-label="შემდეგი ფოტო"
            className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {selectedProduct?.images?.length > 1 && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            {selectedProduct.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                aria-label={`ფოტო ${idx + 1}`}
                className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIndex === idx ? "border-amber-500 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={imgUrl} alt={`${selectedProduct?.name || "სამკაული"} - ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
