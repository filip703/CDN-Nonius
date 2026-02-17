
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
    // Enkel proxy-URL
    const proxiedUrl = `/api/hls-proxy?url=${encodeURIComponent(url)}`;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        // Vi kör standardinställningar för maximal kompatibilitet
      });

      hls.loadSource(proxiedUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setStatus('playing');
        if (autoPlay) video.play().catch(() => {});
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS Fatal:", data);
          setStatus('error');
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // För Safari
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
    <div className={`relative bg-black aspect-video rounded-lg overflow-hidden ${className}`}>
      <video 
        ref={videoRef} 
        className="w-full h-full" 
        muted={muted} 
        playsInline 
        controls={showControls}
      />
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 text-white text-[10px] font-bold uppercase">
          Signal Lost
        </div>
      )}
      <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[8px] text-white/50 uppercase font-bold tracking-widest">
        {channelName || 'Feed'}
      </div>
    </div>
  );
};

export default VideoPlayer;
