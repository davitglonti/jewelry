import React, { useState, useEffect } from 'react';
import { Maximize2, RotateCw } from 'lucide-react';
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
  const displayImage = imgError ? '/brand-logo.jpg' : getOptimizedImageUrl(rawImage, 1000, 85);

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
    <div className="w-full space-y-4">
      {/* Main Image Container */}
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
          className="relative w-full aspect-[4/3] rounded-3xl bg-[#F7F5F0] border border-[#EAE4DB] shadow-[0_4px_24px_rgba(31,28,24,0.03)] overflow-hidden flex items-center justify-center cursor-zoom-in select-none group"
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
                    transform: 'scale(1.9)'
                  }
                : {}
            }
          />

          {/* Top Left Floating 360 Badge */}
          {active360Url && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSetMode('360');
              }}
              className="absolute top-4 left-4 z-10 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-[#1F1C18] border border-white/60 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>360° View</span>
            </button>
          )}

          {/* Bottom Right Floating Expand Icon */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxImage && setLightboxImage(displayImage);
            }}
            aria-label="Expand image"
            className="absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full bg-white/80 backdrop-blur-md text-[#1F1C18] hover:bg-white border border-white/60 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
          >
            <Maximize2 className="w-4 h-4 stroke-[1.75]" />
          </button>
        </div>
      )}

      {/* Thumbnails Row */}
      {((images?.length > 1) || active360Url) && (
        <div className="grid grid-cols-5 gap-3">
          {images?.slice(0, active360Url ? 4 : 5).map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                handleSetMode('photo');
                setActiveImageIndex?.(idx);
              }}
              aria-label={`${lang === 'ka' ? 'ფოტო' : 'Photo'} ${idx + 1}`}
              className={`rounded-2xl overflow-hidden aspect-square bg-[#F7F5F0] border-2 transition-all cursor-pointer ${
                activeImageIndex === idx && currentMode === 'photo'
                  ? 'border-[#1F1C18] shadow-xs'
                  : 'border-[#EAE4DB] hover:border-[#1F1C18]/60 opacity-80 hover:opacity-100'
              }`}
            >
              <img
                src={getOptimizedImageUrl(imgUrl, 200, 75)}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}

          {/* 360° Thumbnail Button */}
          {active360Url && (
            <button
              type="button"
              onClick={() => handleSetMode('360')}
              aria-label="360 view"
              className={`rounded-2xl aspect-square flex flex-col items-center justify-center bg-[#F4F1EA] border-2 transition-all cursor-pointer ${
                currentMode === '360'
                  ? 'border-[#1F1C18] text-[#1F1C18]'
                  : 'border-[#EAE4DB] text-[#5C564E] hover:border-[#1F1C18]'
              }`}
            >
              <RotateCw className="w-5 h-5 stroke-[1.75] mb-0.5" />
              <span className="text-[11px] font-semibold tracking-wider">360°</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
