import React, { useState, useMemo, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Logo from './components/Logo';
import { RAW_CHANNELS } from './constants';
import { ChannelResponse, SourceKey } from './types';

const App: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<SourceKey | null>(null);
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');

  // Filtrera kanaler baserat på valt nätverk
  const filteredChannels: ChannelResponse[] = useMemo(() => {
    if (!selectedSource) return [];
    return RAW_CHANNELS
      .filter(c => c.source === selectedSource)
      .map(c => ({
        channel_name: c.name,
        multicast_ip: c.ip,
        headend_id: c.head,
        stream_url_https: c.https,
        stream_url_local: c.local,
        status: 'found' as const,
        source: c.source
      }));
  }, [selectedSource]);

  const categorizedChannels = useMemo(() => {
    const groups: Record<string, ChannelResponse[]> = {};
    filteredChannels.forEach(c => {
      const head = c.headend_id.toUpperCase();
      if (!groups[head]) groups[head] = [];
      groups[head].push(c);
    });
    return groups;
  }, [filteredChannels]);

  // Startskärm: Välj nätverk
  if (!selectedSource) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-10 font-sans">
        <div className="mb-16 animate-pulse">
           <Logo light size="lg" />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-white text-2xl font-black uppercase tracking-[0.4em] mb-2">Network Selection</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Choose infrastructure to begin monitoring</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            { id: 'global', name: 'Global OTT', desc: 'Cloud Infrastructure', color: 'blue' },
            { id: 'sthlm-edge', name: 'Stockholm EDGE', desc: '172.18.56.5 Node', color: 'orange' },
            { id: 'porto-hq', name: 'Porto Maia HQ', desc: '10.20.30.253 Node', color: 'green' },
            { id: 'porto-noc', name: 'Porto Maia NOC', desc: '10.0.30.40 Node', color: 'red' }
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id as SourceKey)}
              className="group relative bg-[#171844]/60 border border-white/5 p-8 rounded-3xl hover:bg-[#171844] hover:border-blue-500/50 transition-all text-left"
            >
              <div className={`w-10 h-1 rounded-full mb-6 ${src.color === 'blue' ? 'bg-blue-500' : src.color === 'orange' ? 'bg-orange-500' : src.color === 'green' ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <h3 className="text-white text-lg font-black uppercase mb-1 tracking-tighter">{src.name}</h3>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-tight">{src.desc}</p>
              <div className="mt-8 text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                Connect Node &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const togglePin = (channel: ChannelResponse) => {
    const isPinned = pinnedChannels.find(p => p.channel_name === channel.channel_name);
    if (isPinned) {
      setPinnedChannels(prev => prev.filter(p => p.channel_name !== channel.channel_name));
    } else {
      setPinnedChannels(prev => [...prev, channel]);
    }
  };

  return (
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden border-[8px] border-[#171844]">
      
      {/* Top Bar */}
      <nav className="bg-[#171844] px-6 py-4 flex items-center justify-between shadow-xl border-b border-white/5">
        <div className="flex items-center gap-6">
           <Logo light size="sm" />
           <button 
             onClick={() => setSelectedSource(null)}
             className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-lg transition-all"
           >
             Switch Node
           </button>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            Library
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitoring' ? 'bg-green-600 text-white' : 'text-white/40 hover:text-white'}`}
          >
            Wall ({pinnedChannels.length})
          </button>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedSource.toUpperCase()}</span>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 bg-[#0F172A]">
        {activeTab === 'library' ? (
          <div className="space-y-12 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Registry explorer</h1>
              <input 
                type="text" 
                placeholder="Quick Filter..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-[#171844] border border-white/10 rounded-xl px-6 py-3 text-sm text-white focus:outline-none focus:border-blue-500 w-80"
              />
            </div>

            {Object.entries(categorizedChannels).map(([head, channels]) => {
              // Add explicit type cast to ChannelResponse[] to fix TS inference issue with Object.entries returning unknown on line 140
              const filtered = (channels as ChannelResponse[]).filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
              if (filtered.length === 0) return null;

              return (
                <div key={head} className="space-y-6">
                  <h3 className="text-xl font-black text-white/40 uppercase tracking-widest">{head} Cluster</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {filtered.map(channel => (
                      <div key={channel.channel_name} className="bg-[#171844]/40 border border-white/5 p-4 rounded-2xl hover:border-blue-500/50 transition-all flex flex-col group">
                        <div className="flex justify-between items-start mb-3">
                           <span className="text-[11px] font-black text-white uppercase tracking-tighter">{channel.channel_name}</span>
                           <button onClick={() => togglePin(channel)} className={`p-1.5 rounded ${pinnedChannels.find(p => p.channel_name === channel.channel_name) ? 'text-green-500' : 'text-white/20 hover:text-white'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                           </button>
                        </div>
                        <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} muted />
                        <div className="mt-3 text-[7px] font-mono text-slate-500 uppercase tracking-widest">{channel.multicast_ip}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full">
            {pinnedChannels.length === 0 ? (
              <div className="h-full flex items-center justify-center opacity-20"><Logo size="lg" /></div>
            ) : (
              <div className="grid gap-4 h-full content-start" style={{
                gridTemplateColumns: `repeat(${pinnedChannels.length >= 5 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
              }}>
                {pinnedChannels.map(channel => (
                  <div key={channel.channel_name} className="relative aspect-video rounded-xl overflow-hidden shadow-2xl group border border-white/10">
                    <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} autoPlay showControls />
                    <button onClick={() => togglePin(channel)} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="bg-[#171844] border-t border-white/5 px-8 py-3 flex justify-between text-[8px] font-black text-white/20 uppercase tracking-widest">
        <span>Node Mode: {selectedSource.toUpperCase()}</span>
        <span>© 2025 Nonius CDN</span>
      </footer>
    </div>
  );
};

export default App;