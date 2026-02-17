
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

const CORS_PROXY = 'https://corsproxy.io/?';

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
  const [attemptProxy, setAttemptProxy] = useState(false);
  const [isMixedContent, setIsMixedContent] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Detect Mixed Content: Attempting to load HTTP on HTTPS site
    const currentProtocol = window.location.protocol;
    if (currentProtocol === 'https:' && url.startsWith('http://')) {
      setIsMixedContent(true);
      // Browser usually blocks this before HLS.js even starts
    }

    let hls: Hls | null = null;
    setError(null);

    const startPlayer = (targetUrl: string) => {
      if (hls) hls.destroy();

      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          manifestLoadingRetryDelay: 1000,
          manifestLoadingMaxRetry: 3,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });

        hls.loadSource(targetUrl);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (autoPlay) video.play().catch(() => {});
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.warn(`HLS Fatal: ${data.details}. URL: ${targetUrl}`);
            
            // If it's a network/CORS error and we haven't tried the proxy yet
            if (data.details === 'manifestLoadError' && !attemptProxy) {
              console.log("CORS/Network error detected. Initiating proxy tunnel...");
              setAttemptProxy(true);
            } else {
              setError(`Signal Error: ${data.details}`);
              hls?.destroy();
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = targetUrl;
      } else {
        setError("Incompatible Browser Engine");
      }
    };

    // Determine if we should use the proxy immediately for known problematic origins
    const shouldProxy = attemptProxy || (url.includes('se-ott.nonius.tv') && !url.includes('corsproxy.io'));
    const finalUrl = shouldProxy ? `${CORS_PROXY}${encodeURIComponent(url)}` : url;

    startPlayer(finalUrl);

    return () => {
      if (hls) hls.destroy();
    };
  }, [url, autoPlay, attemptProxy]);

  return (
    <div className={`relative bg-black aspect-video overflow-hidden group rounded-lg border border-white/5 shadow-2xl ${className}`}>
      {/* Mixed Content Warning */}
      {isMixedContent && (
        <div className="absolute inset-0 z-40 bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center border-2 border-orange-500/20 m-2 rounded-xl">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mb-4">
             <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <h4 className="text-[11px] font-black text-white uppercase tracking-[0.3em] mb-2">Mixed Content Blocked</h4>
          <p className="text-[9px] text-white/50 max-w-[280px] leading-relaxed mb-6 uppercase tracking-wider">
            Modern browsers block <span className="text-orange-500">HTTP</span> streams on <span className="text-blue-400">HTTPS</span> sites. 
            <br/><br/>
            To monitor internal nodes: <br/> 
            <span className="text-white font-black underline">Site Settings > Insecure Content > ALLOW</span>
          </p>
          <div className="text-[8px] font-mono text-white/20 bg-black/40 px-3 py-1.5 rounded border border-white/5 truncate w-full">
            {url}
          </div>
        </div>
      )}

      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 text-center p-6 backdrop-blur-sm">
          <div className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Signal Ingest Failure</div>
          <div className="text-[8px] font-mono text-white/30 truncate w-full max-w-[240px] mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-white transition-all"
          >
            Retry Sync
          </button>
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
      
      {/* HUD Info */}
      {!error && !isMixedContent && (
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20">
           <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
              <div className="text-[9px] font-black text-white uppercase tracking-tight">{channelName || 'LIVE'}</div>
              <div className="text-[7px] font-mono text-white/40 uppercase tracking-widest">
                {attemptProxy || url.includes('corsproxy') ? 'CORS TUNNEL ACTIVE' : 'DIRECT LINK'}
              </div>
           </div>
           <div className="bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded text-[7px] text-green-500 font-black uppercase tracking-widest">
             Signal 100%
           </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
