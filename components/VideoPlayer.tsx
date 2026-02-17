
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
  const [stats, setStats] = useState({ bitrate: 0, fps: 0, buffer: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;

    const initPlayer = () => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls?.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls?.recoverMediaError();
                break;
              default:
                setError("Stream error: Fatal");
                hls?.destroy();
                break;
            }
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // För Safari och iOS som har inbyggt HLS-stöd
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          if (autoPlay) video.play().catch(e => console.log("Autoplay blocked", e));
        });
      } else {
        setError("HLS not supported in this browser");
      }
    };

    initPlayer();

    // Simulerad telemetri för NOC-känsla
    const interval = setInterval(() => {
      setStats({
        bitrate: Math.floor(3200 + Math.random() * 1800),
        fps: Math.random() > 0.05 ? 50 : 49,
        buffer: Number((Math.random() * 8 + 2).toFixed(1))
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      if (hls) hls.destroy();
    };
  }, [url, autoPlay]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden group rounded-sm border border-white/5 ${className}`}>
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 text-center">
          <svg className="w-8 h-8 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">{error}</span>
          <span className="text-[8px] text-white/40 mt-1 break-all">{url}</span>
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
      
      {/* Telemetry HUD */}
      {!error && (
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/80 backdrop-blur-md px-2 py-1.5 rounded border border-white/10 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[7px] font-black text-white uppercase tracking-tighter">NODE-PROBE: {channelName || 'LIVE'}</span>
            </div>
            <div className="flex gap-3">
              <div className="flex flex-col">
                <span className="text-[5px] text-white/30 uppercase">Rate</span>
                <span className="text-[8px] font-mono text-[#87A238] font-bold">{(stats.bitrate/1000).toFixed(1)} Mbps</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[5px] text-white/30 uppercase">Health</span>
                <span className="text-[8px] font-mono text-white font-bold">{stats.buffer}s</span>
              </div>
            </div>
          </div>
          <div className="bg-[#0070C0] px-1.5 py-0.5 rounded text-[7px] font-black text-white uppercase shadow-lg">1080p60</div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
