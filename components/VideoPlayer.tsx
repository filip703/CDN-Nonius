
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
  showControls = true,
  channelName
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [stats, setStats] = useState({ bitrate: 0, fps: 0, buffer: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Simulate telemetry
    const interval = setInterval(() => {
      setStats({
        bitrate: Math.floor(4500 + Math.random() * 1200),
        fps: Math.random() > 0.1 ? 50 : 48,
        buffer: Number((Math.random() * 10 + 2).toFixed(1))
      });
    }, 2000);

    let hls: Hls | null = null;
    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsReady(true);
        if (autoPlay) video.play().catch(() => {});
      });
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      setIsReady(true);
    }

    return () => {
      clearInterval(interval);
      if (hls) hls.destroy();
    };
  }, [url]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden group border border-white/5 ${className}`}>
      <video ref={videoRef} className="w-full h-full object-cover" muted={muted} playsInline controls={showControls} />
      
      {/* Telemetry Overlay */}
      <div className="absolute top-2 left-2 right-2 flex justify-between items-start pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/60 backdrop-blur-md p-2 rounded border border-white/10 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-[8px] font-bold text-white uppercase tracking-tighter">Live Feed: {channelName}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-1">
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase">Bitrate</span>
              <span className="text-[8px] font-mono text-[#87A238] font-bold">{stats.bitrate} kbps</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase">FPS</span>
              <span className="text-[8px] font-mono text-white font-bold">{stats.fps}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[6px] text-white/40 uppercase">Buffer</span>
              <span className="text-[8px] font-mono text-white font-bold">{stats.buffer}s</span>
            </div>
          </div>
        </div>
        <div className="bg-[#87A238] px-1.5 py-0.5 rounded text-[7px] font-black text-white uppercase">1080p HEVC</div>
      </div>
    </div>
  );
};

export default VideoPlayer;
