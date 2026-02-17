
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
  const [error, setError] = useState<string | null>(null);
  const [isMixedContent, setIsMixedContent] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Check for mixed content (loading http on https site)
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      setIsMixedContent(true);
    }

    let hls: Hls | null = null;
    setError(null);

    const startPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error("HLS Fatal Error:", data);
            setError(`Signal Error: ${data.details}`);
            hls?.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else {
        setError("Incompatible Browser");
      }
    };

    startPlayer();

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, autoPlay]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden group rounded-lg border border-white/5 ${className}`}>
      {isMixedContent && !error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 text-center p-6">
          <svg className="w-10 h-10 text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="text-[11px] font-black text-white uppercase tracking-widest mb-2">Mixed Content Blocked</div>
          <p className="text-[9px] text-white/60 mb-4 leading-relaxed max-w-[200px]">
            Browser blocks HTTP streams on HTTPS sites. <br/>
            <span className="text-yellow-500">Enable "Insecure Content" in browser settings</span> or use local host.
          </p>
          <div className="text-[8px] font-mono text-white/30 truncate w-full px-4">{url}</div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-center p-4">
          <div className="text-red-500 text-[10px] font-black uppercase mb-1">Signal Lost</div>
          <div className="text-[8px] text-white/30 truncate w-full">{error}</div>
        </div>
      ) : (
        <video 
          ref={videoRef} 
          className="w-full h-full object-cover" 
          muted={muted} 
          playsInline 
          controls={showControls}
        />
      )}
      
      {!error && !isMixedContent && (
        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[7px] font-black text-white/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
          {channelName || 'Live Feed'}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
