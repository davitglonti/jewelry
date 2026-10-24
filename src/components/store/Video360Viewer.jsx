import React, { useRef, useState, useEffect, useCallback } from 'react';
import { RotateCw, Play, Pause, RotateCcw, Sparkles, Image as ImageIcon } from 'lucide-react';

export default function Video360Viewer({
  videoUrl,
  productName,
  darkMode,
  lang,
  onExit
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [degree, setDegree] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startProgressRef = useRef(0);
  const animFrameRef = useRef(null);

  // Initialize, load metadata and start auto-rotation immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const startAutoPlay = () => {
      setIsLoaded(true);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // If autoplay was deferred by policy
            setIsPlaying(false);
          });
      }
    };

    video.addEventListener('loadeddata', startAutoPlay);
    video.addEventListener('loadedmetadata', startAutoPlay);
    video.addEventListener('canplay', startAutoPlay);

    if (video.readyState >= 2) {
      startAutoPlay();
    }

    return () => {
      video.removeEventListener('loadeddata', startAutoPlay);
      video.removeEventListener('loadedmetadata', startAutoPlay);
      video.removeEventListener('canplay', startAutoPlay);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [videoUrl]);

  // Update degree during playback
  const handleTimeUpdate = () => {
    if (!videoRef.current || !videoRef.current.duration) return;
    const progress = videoRef.current.currentTime / videoRef.current.duration;
    setDegree(Math.round(progress * 360));
  };

  // Drag Start (Mouse & Touch)
  const handleDragStart = (clientX) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (!video.paused) {
      video.pause();
      setIsPlaying(false);
    }

    isDraggingRef.current = true;
    setIsDragging(true);
    setHasInteracted(true);
    startXRef.current = clientX;
    startProgressRef.current = video.currentTime / video.duration;
  };

  // Drag Move (Mouse & Touch)
  const handleDragMove = useCallback((clientX) => {
    if (!isDraggingRef.current || !videoRef.current || !videoRef.current.duration) return;

    const video = videoRef.current;
    const deltaX = clientX - startXRef.current;
    // 360px drag = 1 complete 360 degree rotation
    const sensitivity = 360;
    const deltaProgress = -deltaX / sensitivity;

    let newProgress = (startProgressRef.current + deltaProgress) % 1;
    if (newProgress < 0) newProgress += 1;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(() => {
      if (video && video.duration) {
        video.currentTime = Math.min(Math.max(newProgress * video.duration, 0), video.duration - 0.01);
        setDegree(Math.round(newProgress * 360));
      }
    });
  }, []);

  // Drag End
  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // Global mouse / touch listeners while dragging
  useEffect(() => {
    const onMouseMove = (e) => handleDragMove(e.clientX);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        handleDragMove(e.touches[0].clientX);
      }
    };
    const onTouchEnd = () => handleDragEnd();

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Toggle Auto-Rotate
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setHasInteracted(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Reset to 0 degrees
  const resetRotation = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    setIsPlaying(false);
    video.currentTime = 0.01;
    setDegree(0);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[calc(100vh-155px)] max-h-[700px] min-h-[350px] rounded-3xl overflow-hidden border flex items-center justify-center select-none ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      } ${darkMode ? 'bg-[#0f0e0c] border-stone-800' : 'bg-stone-50 border-stone-200 shadow-sm'}`}
      onMouseDown={(e) => handleDragStart(e.clientX)}
      onTouchStart={(e) => {
        if (e.touches && e.touches[0]) handleDragStart(e.touches[0].clientX);
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        muted
        loop
        autoPlay
        preload="auto"
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          if (!isDraggingRef.current) {
            setIsPlaying(false);
          }
        }}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-full object-contain pointer-events-none p-4"
      />

      {/* Top Left: 360° Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-400 backdrop-blur-md text-xs font-semibold tracking-wider shadow-lg pointer-events-none">
        <RotateCw className={`w-3.5 h-3.5 ${isPlaying ? 'animate-spin' : ''}`} />
        <span>360° ინტერაქტიული ხედი</span>
      </div>

      {/* Top Right: Exit to Photos Button */}
      {onExit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
          className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 hover:border-amber-500/50 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1.5 transition-all shadow-lg active:scale-95"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ka' ? 'ფოტოებზე დაბრუნება' : 'Back to Photos'}</span>
        </button>
      )}

      {/* Floating Tutorial Hint (fades out after user starts dragging) */}
      {!hasInteracted && isLoaded && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center z-10 pointer-events-none animate-pulse">
          <div className="px-5 py-2.5 rounded-full bg-black/75 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-medium backdrop-blur-md shadow-2xl flex items-center gap-2">
            <span>←</span>
            <span>{lang === 'ka' ? 'გადაუსვით თითი 360° დასატრიალებლად' : 'Drag horizontally to rotate 360°'}</span>
            <span>→</span>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-5 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-20 flex items-center justify-between sm:justify-center gap-2 sm:gap-3 px-4 py-2 rounded-2xl bg-black/70 border border-white/15 backdrop-blur-md text-white shadow-2xl"
      >
        {/* Play / Auto-rotate Toggle */}
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-black text-xs font-medium transition-all"
          title={isPlaying ? 'შეჩერება' : 'ავტო-ბრუნვა'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isPlaying ? 'პაუზა' : 'ავტო-ბრუნვა'}</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          onClick={resetRotation}
          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs transition-all"
          title="საწყისზე დაბრუნება (0°)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Degree Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-mono text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          <span>{degree}°</span>
        </div>
      </div>
    </div>
  );
}
