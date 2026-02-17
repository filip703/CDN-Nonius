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
  const [errorMessage, setErrorMessage] = useState('');
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    // Ensure URL is encoded for the proxy
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingRetryDelay: 1000,
          manifestLoadingMaxRetry: 10,
          levelLoadingRetryDelay: 1000,
          levelLoadingMaxRetry: 10,
          fragLoadingRetryDelay: 1000,
          fragLoadingMaxRetry: 10,
          // We don't want to send credentials (cookies) to the proxy unless explicitly needed
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });

        hls.loadSource(proxiedUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setStatus('playing');
          if (autoPlay) {
            video.play().catch(e => {
              console.warn("Playback prevented (likely autoplay policy):", e);
            });
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error(`HLS Fatal Error (${data.type}):`, data.details, data);
            
            const msg = `${data.type} - ${data.details}`;
            setErrorMessage(msg);
            
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              console.log("Fatal network error, attempting automated recovery...");
              hls?.startLoad();
              
              // Increment manual retry counter if automated one fails multiple times
              if (data.details === 'manifestLoadError' || data.details === 'levelLoadError') {
                 if (retryAttempt < 5) {
                   setTimeout(() => {
                     setRetryAttempt(prev => prev + 1);
                   }, 2000);
                 } else {
                   setStatus('error');
                 }
              }
            } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              console.log("Fatal media error, attempting recovery...");
              hls?.recoverMediaError();
            } else {
              setStatus('error');
              hls?.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari/iOS)
        video.src = proxiedUrl;
        video.addEventListener('loadedmetadata', () => {
          setStatus('playing');
          if (autoPlay) video.play().catch(() => {});
        });
        video.addEventListener('error', () => {
          setStatus('error');
          setErrorMessage('Native Player Error: The stream could not be loaded.');
        });
      } else {
        setStatus('error');
        setErrorMessage('HLS Support Missing: Browser incompatible.');
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [url, autoPlay, retryAttempt]);

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
        <div className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/90 backdrop-blur-sm z-10">
          <div className="flex flex-col items-center">
             <div className="w-10 h-10 border-2 border-[#0070C0] border-t-transparent rounded-full animate-spin mb-4"></div>
             <div className="text-[9px] font-black text-white/70 uppercase tracking-[0.4em] animate-pulse">
               {retryAttempt > 0 ? `RETRYING TUNNEL (${retryAttempt}/5)...` : 'OPENING PROXY TUNNEL...'}
             </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/95 p-6 text-center z-20">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-red-500 text-[11px] font-black uppercase mb-1 tracking-widest">Tunnel Negotiation Fault</div>
          <div className="text-[8px] text-white/40 truncate w-full font-mono mb-4 px-4">{errorMessage || 'Stream Load Failure'}</div>
          <div className="flex gap-2">
            <button 
              onClick={() => { setStatus('loading'); setRetryAttempt(0); }}
              className="px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-5 py-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
            >
              Hard Refresh
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 flex items-center gap-2.5 opacity-40 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className={`w-2 h-2 rounded-full ${status === 'playing' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></div>
        <span className="text-[9px] font-black text-white uppercase tracking-tighter drop-shadow-lg">
          {channelName || 'NODE FEED'} • {status === 'playing' ? 'STREAMING VIA PROXY' : 'NEGOTIATING'}
        </span>
      </div>
    </div>
  );
};

export default VideoPlayer;
