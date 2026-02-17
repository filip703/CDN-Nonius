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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    let hls: Hls | null = null;
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        // Vi håller det enkelt för att undvika problem med headers
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
  }, [url]);

  return (
    <div className={`relative bg-black aspect-video rounded-xl overflow-hidden ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full object-contain" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/40 p-4 text-center">
          <span className="text-white text-[10px] font-black uppercase tracking-widest">Signal Chain Error</span>
          <span className="text-white/40 text-[8px] mt-1">Node could not be reached via Proxy</span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-[9px] text-white/70 uppercase font-black tracking-tighter">
        {channelName || 'Stream Feed'}
      </div>
    </div>
  );
};

export default VideoPlayer;