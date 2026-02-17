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
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [useProxy, setUseProxy] = useState<boolean>(!url.startsWith('https://'));

  const initPlayer = () => {
    const video = videoRef.current;
    if (!video || !url) return;

    setStatus('loading');
    setErrorMsg('');

    // Bestäm slutgiltig URL
    // Om URL:en är HTTPS (public) -> Kör direkt
    // Om URL:en är HTTP -> Kör via Proxy (annars blockerar webbläsaren pga Mixed Content)
    const finalUrl = useProxy 
      ? `/api/hls-proxy?url=${encodeURIComponent(url)}` 
      : url;

    console.log(`[VideoPlayer] Initializing ${channelName}:`, { original: url, target: finalUrl, proxyActive: useProxy });

    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        manifestLoadingTimeOut: 15000,
        fragLoadingTimeOut: 20000,
        manifestLoadingMaxRetry: 3,
        levelLoadingMaxRetry: 3,
      });

      hls.loadSource(finalUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Fatal Error:", data);
          setStatus('error');
          setErrorMsg(`${data.details} (Try bypassing proxy?)`);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // För Safari
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });
      video.addEventListener('error', () => {
        setStatus('error');
        setErrorMsg("Native Playback Error");
      });
    }

    return hls;
  };

  useEffect(() => {
    const hls = initPlayer();
    return () => {
      if (hls) hls.destroy();
    };
  }, [url, useProxy]);

  return (
    <div className={`relative bg-black aspect-video rounded-xl overflow-hidden group border border-white/5 ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain" 
        muted={muted} 
        playsInline 
        controls={showControls || status === 'playing'}
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-[#0070C0]/20 border-t-[#0070C0] rounded-full animate-spin"></div>
            <span className="text-[9px] text-white/60 uppercase font-black tracking-[0.2em]">Acquiring {useProxy ? 'Proxy' : 'Direct'} Feed</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 p-6 text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
             <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
             </svg>
          </div>
          <div className="text-white font-black text-xs uppercase tracking-widest mb-2">Signal Connection Failure</div>
          <div className="text-red-300/60 text-[9px] uppercase font-bold mb-6 max-w-[250px] leading-relaxed">
            {errorMsg}
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={() => setUseProxy(!useProxy)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all"
             >
                {useProxy ? 'Bypass Proxy' : 'Enable Proxy'}
             </button>
             <button 
                onClick={() => { setStatus('loading'); initPlayer(); }}
                className="px-4 py-2 bg-[#0070C0] hover:bg-[#0070C0]/80 rounded-lg text-[9px] font-black text-white uppercase tracking-widest transition-all"
             >
                Retry
             </button>
          </div>
        </div>
      )}

      <div className="absolute top-3 left-3 flex gap-2">
         <div className="px-2 py-1 bg-black/60 rounded text-[8px] text-white font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
           {channelName || 'Feed'}
         </div>
         {status === 'playing' && (
           <div className="px-2 py-1 bg-[#87A238] rounded text-[8px] text-white font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
             Live
           </div>
         )}
      </div>
    </div>
  );
};

export default VideoPlayer;