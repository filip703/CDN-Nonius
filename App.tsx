import React, { useState, useMemo } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Logo from './components/Logo';
import { RAW_CHANNELS } from './constants';
import { ChannelResponse, SourceKey } from './types';

const App: React.FC = () => {
  const [selectedSource, setSelectedSource] = useState<SourceKey | null>(null);
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');
  const [activePreview, setActivePreview] = useState<string | null>(null);

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

  if (!selectedSource) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-10 font-sans">
        <div className="mb-12">
           <Logo light size="lg" />
        </div>
        <div className="text-center mb-10">
           <h2 className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">Select Operations Node</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            { id: 'global', name: 'Global OTT', desc: 'Public Cloud Safe', color: 'blue' },
            { id: 'sthlm-edge', name: 'Stockholm EDGE', desc: 'Internal 172.18.56.5', color: 'orange' },
            { id: 'porto-hq', name: 'Porto Maia HQ', desc: 'Internal 10.20.30.253', color: 'green' },
            { id: 'porto-noc', name: 'Porto Maia NOC', desc: 'Internal 10.0.30.40', color: 'red' }
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id as SourceKey)}
              className="bg-[#171844]/40 border border-white/5 p-8 rounded-3xl hover:bg-[#171844] hover:border-[#0070C0]/50 transition-all text-left group relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${src.color === 'blue' ? 'bg-[#0070C0]' : src.color === 'orange' ? 'bg-orange-500' : src.color === 'green' ? 'bg-[#87A238]' : 'bg-red-500'}`}></div>
              <h3 className="text-white text-lg font-black uppercase mb-1">{src.name}</h3>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-tight">{src.desc}</p>
            </button>
          ))}
        </div>
        <div className="mt-12 text-[10px] text-white/20 font-black uppercase tracking-widest">
           System Status: Ready • Version 4.0.2
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
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden">
      <nav className="bg-[#171844] px-6 py-3 flex items-center justify-between shadow-2xl z-50">
        <div className="flex items-center gap-6">
           <Logo light size="sm" />
           <div className="h-4 w-px bg-white/10"></div>
           <button onClick={() => setSelectedSource(null)} className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded transition-all">Change Node</button>
        </div>
        
        <div className="flex bg-black/20 p-1 rounded-xl border border-white/5">
          <button onClick={() => setActiveTab('library')} className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-[#0070C0] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Library</button>
          <button onClick={() => setActiveTab('monitoring')} className={`px-6 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Wall ({pinnedChannels.length})</button>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">Active Cluster</span>
              <span className="text-[10px] font-black text-white uppercase tracking-tight">{selectedSource.toUpperCase()}</span>
           </div>
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-8 bg-[#0F172A] relative">
        <div className="max-w-[1600px] mx-auto">
          {activeTab === 'library' ? (
            <div className="space-y-10">
              <div className="flex justify-between items-center bg-[#171844]/30 p-6 rounded-3xl border border-white/5">
                <div>
                  <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Channel Registry</h1>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Found {filteredChannels.length} endpoints on node</p>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search signal name..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    className="bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-xs text-white focus:outline-none focus:border-[#0070C0] w-72 transition-all placeholder:text-white/10 uppercase font-bold" 
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
                </div>
              </div>

              {Object.entries(categorizedChannels).map(([head, channels]) => {
                const filtered = (channels as ChannelResponse[]).filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <div key={head} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <h3 className="text-xs font-black text-white/20 uppercase tracking-[0.4em]">{head}</h3>
                      <div className="h-px flex-1 bg-white/5"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                      {filtered.map(channel => (
                        <div key={channel.channel_name} className="bg-[#171844]/20 border border-white/5 p-3 rounded-2xl hover:bg-[#171844]/40 hover:border-white/10 transition-all flex flex-col group">
                          <div className="flex justify-between items-start mb-2">
                             <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight truncate">{channel.channel_name}</span>
                                <span className="text-[7px] font-mono text-slate-500 uppercase">{channel.multicast_ip}</span>
                             </div>
                             <button onClick={() => togglePin(channel)} className={`p-1.5 rounded-lg transition-all ${pinnedChannels.find(p => p.channel_name === channel.channel_name) ? 'bg-[#87A238] text-white shadow-lg shadow-green-900/20' : 'bg-white/5 text-white/20 hover:text-white'}`}>
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                             </button>
                          </div>
                          
                          <div className="relative aspect-video bg-black/40 rounded-xl overflow-hidden mb-2 group-hover:shadow-2xl transition-all border border-white/5">
                             {activePreview === channel.channel_name ? (
                               <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} muted />
                             ) : (
                               <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer" onClick={() => setActivePreview(channel.channel_name)}>
                                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center group-hover:bg-[#0070C0] group-hover:scale-110 transition-all duration-300">
                                     <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                  </div>
                               </div>
                             )}
                          </div>

                          <button 
                            onClick={() => setActivePreview(activePreview === channel.channel_name ? null : channel.channel_name)}
                            className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-all"
                          >
                            {activePreview === channel.channel_name ? 'Terminate' : 'Preview'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-6 h-full content-start" style={{
              gridTemplateColumns: `repeat(${pinnedChannels.length >= 6 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
            }}>
              {pinnedChannels.map(channel => (
                <div key={channel.channel_name} className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group border border-white/5 bg-black">
                  <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} autoPlay showControls />
                  <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-xl border border-white/10">
                        <span className="text-[10px] font-black text-white uppercase">{channel.channel_name}</span>
                     </div>
                  </div>
                  <button onClick={() => togglePin(channel)} className="absolute top-4 right-4 p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-xl backdrop-blur-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
              {pinnedChannels.length === 0 && (
                <div className="col-span-full h-96 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
                   <span className="text-white/20 text-xs font-black uppercase tracking-[0.4em]">Monitoring Wall Empty</span>
                   <button onClick={() => setActiveTab('library')} className="mt-4 text-[#0070C0] text-[10px] font-black uppercase underline decoration-2 underline-offset-4">Browse Library</button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-[#171844] border-t border-white/5 px-8 py-2 flex justify-between items-center text-[7px] font-black text-white/20 uppercase tracking-[0.5em]">
        <div className="flex gap-6">
           <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-green-500"></div>
              <span>Tunnel: {window.location.hostname === 'localhost' ? 'Hybrid-Local' : 'Cloud-Edge'}</span>
           </div>
           <span>Encoding: H.264 / AAC</span>
        </div>
        <span>© 2025 Nonius Operations Control</span>
      </footer>
    </div>
  );
};

export default App;