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
        <div className="mb-16">
           <Logo light size="lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            { id: 'global', name: 'Global OTT', desc: 'Secure Proxy Tunnel', color: 'blue' },
            { id: 'sthlm-edge', name: 'Stockholm EDGE', desc: 'Internal 172.18.56.5', color: 'orange' },
            { id: 'porto-hq', name: 'Porto Maia HQ', desc: 'Internal 10.20.30.253', color: 'green' },
            { id: 'porto-noc', name: 'Porto Maia NOC', desc: 'Internal 10.0.30.40', color: 'red' }
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id as SourceKey)}
              className="bg-[#171844]/60 border border-white/5 p-8 rounded-3xl hover:bg-[#171844] hover:border-[#0070C0]/50 transition-all text-left group"
            >
              <div className={`w-8 h-1 rounded-full mb-6 ${src.color === 'blue' ? 'bg-[#0070C0]' : src.color === 'orange' ? 'bg-orange-500' : src.color === 'green' ? 'bg-[#87A238]' : 'bg-red-500'}`}></div>
              <h3 className="text-white text-lg font-black uppercase mb-1">{src.name}</h3>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest leading-tight">{src.desc}</p>
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
      <nav className="bg-[#171844] px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-6">
           <Logo light size="sm" />
           <button onClick={() => setSelectedSource(null)} className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">Switch Node</button>
        </div>
        <div className="flex bg-black/40 p-1 rounded-xl">
          <button onClick={() => setActiveTab('library')} className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-[#0070C0] text-white' : 'text-white/40 hover:text-white'}`}>Library</button>
          <button onClick={() => setActiveTab('monitoring')} className={`px-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white' : 'text-white/40 hover:text-white'}`}>Wall ({pinnedChannels.length})</button>
        </div>
        <div className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
          {selectedSource.toUpperCase()} <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto p-10 bg-[#0F172A]">
        {selectedSource !== 'global' && (
          <div className="max-w-[1600px] mx-auto mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
                <h4 className="text-white text-xs font-black uppercase tracking-widest">Internal Node Selected</h4>
                <p className="text-slate-400 text-[10px] uppercase font-bold">Channels on this node are served via internal IP addresses. You must be on the local network or VPN for the proxy to reach them.</p>
             </div>
          </div>
        )}

        {activeTab === 'library' ? (
          <div className="space-y-12 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-end border-b border-white/5 pb-8">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Registry explorer</h1>
              <input type="text" placeholder="Quick Filter..." value={query} onChange={(e) => setQuery(e.target.value)} className="bg-[#171844] border border-white/10 rounded-xl px-6 py-3 text-sm text-white focus:outline-none focus:border-[#0070C0] w-80" />
            </div>

            {Object.entries(categorizedChannels).map(([head, channels]) => {
              const filtered = (channels as ChannelResponse[]).filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
              if (filtered.length === 0) return null;

              return (
                <div key={head} className="space-y-6">
                  <h3 className="text-xl font-black text-white/40 uppercase tracking-widest">{head} Cluster</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filtered.map(channel => (
                      <div key={channel.channel_name} className="bg-[#171844]/40 border border-white/5 p-4 rounded-2xl hover:border-[#0070C0]/50 transition-all flex flex-col group">
                        <div className="flex justify-between items-start mb-3">
                           <div className="flex flex-col">
                              <span className="text-[11px] font-black text-white uppercase tracking-tighter">{channel.channel_name}</span>
                              <span className="text-[7px] font-mono text-slate-500 uppercase">{channel.multicast_ip}</span>
                           </div>
                           <button onClick={() => togglePin(channel)} className={`p-1.5 rounded-lg transition-all ${pinnedChannels.find(p => p.channel_name === channel.channel_name) ? 'bg-[#87A238] text-white' : 'bg-white/5 text-white/20 hover:text-white'}`}>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                           </button>
                        </div>
                        
                        <div className="relative aspect-video bg-black/60 rounded-xl overflow-hidden mb-3 group-hover:shadow-2xl transition-all border border-white/5">
                           {activePreview === channel.channel_name ? (
                             <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} muted />
                           ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer" onClick={() => setActivePreview(channel.channel_name)}>
                                <div className="w-10 h-10 bg-[#0070C0]/20 rounded-full flex items-center justify-center group-hover:bg-[#0070C0] transition-all">
                                   <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-3 group-hover:text-white transition-all">Click to Preview</span>
                                {channel.stream_url_https.includes('172.18') && (
                                   <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-orange-500/20 text-orange-500 text-[6px] font-black rounded uppercase">Internal</span>
                                )}
                             </div>
                           )}
                        </div>

                        <button 
                          onClick={() => setActivePreview(activePreview === channel.channel_name ? null : channel.channel_name)}
                          className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                        >
                          {activePreview === channel.channel_name ? 'Close Feed' : 'Launch Preview'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 h-full content-start" style={{
            gridTemplateColumns: `repeat(${pinnedChannels.length >= 5 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
          }}>
            {pinnedChannels.map(channel => (
              <div key={channel.channel_name} className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl group border border-white/10">
                <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} autoPlay showControls />
                <button onClick={() => togglePin(channel)} className="absolute top-4 right-4 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-xl">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#171844] border-t border-white/5 px-8 py-3 flex justify-between text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
        <div className="flex gap-4">
           <span>Proxy Protocol: Edge-V2</span>
           <span className={selectedSource === 'global' ? 'text-green-500/40' : 'text-orange-500/40'}>
              Mode: {selectedSource === 'global' ? 'Public' : 'Intranet'}
           </span>
        </div>
        <span>© 2025 Nonius CDN Ops</span>
      </footer>
    </div>
  );
};

export default App;