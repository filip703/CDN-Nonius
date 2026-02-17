
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

// AllOrigins är stabilare för att bypassa CORS-blockeringar
const PROXY_URL = "https://api.allorigins.win/raw?url=";

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  autoPlay = true, 
  muted = true, 
  className = "",
  showControls = false,
  channelName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState<'loading' | 'playing' | 'error' | 'proxy'>('loading');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;

    const initPlayer = (targetUrl: string, useProxy: boolean = false) => {
      if (hls) hls.destroy();
      
      const finalUrl = useProxy ? `${PROXY_URL}${encodeURIComponent(targetUrl)}` : targetUrl;

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          // Aggressiva inställningar för att ignorera CORS-fel på manifest-nivå
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.loadSource(finalUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            if (data.details === 'manifestLoadError' && !useProxy) {
              console.log("CORS block detekterad. Byter till Proxy-tunnel...");
              setStatus('proxy');
              initPlayer(url, true);
            } else {
              console.error("HLS Fatal Error:", data);
              setStatus('error');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari/iOS native fallback
        video.src = finalUrl;
        video.addEventListener('loadedmetadata', () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });
      }
    };

    // Försök direkt först
    initPlayer(url);

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, autoPlay]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden rounded-lg group ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-cover" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      
      {/* Status Overlays */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
             <span className="text-[8px] font-black text-white uppercase tracking-widest">Ingesting Feed...</span>
          </div>
        </div>
      )}

      {status === 'proxy' && (
        <div className="absolute top-2 right-2 bg-orange-500/80 px-2 py-0.5 rounded text-[7px] font-black text-white uppercase tracking-widest z-10 animate-pulse">
          CORS Tunnel Active
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-md text-center p-4">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="text-[10px] font-black text-white uppercase mb-1">Signal Loss</div>
          <div className="text-[8px] text-white/50 break-all max-w-full font-mono">{url}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[8px] font-bold text-white uppercase transition-all"
          >
            Re-sync Node
          </button>
        </div>
      )}

      <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none transition-opacity duration-300 group-hover:opacity-100 opacity-60">
        <div className={`w-2 h-2 rounded-full ${status === 'playing' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
        <span className="text-[9px] font-black text-white uppercase tracking-tighter drop-shadow-md">
          {channelName || 'Live'}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
