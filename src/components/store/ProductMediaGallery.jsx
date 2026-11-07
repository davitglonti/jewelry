import React, { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Video360Viewer from './Video360Viewer';

export default function ProductMediaGallery({
  images = [],
  productName = '',
  activeImageIndex = 0,
  setActiveImageIndex,
  active360Url = null,
  mediaViewMode = 'photo',
  setMediaViewMode,
  setLightboxImage,
  darkMode = true,
  lang = 'ka'
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const currentMode = mediaViewMode || 'photo';
  const handleSetMode = setMediaViewMode || (() => {});

  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const currentImage = images?.[activeImageIndex] || images?.[0] || '';

  return (
    <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-0">
      {/* Media Viewer: 360° Video Scrubber OR Photo Viewer */}
      {currentMode === '360' && active360Url ? (
        <Video360Viewer
          videoUrl={active360Url}
          productName={productName}
          darkMode={darkMode}
          lang={lang}
          onExit={() => handleSetMode('photo')}
        />
      ) : (
        <div
          className={`relative w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-0 rounded-3xl overflow-hidden border flex items-center justify-center cursor-zoom-in select-none group ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200/80 shadow-sm'
          }`}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMoveZoom}
          onClick={() => setLightboxImage && setLightboxImage(currentImage)}
        >
          {currentImage ? (
            <div className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center overflow-hidden pointer-events-none">
              <img
                src={currentImage}
                alt={productName}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-contain transition-transform duration-200 select-none"
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        transform: 'scale(2.35)'
                      }
                    : {}
                }
              />
            </div>
          ) : (
            <div className="text-stone-400 text-sm">
              {lang === 'ka' ? 'ფოტო არ არის' : 'No image available'}
            </div>
          )}

          {/* 360° Floating Shortcut Badge on Photo */}
          {active360Url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSetMode('360');
              }}
              className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-amber-500 hover:text-black border border-amber-500/40 text-amber-400 text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>360° ხედი</span>
            </button>
          )}

          {/* Zoom Info Pill (Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-10 px-3.5 py-2 rounded-full bg-black/75 text-white text-xs flex items-center gap-2 pointer-events-none backdrop-blur-md border border-white/10 shadow-lg">
            <ZoomIn className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {lang === 'ka' ? 'მაუსით მიახლოება / გადიდება' : 'Hover to Zoom / Click Fullscreen'}
            </span>
            <span className="sm:hidden">
              {lang === 'ka' ? 'შეეხეთ გასადიდებლად' : 'Tap to zoom'}
            </span>
          </div>

          {/* Previous / Next Arrows on Hover */}
          {images?.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex?.((prev) => (prev - 1 + images.length) % images.length);
                }}
                aria-label={lang === 'ka' ? 'წინა ფოტო' : 'Previous photo'}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 border border-white/10 backdrop-blur-sm transition-all z-20 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex?.((prev) => (prev + 1) % images.length);
                }}
                aria-label={lang === 'ka' ? 'შემდეგი ფოტო' : 'Next photo'}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black/90 hover:scale-110 border border-white/10 backdrop-blur-sm transition-all z-20 cursor-pointer shadow-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Floating Thumbnails Pill (Bottom Left Overlay) */}
          {((images?.length > 1) || active360Url) && (
            <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-2xl bg-black/75 backdrop-blur-md border border-white/15 shadow-2xl max-w-[calc(100%-220px)] overflow-x-auto scrollbar-none">
              {active360Url && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetMode('360');
                  }}
                  aria-label="360° ხედი"
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all flex flex-col items-center justify-center cursor-pointer ${
                    currentMode === '360'
                      ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105 shadow-md shadow-amber-500/30'
                      : 'border-white/20 bg-black/40 text-stone-300 hover:text-amber-400 hover:border-amber-500/50'
                  }`}
                >
                  <RotateCw className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5 tracking-wider">360°</span>
                </button>
              )}
              {images?.map((imgUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetMode('photo');
                    setActiveImageIndex?.(idx);
                  }}
                  aria-label={`${lang === 'ka' ? 'ფოტო' : 'Photo'} ${idx + 1}`}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                    activeImageIndex === idx && currentMode === 'photo'
                      ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/30 ring-1 ring-amber-500/50'
                      : 'border-white/20 opacity-70 hover:opacity-100 hover:border-amber-500/60'
                  }`}
                >
                  <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
