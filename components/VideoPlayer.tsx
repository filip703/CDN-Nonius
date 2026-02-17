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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    
    // LOGIK: Ska vi använda proxyn?
    // Om det är en lokal IP (172.18...) och vi kör på localhost, kör DIREKT.
    // Annars använd proxyn.
    const isInternal = url.includes('172.18.') || url.includes('10.');
    const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const finalUrl = (isInternal && isLocalHost) 
      ? url 
      : `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    console.log(`[Player] Loading: ${finalUrl} (Mode: ${isInternal && isLocalHost ? 'Direct' : 'Proxied'})`);

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        backBufferLength: 60,
        manifestLoadingMaxRetry: 2,
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
          if (data.details === 'manifestLoadError' && !isLocalHost && isInternal) {
            setErrorMsg("Cloud Proxy cannot reach local IP. Use Global source or run locally.");
          } else {
            setErrorMsg(data.details);
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = finalUrl;
      video.addEventListener('loadedmetadata', () => {
        setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, autoPlay]);

  return (
    <div className={`relative bg-slate-950 aspect-video rounded-xl overflow-hidden group border border-white/5 ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#0070C0] rounded-full animate-spin"></div>
            <span className="text-[8px] text-white/40 uppercase font-black tracking-widest">Buffering Signal</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 p-4 text-center">
          <div className="text-red-500 font-black text-[10px] uppercase mb-1">Signal Lost</div>
          <div className="text-white/60 text-[8px] uppercase font-bold leading-tight max-w-[200px]">
            {errorMsg}
          </div>
          <div className="mt-3 px-2 py-1 bg-white/5 rounded text-[7px] text-white/30 font-mono">
            {url.split('/')[2]}
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[7px] text-white/70 uppercase font-black tracking-widest backdrop-blur-md border border-white/10">
        {channelName || 'Feed'}
      </div>
    </div>
  );
};

export default VideoPlayer;