import React, { useState, useEffect } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import Video360Viewer from './Video360Viewer';
import { getOptimizedImageUrl } from '../../utils/imageUtils';

export default function ProductMediaGallery({
  images = [],
  productName = '',
  activeImageIndex = 0,
  setActiveImageIndex,
  active360Url = null,
  mediaViewMode = 'photo',
  setMediaViewMode,
  setLightboxImage,
  lang = 'ka'
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [imgError, setImgError] = useState(false);

  const currentMode = mediaViewMode || 'photo';
  const handleSetMode = setMediaViewMode || (() => {});

  const rawImage = images?.[activeImageIndex] || images?.[0] || '/brand-logo.jpg';
  const displayImage = imgError ? '/brand-logo.jpg' : getOptimizedImageUrl(rawImage, 1000, 82);

  useEffect(() => {
    setImgError(false);
  }, [rawImage]);

  const handleMouseMoveZoom = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="w-full space-y-3.5">
      {currentMode === '360' && active360Url ? (
        <Video360Viewer
          videoUrl={active360Url}
          productName={productName}
          darkMode={false}
          lang={lang}
          onExit={() => handleSetMode('photo')}
        />
      ) : (
        <div
          className="relative w-full aspect-square max-h-[540px] rounded-2xl bg-[#F3EFE8] border border-[#EAE4DB] shadow-[0_4px_24px_rgba(31,28,24,0.04)] overflow-hidden flex items-center justify-center cursor-zoom-in select-none group"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMoveZoom}
          onClick={() => setLightboxImage && setLightboxImage(displayImage)}
        >
          <img
            src={displayImage}
            alt={productName || 'სამკაული'}
            loading="eager"
            fetchPriority="high"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-200 select-none"
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: 'scale(2.05)'
                  }
                : {}
            }
          />

          {active360Url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSetMode('360');
              }}
              className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-white/95 hover:bg-[#1F1C18] hover:text-white border border-[#EAE4DB] text-[#1F1C18] text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>360° ხედი</span>
            </button>
          )}

          <div className="absolute bottom-4 right-4 z-10 px-3 py-1.5 rounded-full bg-white/90 border border-[#EAE4DB] text-[#4A453E] text-[11px] font-medium flex items-center gap-1.5 pointer-events-none backdrop-blur-xs">
            <ZoomIn className="w-3.5 h-3.5 text-[#9A7742]" />
            <span className="hidden sm:inline">
              {lang === 'ka' ? 'მიახლოება' : 'Zoom'}
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
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#1F1C18] hover:bg-[#1F1C18] hover:text-white border border-[#EAE4DB] flex items-center justify-center shadow-sm transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4 stroke-[1.75]" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex?.((prev) => (prev + 1) % images.length);
                }}
                aria-label={lang === 'ka' ? 'შემდეგი ფოტო' : 'Next photo'}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 text-[#1F1C18] hover:bg-[#1F1C18] hover:text-white border border-[#EAE4DB] flex items-center justify-center shadow-sm transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4 stroke-[1.75]" />
              </button>
            </>
          )}
        </div>
      )}

      {((images?.length > 1) || active360Url) && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {images?.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSetMode('photo');
                setActiveImageIndex?.(idx);
              }}
              aria-label={`${lang === 'ka' ? 'ფოტო' : 'Photo'} ${idx + 1}`}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl shrink-0 overflow-hidden bg-[#F3EFE8] border-2 transition-all cursor-pointer ${
                activeImageIndex === idx && currentMode === 'photo'
                  ? 'border-[#1F1C18] opacity-100'
                  : 'border-transparent opacity-70 hover:opacity-100 hover:border-[#D9D1C5]'
              }`}
            >
              <img
                src={getOptimizedImageUrl(imgUrl, 240, 75)}
                alt=""
                onError={(e) => { e.currentTarget.src = '/brand-logo.jpg'; }}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          {active360Url && (
            <button
              type="button"
              onClick={() => handleSetMode('360')}
              aria-label="360° ხედი"
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-xl shrink-0 border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                currentMode === '360'
                  ? 'border-[#1F1C18] bg-[#1F1C18] text-white'
                  : 'border-[#EAE4DB] bg-white text-[#4A453E] hover:border-[#1F1C18]'
              }`}
            >
              <RotateCw className="w-4 h-4 stroke-[1.75]" />
              <span className="text-[10px] font-semibold">360°</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
