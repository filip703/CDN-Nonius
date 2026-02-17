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
  const [errorDetail, setErrorDetail] = useState<string>('');

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        manifestLoadingTimeOut: 10000,
        fragLoadingTimeOut: 10000,
      });

      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Fatal Error:", data);
          setStatus('error');
          setErrorDetail(data.details);
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
             setErrorDetail("Network Connection Blocked (Node Offline or Private IP)");
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = proxiedUrl;
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
    <div className={`relative bg-black aspect-video rounded-xl overflow-hidden shadow-2xl ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
             <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Handshaking Proxy...</span>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 p-6 text-center">
          <svg className="w-10 h-10 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="text-white text-xs font-black uppercase tracking-widest mb-1">Signal Chain Broken</span>
          <span className="text-red-300 text-[9px] uppercase font-bold opacity-70 leading-tight">
            {errorDetail || "Access Denied by Host"}
          </span>
          <div className="mt-4 px-3 py-1 bg-white/5 rounded text-[8px] text-white/30 font-mono">
            {url.includes('172.18') ? 'LOCAL NODE: REQUIRES VPN/INTRANET' : 'GATEWAY ERROR: 502'}
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[8px] text-white/70 uppercase font-black tracking-tighter backdrop-blur-md border border-white/10">
        {channelName || 'Stream Feed'}
      </div>
    </div>
  );
};

export default VideoPlayer;