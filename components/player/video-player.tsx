"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import HLS from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  SkipForward,
  SkipBack,
  ChevronsRight,
  ChevronsLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface VideoPlayerProps {
  videoUrl: string;
  autoplay?: boolean;
  poster?: string;
  onError?: (error: any) => void;
  onEnded?: () => void;
  onSwitchToEmbed?: () => void;
  onProgress?: (currentTime: number, duration: number) => void;
  initialTime?: number;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const VideoPlayer = ({
  videoUrl,
  autoplay = true,
  poster,
  onError,
  onEnded,
  onSwitchToEmbed,
  onProgress,
  initialTime = 0,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<HLS | null>(null);
  const seekedRef = useRef(false);
  const lastReportedTimeRef = useRef(0);

  // Reset seekedRef and lastReportedTimeRef when URL changes
  useEffect(() => {
    seekedRef.current = false;
    lastReportedTimeRef.current = 0;
  }, [videoUrl]);

  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buffered, setBuffered] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<number>(-1); // -1 is auto
  const [qualities, setQualities] = useState<{ height: number, level: number }[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Double tap state
  const [skipAnimation, setSkipAnimation] = useState<{ side: 'left' | 'right', id: number } | null>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // HLS and Video Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl || videoUrl.trim() === '') {
      setIsLoading(false);
      setError(null);
      return;
    }

    setError(null);
    setIsLoading(true);

    // Timeout for loading
    const loadTimeout = setTimeout(() => {
      if (isLoading) {
        console.error('Video load timeout');
        setError('Không thể tải video. Vui lòng thử chế độ Embed.');
        setIsLoading(false);
      }
    }, 30000); // 30 seconds timeout

    const initHls = () => {
      if (HLS.isSupported()) {
        const hls = new HLS({
          // === FAST STARTUP - Load video quickly ===
          enableWorker: true,              // Use web worker for better performance
          lowLatencyMode: true,            // Enable low latency streaming
          
          // Minimal initial buffer for instant playback
          maxBufferLength: 10,             // Reduced from 20 for faster startup
          maxBufferSize: 60 * 1000 * 1000, // 60MB max buffer
          maxBufferHole: 0.5,              // Tolerate small gaps for faster seeking
          
          // === AGGRESSIVE QUALITY SELECTION ===
          startLevel: -1,                  // Auto-detect best quality immediately
          abrEwmaDefaultEstimate: 20000000, // Assume 20 Mbps - favor high quality
          abrBandWidthFactor: 0.9,         // Very conservative downgrades (keep quality)
          abrBandWidthUpFactor: 0.5,       // Aggressive upgrades to best quality
          abrEwmaFastLive: 2,              // Fast adaptation
          abrEwmaSlowLive: 6,              // Quick response to bandwidth changes
          
          // === MAX QUALITY SETTINGS ===
          capLevelToPlayerSize: false,     // Allow 4K even on smaller screens
          maxLoadingDelay: 4,              // Reduce wait time for best quality
          minAutoBitrate: 500000,          // Minimum 500 Kbps quality
          
          // === SMOOTH SEEKING & LOADING ===
          startFragPrefetch: true,         // Preload next fragment immediately
          maxFragLookUpTolerance: 0.1,     // Better seeking precision
          progressive: true,               // Progressive download for faster start
          
          // === BUFFER OPTIMIZATION ===
          backBufferLength: 20,            // Keep 20s back buffer for rewind
          frontBufferFlushThreshold: 600,  // 10 minutes forward buffer max
          
          // === RELIABILITY - More retries for stable playback ===
          manifestLoadingMaxRetry: 8,
          manifestLoadingRetryDelay: 500,
          levelLoadingMaxRetry: 8,
          levelLoadingRetryDelay: 500,
          fragLoadingMaxRetry: 8,
          fragLoadingRetryDelay: 500,
          
          // === FAST RECOVERY ===
          manifestLoadingTimeOut: 10000,   // 10s timeout for manifest
          levelLoadingTimeOut: 10000,      // 10s timeout for level
          fragLoadingTimeOut: 20000,       // 20s timeout for fragments
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
        hlsRef.current = hls;

        hls.on(HLS.Events.MANIFEST_PARSED, (event, data) => {
          console.log("Manifest parsed", data);
          clearTimeout(loadTimeout);
          setIsLoading(false);

          // Get available qualities
          const availableQualities = data.levels.map((l, index) => ({
            height: l.height,
            level: index
          })).sort((a, b) => b.height - a.height);
          setQualities(availableQualities);

          if (initialTime && initialTime > 0 && !seekedRef.current) {
            video.currentTime = initialTime;
            seekedRef.current = true;
          }

          if (autoplay) {
            video.play().catch((e) => {
              if (e.name !== 'AbortError') console.error('Autoplay failed:', e);
            });
          }
        });

        hls.on(HLS.Events.ERROR, (event, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            clearTimeout(loadTimeout);
            switch (data.type) {
              case HLS.ErrorTypes.NETWORK_ERROR:
                if (retryCount < maxRetries) {
                  console.error(`Network error, retrying... (${retryCount + 1}/${maxRetries})`);
                  setRetryCount(prev => prev + 1);
                  setTimeout(() => hls.startLoad(), 1000);
                } else {
                  setError("Lỗi mạng. Đang chuyển sang chế độ Dự phòng...");
                  setIsLoading(false);
                  setTimeout(() => onSwitchToEmbed?.(), 1500);
                }
                break;
              case HLS.ErrorTypes.MEDIA_ERROR:
                if (retryCount < maxRetries) {
                  console.error(`Media error, recovering... (${retryCount + 1}/${maxRetries})`);
                  setRetryCount(prev => prev + 1);
                  hls.recoverMediaError();
                } else {
                  setError("Lỗi media. Đang chuyển sang chế độ Dự phòng...");
                  setIsLoading(false);
                  setTimeout(() => onSwitchToEmbed?.(), 1500);
                }
                break;
              default:
                setError("Không thể tải video. Vui lòng thử chế độ Dự phòng.");
                setIsLoading(false);
                onError?.(data);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          clearTimeout(loadTimeout);
          setIsLoading(false);
          if (initialTime && initialTime > 0 && !seekedRef.current) {
            video.currentTime = initialTime;
            seekedRef.current = true;
          }
          if (autoplay) video.play();
        });
        video.addEventListener('error', () => {
          clearTimeout(loadTimeout);
          setError("Không thể tải video. Vui lòng thử chế độ Embed.");
          setIsLoading(false);
        });
      } else {
        clearTimeout(loadTimeout);
        setError("Trình duyệt không hỗ trợ phát video này. Vui lòng thử chế độ Embed.");
        setIsLoading(false);
      }
    };

    initHls();

    return () => {
      clearTimeout(loadTimeout);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      video.src = '';
    };
  }, [videoUrl, autoplay, onError]);

  // Event Listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      const time = video.currentTime;
      setCurrentTime(time);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
      if (onProgress && Math.abs(time - lastReportedTimeRef.current) >= 1.5) {
        onProgress(time, video.duration || 0);
        lastReportedTimeRef.current = time;
      }
    };
    const onDurationChange = () => setDuration(video.duration);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onEndedEvent = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('ended', onEndedEvent);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('ended', onEndedEvent);
    };
  }, [onEnded, onProgress]);

  // Controls Visibility
  const showControlsHandler = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    } else {
      showControlsHandler();
    }
  }, [isPlaying, showControlsHandler]);

  // Fullscreen change event listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Listen to all vendor-specific fullscreen change events
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // iOS Safari events on video element
    const video = videoRef.current;
    if (video) {
      video.addEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
      video.addEventListener('webkitendfullscreen', () => setIsFullscreen(false));
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (video) {
        video.removeEventListener('webkitbeginfullscreen', () => setIsFullscreen(true));
        video.removeEventListener('webkitendfullscreen', () => setIsFullscreen(false));
      }
    };
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;

      // Prevent default scrolling for space and arrow keys
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
        case 'KeyK':
          togglePlay();
          break;
        case 'ArrowRight':
        case 'KeyL':
          skip(10);
          setSkipAnimation({ side: 'right', id: Date.now() });
          break;
        case 'ArrowLeft':
        case 'KeyJ':
          skip(-10);
          setSkipAnimation({ side: 'left', id: Date.now() });
          break;
        case 'ArrowUp':
          handleVolumeChange([Math.min(volume + 0.1, 1)]);
          break;
        case 'ArrowDown':
          handleVolumeChange([Math.max(volume - 0.1, 0)]);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
      // showControlsHandler(); // Removed to prevent controls from showing on key press
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume, showControlsHandler]);

  // Actions
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current || !videoRef.current) return;

    try {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isCurrentlyFullscreen) {
        // Enter fullscreen - try container first, then video element for iOS
        const container = containerRef.current;
        const video = videoRef.current;

        if (container.requestFullscreen) {
          await container.requestFullscreen();
        } else if ((container as any).webkitRequestFullscreen) {
          await (container as any).webkitRequestFullscreen();
        } else if ((container as any).mozRequestFullScreen) {
          await (container as any).mozRequestFullScreen();
        } else if ((container as any).msRequestFullscreen) {
          await (container as any).msRequestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          // iOS Safari fallback - use video element's native fullscreen
          (video as any).webkitEnterFullscreen();
        }

        // Try to lock orientation to landscape on mobile
        try {
          if (screen.orientation && (screen.orientation as any).lock) {
            await (screen.orientation as any).lock('landscape');
          }
        } catch (err) {
          // Orientation lock may not be supported, ignore
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }

        // Unlock orientation
        try {
          if (screen.orientation && (screen.orientation as any).unlock) {
            (screen.orientation as any).unlock();
          }
        } catch (err) {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
      if (!isMuted) setVolume(0);
      else setVolume(1);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = newVolume === 0;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setQuality(level);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  // Smart Click Handler (Double tap detection)
  const handleSmartClick = (e: React.MouseEvent<HTMLDivElement>, side: 'left' | 'right' | 'center') => {
    e.stopPropagation();
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;

    if (timeDiff < 300) {
      // Double click detected
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
      }

      if (side === 'left') {
        skip(-10);
        setSkipAnimation({ side: 'left', id: now });
      } else if (side === 'right') {
        skip(10);
        setSkipAnimation({ side: 'right', id: now });
      } else {
        toggleFullscreen();
      }
    } else {
      // Single click - capture current state to decide action
      const currentControlsState = showControls;

      clickTimeoutRef.current = setTimeout(() => {
        // Clear any auto-hide timeout
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
          controlsTimeoutRef.current = null;
        }

        // Toggle based on state at time of click
        if (!currentControlsState) {
          showControlsHandler();
        } else {
          setShowControls(false);
        }
        clickTimeoutRef.current = null;
      }, 300);
    }

    lastClickTimeRef.current = now;
  };

  return (
    <div
      ref={containerRef}
      data-fullscreen={isFullscreen}
      className={cn(
        "relative bg-black group overflow-hidden select-none",
        "w-full aspect-video"
      )}
      onMouseMove={(e) => {
        if (e.movementX !== 0 || e.movementY !== 0) {
          showControlsHandler();
        }
      }}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Video Element - Optimized for fast loading */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{
          colorGamut: 'p3',
          colorSpace: 'display-p3',
        } as React.CSSProperties}
      />

      {/* Gesture Zones */}
      <div className="absolute inset-0 flex z-10">
        <div
          className="w-[35%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'left')}
          onDoubleClick={(e) => e.stopPropagation()} // Prevent native double click
        />
        <div
          className="w-[30%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'center')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
        <div
          className="w-[35%] h-full z-20"
          onClick={(e) => handleSmartClick(e, 'right')}
          onDoubleClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Skip Animation Overlay */}
      {skipAnimation && (
        <div
          key={skipAnimation.id}
          className={cn(
            "absolute top-0 bottom-0 flex items-center justify-center w-[40%] z-30 bg-white/10 pointer-events-none animate-in fade-in zoom-in duration-300",
            skipAnimation.side === 'left' ? "left-0 rounded-r-full" : "right-0 rounded-l-full"
          )}
          onAnimationEnd={() => setSkipAnimation(null)}
        >
          <div className="flex flex-col items-center text-white">
            {skipAnimation.side === 'left' ? (
              <>
                <ChevronsLeft className="w-12 h-12 mb-2 animate-pulse" />
                <span className="text-sm font-bold">-10 giây</span>
              </>
            ) : (
              <>
                <ChevronsRight className="w-12 h-12 mb-2 animate-pulse" />
                <span className="text-sm font-bold">+10 giây</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/80 via-black/40 to-black/80 z-20 pointer-events-none">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-white/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <p className="text-white/80 text-sm mt-4 font-medium">Đang tải video...</p>
          {retryCount > 0 && (
            <p className="text-yellow-400 text-xs mt-2">Đang thử lại ({retryCount}/{maxRetries})</p>
          )}
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/90 via-black/70 to-black/90 z-30 backdrop-blur-sm">
          <div className="text-center p-6 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-red-400 font-bold text-lg mb-2">Không thể phát video</p>
            <p className="text-white/80 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  setError(null);
                  setRetryCount(0);
                  setIsLoading(true);
                }}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
                size="sm"
              >
                Thử lại
              </Button>
              {onSwitchToEmbed && (
                <Button
                  onClick={() => onSwitchToEmbed()}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  Chế độ Dự phòng
                </Button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Dimming Overlay */}
      <div className={cn(
        "absolute inset-0 bg-black/40 z-30 transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )} />

      {/* Center Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center gap-24 z-40 transition-opacity duration-300 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); skip(-10); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-24 h-24 rounded-full pointer-events-auto"
        >
          <SkipBack className="w-12 h-12" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-32 h-32 rounded-full pointer-events-auto"
        >
          {isPlaying ? <Pause className="w-16 h-16 fill-white" /> : <Play className="w-16 h-16 fill-white ml-2" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => { e.stopPropagation(); skip(10); }}
          className="text-white hover:bg-transparent hover:text-white/80 w-24 h-24 rounded-full pointer-events-auto"
        >
          <SkipForward className="w-12 h-12" />
        </Button>
      </div>

      {/* Controls Overlay */}
      <div className={cn(
        "absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300 z-50 pointer-events-none",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        {/* Progress Bar Container */}
        <div className="px-4 pb-0 group/progress pointer-events-auto">
          {/* Hover Preview could go here */}
          <div className="relative h-1.5 w-full cursor-pointer touch-none select-none flex items-center">
            <Slider
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="z-20 py-4" // Add padding to make hit area larger
            />
            {/* Buffered Bar */}
            <div
              className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${(buffered / duration) * 100}%` }}
            />
          </div>
        </div>

        {/* Controls Bar */}
        <div className="px-4 pb-4 pt-2 flex items-center justify-between gap-4 pointer-events-auto">
          {/* Left Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <Button variant="ghost" size="icon" onClick={togglePlay} className="text-white hover:bg-white/20">
              {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
            </Button>

            <div className="flex items-center gap-1 group/volume">
              <Button variant="ghost" size="icon" onClick={toggleMute} className="text-white hover:bg-white/20 w-8 h-8">
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 ease-in-out">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
              </div>
            </div>

            <div className="text-white text-xs md:text-sm font-medium tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Settings Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                  <Settings className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 border-gray-800 text-white backdrop-blur-md w-56">
                <DropdownMenuLabel>Cài đặt</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />

                {/* Speed Submenu */}
                <DropdownMenuLabel className="text-xs text-gray-400 mt-2">Tốc độ phát</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={playbackRate.toString()} onValueChange={(v) => handlePlaybackRateChange(parseFloat(v))}>
                  <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1">Chuẩn</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2">2.0x</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                {/* Quality Submenu (if HLS) */}
                {qualities.length > 0 && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-700 my-2" />
                    <DropdownMenuLabel className="text-xs text-gray-400">Chất lượng</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={quality.toString()} onValueChange={(v) => handleQualityChange(parseInt(v))}>
                      <DropdownMenuRadioItem value="-1">Tự động</DropdownMenuRadioItem>
                      {qualities.map((q) => (
                        <DropdownMenuRadioItem key={q.level} value={q.level.toString()}>
                          {q.height}p
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

