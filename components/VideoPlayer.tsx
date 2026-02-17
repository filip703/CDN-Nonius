
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps {
  url: string;
  autoPlay?: boolean;
  muted?: boolean;
  className?: string;
  showControls?: boolean;
}

/**
 * VideoPlayer optimerad för direkt anslutning (användarens egen IP).
 * Denna version är "IP-säker" och använder inga proxies.
 */
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
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsReady(false);
    setError(null);
    video.muted = muted;

    let hls: Hls | null = null;

    // Strategi 1: Försök med Native HLS (fungerar som adressfältet i Safari/iOS/Android)
    // Detta är det säkraste sättet att behålla användarens IP och kringgå vissa CORS-spärrar.
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsReady(true);
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setError("Native playback misslyckades. Kontrollera nätverksbehörighet.");
      });
    } 
    // Strategi 2: HLS.js (För Chrome/Edge/Firefox på desktop)
    else if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        // Vi stänger av credentials för att undvika komplexa CORS-preflights om de inte behövs
        xhrSetup: (xhr) => {
          xhr.withCredentials = false;
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          setError(`CDN-fel: ${data.details}. Verifiera att din IP (${window.location.hostname}) är vitlistad.`);
          hls?.destroy();
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
        if (autoPlay) video.play().catch(() => {});
      });

      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      setError("Din webbläsare stöder inte HLS-streaming.");
    }

    return () => {
      if (hls) hls.destroy();
      video.src = "";
    };
  }, [url, autoPlay, muted, retryKey]);

  return (
    <div className={`relative bg-black aspect-video rounded-xl overflow-hidden group ${className}`}>
      
      {!isReady && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <div className="w-8 h-8 border-2 border-white/5 border-t-[#0070C0] rounded-full animate-spin mb-3"></div>
          <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.2em]">Initialiserar Direktström</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 p-6 text-center border border-red-500/20">
          <div className="text-red-500/50 mb-4">
            <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h4 className="text-white text-[10px] font-bold uppercase tracking-widest mb-2">CDN Connection Error</h4>
          <p className="text-white/40 text-[9px] mb-6 max-w-[200px] mx-auto leading-relaxed">{error}</p>
          <button 
            onClick={() => setRetryKey(k => k + 1)}
            className="px-6 py-2 bg-white/5 text-white text-[9px] font-bold rounded border border-white/10 uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Retry Connection
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
        <div className="absolute top-4 left-4 pointer-events-none z-10">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#87A238] animate-pulse"></div>
            <span className="text-[7px] text-white/80 font-black uppercase tracking-widest">
              Live Direct Path
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
