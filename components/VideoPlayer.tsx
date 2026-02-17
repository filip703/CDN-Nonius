
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  showControls?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  url, 
  autoPlay = true, 
  muted = true, 
  className = "",
  showControls = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [mode, setMode] = useState<'direct' | 'proxy' | 'native'>('direct');
  const [retryKey, setRetryKey] = useState(0);

  const getStreamUrl = useCallback(() => {
    if (mode === 'proxy') {
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    }
    return url;
  }, [url, mode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsReady(false);
    setError(null);
    video.muted = muted;

    let hls: Hls | null = null;
    const currentUrl = getStreamUrl();

    // Strategi 1 & 2: HLS.js (Direct eller Proxy)
    if (mode !== 'native' && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn(`Fel i ${mode}-läge:`, data.details);
          
          if (mode === 'direct') {
            setMode('native'); // Om direkt misslyckas, prova Native (din IP)
          } else if (mode === 'native') {
            setMode('proxy');  // Sista utvägen: Tunnel (Annan IP)
          } else {
            setError(`Kunde inte ansluta till CDN-noden. Status: ${data.details}`);
            hls?.destroy();
          }
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.loadSource(currentUrl);
      hls.attachMedia(video);
    } 
    // Strategi 3: Native Video (Bästa sättet att behålla din IP och undvika CORS)
    else {
      video.src = currentUrl;
      const handleLoaded = () => {
        setIsReady(true);
        if (autoPlay) video.play().catch(() => {});
      };
      const handleError = () => {
        if (mode === 'direct') setMode('proxy');
        else setError("Kanalen kunde inte spelas upp med din nuvarande IP.");
      };

      video.addEventListener('loadedmetadata', handleLoaded);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('loadedmetadata', handleLoaded);
        video.removeEventListener('error', handleError);
      };
    }

    return () => {
      if (hls) hls.destroy();
      video.src = "";
    };
  }, [getStreamUrl, autoPlay, muted, mode, retryKey]);

  return (
    <div className={`relative bg-black aspect-video rounded-xl overflow-hidden group ${className}`}>
      
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <div className="w-10 h-10 border-4 border-white/10 border-t-[#0070C0] rounded-full animate-spin mb-4"></div>
          <div className="text-center">
            <span className="block text-[10px] text-white font-black uppercase tracking-[0.3em]">Ansluter...</span>
            <span className="block text-[8px] text-[#87A238] font-bold uppercase mt-1">
              Mode: {mode === 'direct' ? 'DIN LOKALA IP' : mode === 'native' ? 'NATIVE BROWSER' : 'PROXY TUNNEL'}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-2">Stream Discovery Failed</h4>
          <p className="text-white/40 text-[9px] mb-6 uppercase">{error}</p>
          <button 
            onClick={() => { setMode('direct'); setRetryKey(k => k + 1); }}
            className="px-6 py-2 bg-[#0070C0] text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-[#1E83EC]"
          >
            Tvinga omstart (Lokal IP)
          </button>
        </div>
      )}

      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={showControls}
        style={{ display: error ? 'none' : 'block' }}
      />
      
      {isReady && (
        <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === 'proxy' ? 'bg-yellow-500' : 'bg-[#87A238]'}`}></div>
            <span className="text-[8px] text-white font-black uppercase tracking-widest">
              {mode === 'proxy' ? 'EXTERNAL PROXY IP' : 'LOCAL NETWORK IP'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
