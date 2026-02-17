
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  showControls?: boolean;
  channelName?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  autoPlay = true, 
  muted = true, 
  className = "",
  showControls = false,
  channelName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    const initPlayer = () => {
      if (hls) hls.destroy();

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          // Mycket viktigt: Förhindra att Hls.js försöker vara smart med cookies/credentials 
          // som kan trigga CORS på ett sätt proxyn inte gillar.
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
          manifestLoadingMaxRetry: 5,
          levelLoadingMaxRetry: 5,
        });

        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("HLS Fatal Error through Proxy:", data.details);
            if (retryCount < 3) {
              setRetryCount(prev => prev + 1);
              hls?.startLoad();
            } else {
              setStatus('error');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native fallback (Safari)
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });
      }
    };

    initPlayer();

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, autoPlay, retryCount]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden rounded-lg group ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 backdrop-blur-md">
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
             <div className="text-[8px] font-black text-white uppercase tracking-[0.4em] animate-pulse">Deep Tunneling Protocol...</div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 p-4 text-center">
          <div className="text-red-500 text-[10px] font-black uppercase mb-2">CORS Override Failure</div>
          <button 
            onClick={() => setRetryCount(0)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-[8px] font-black uppercase text-white"
          >
            Force Re-Link
          </button>
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'playing' ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="text-[8px] font-black text-white uppercase tracking-widest">{channelName || 'LIVE'}</span>
      </div>
    </div>
  );
};

export default VideoPlayer;
