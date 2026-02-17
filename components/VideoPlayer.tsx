
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
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;

    // Production-grade HLS Proxying: Ensure the URL is passed correctly
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    const initPlayer = () => {
      if (hls) hls.destroy();

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          // Robust retry logic for production streams
          manifestLoadingRetryDelay: 1000,
          manifestLoadingMaxRetry: 10,
          levelLoadingRetryDelay: 1000,
          levelLoadingMaxRetry: 10,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetry: 10,
          // Support for proxied Range requests
          xhrSetup: (xhr, url) => {
            xhr.withCredentials = false;
          }
        });

        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('playing');
          if (autoPlay) {
            video.play().catch(e => console.warn("Autoplay blocked:", e));
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error(`[HLS.js] Fatal Error: ${data.details}`, data);
            setErrorMessage(data.details);
            
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error encountered, attempting to recover...");
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error encountered, attempting to recover...");
                hls?.recoverMediaError();
                break;
              default:
                setStatus('error');
                hls?.destroy();
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native support (Safari/iOS)
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });
        video.addEventListener('error', () => {
          setStatus('error');
          setErrorMessage('Native Player Error');
        });
      } else {
        setStatus('error');
        setErrorMessage('HLS Not Supported');
      }
    };

    initPlayer();

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
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
             <div className="w-8 h-8 border-2 border-[#0070C0] border-t-transparent rounded-full animate-spin mb-3"></div>
             <span className="text-[8px] font-black text-white/60 uppercase tracking-[0.3em]">Negotiating Node...</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 text-center p-6 z-20">
          <svg className="w-8 h-8 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="text-red-500 text-[10px] font-black uppercase mb-1 tracking-widest">Upstream Isolation Fault</div>
          <div className="text-[7px] text-white/30 truncate w-full font-mono mb-4">{errorMessage}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all"
          >
            Re-provision Connection
          </button>
        </div>
      )}

      {/* Info HUD */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-40 pointer-events-none group-hover:opacity-100 transition-opacity duration-500">
        <div className={`w-2 h-2 rounded-full ${status === 'playing' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
        <span className="text-[9px] font-black text-white uppercase tracking-tighter drop-shadow-md">
          {channelName || 'Stream'} • {status === 'playing' ? 'Secure Proxy' : 'Connecting'}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
