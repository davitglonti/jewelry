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
    <div className="space-y-4">
      {/* View Mode Toggle Pill (Photos vs 360°) */}
      {active360Url && (
        <div className="flex items-center gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleSetMode('photo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              currentMode === 'photo'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-stone-800/80 hover:bg-stone-800 text-stone-300 border border-stone-700/60'
            }`}
          >
            <span>📷 {lang === 'ka' ? 'ფოტოები' : 'Photos'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleSetMode('360')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
              currentMode === '360'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                : 'bg-stone-800/80 hover:bg-stone-800 text-amber-400 border border-amber-500/30'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${currentMode === '360' ? 'animate-spin' : ''}`} />
            <span>360° {lang === 'ka' ? 'ხედი' : 'View'}</span>
          </button>
        </div>
      )}

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
          className={`relative w-full h-[calc(100vh-155px)] max-h-[700px] min-h-[350px] rounded-3xl overflow-hidden border flex items-center justify-center cursor-zoom-in group ${
            darkMode ? 'bg-[#141210] border-stone-800' : 'bg-white border-stone-200/80 shadow-sm'
          }`}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMoveZoom}
          onClick={() => setLightboxImage && setLightboxImage(currentImage)}
        >
          {currentImage ? (
            <img
              src={currentImage}
              alt={productName}
              className="w-full h-full object-contain transition-transform duration-200 p-4"
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: 'scale(2.35)'
                    }
                  : {}
              }
            />
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

          <div className="absolute bottom-4 right-4 px-3.5 py-2 rounded-full bg-black/70 text-white text-xs flex items-center gap-2 pointer-events-none backdrop-blur-sm">
            <ZoomIn className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {lang === 'ka' ? 'მაუსით მიახლოება / გადიდება' : 'Hover to Zoom / Click Fullscreen'}
            </span>
            <span className="sm:hidden">
              {lang === 'ka' ? 'შეეხეთ გასადიდებლად' : 'Tap to zoom'}
            </span>
          </div>

          {images?.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex?.((prev) => (prev - 1 + images.length) % images.length);
                }}
                aria-label={lang === 'ka' ? 'წინა ფოტო' : 'Previous photo'}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-sm transition-all"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 text-white hover:bg-black backdrop-blur-sm transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Thumbnails Row */}
      {((images?.length > 1) || active360Url) && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {active360Url && (
            <button
              type="button"
              onClick={() => handleSetMode('360')}
              aria-label="360° ხედი"
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all relative flex flex-col items-center justify-center ${
                currentMode === '360'
                  ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-105 shadow-lg shadow-amber-500/20'
                  : 'border-stone-700/80 bg-black/60 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 opacity-80 hover:opacity-100'
              }`}
            >
              <RotateCw className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5 tracking-wider">360°</span>
            </button>
          )}
          {images?.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSetMode('photo');
                setActiveImageIndex?.(idx);
              }}
              aria-label={`${lang === 'ka' ? 'ფოტო' : 'Photo'} ${idx + 1}`}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                currentMode === 'photo' && activeImageIndex === idx
                  ? 'border-amber-500 scale-105 shadow-lg shadow-amber-500/20'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={imgUrl} alt={`${productName} - ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
