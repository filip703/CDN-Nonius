
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
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  useEffect(() => {
    if (selectedSource) {
      addLog(`LINK ESTABLISHED: ${selectedSource.toUpperCase()}`, 'success');
      addLog("Initializing local decoders...", 'info');
    }
  }, [selectedSource]);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('sv-SE', { hour12: false });
    setLogs(prev => [{msg, time, type}, ...prev].slice(0, 15));
  };

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
        <div className="mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
           <Logo light size="lg" />
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-white text-xl font-black uppercase tracking-[0.5em] mb-2">Select Network Infrastructure</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">Authorized Access Only • Monitoring Node V4.5</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            { id: 'global', name: 'Global OTT', desc: 'Nonius Cloud Infrastructure', color: 'blue' },
            { id: 'sthlm-edge', name: 'Stockholm EDGE', desc: '172.18.56.5 Local Node', color: 'orange' },
            { id: 'porto-hq', name: 'Maia Porto HQ', desc: '10.20.30.253 Local Node', color: 'green' },
            { id: 'porto-noc', name: 'Maia Porto NOC', desc: '10.0.30.40 Control Node', color: 'red' }
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id as SourceKey)}
              className="group relative bg-[#171844]/40 border border-white/5 p-8 rounded-3xl hover:bg-[#171844] hover:border-[#0070C0]/50 transition-all duration-500 text-left overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-40 transition-opacity">
                 <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div className="relative z-10">
                <div className={`w-10 h-1 rounded-full mb-6 ${src.color === 'blue' ? 'bg-[#0070C0]' : src.color === 'orange' ? 'bg-orange-500' : src.color === 'green' ? 'bg-[#87A238]' : 'bg-red-500'}`}></div>
                <h3 className="text-white text-lg font-black uppercase tracking-tighter mb-1">{src.name}</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{src.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-[8px] font-black text-[#0070C0] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                  Connect Node
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
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
      addLog(`REMOVED: ${channel.channel_name}`, 'info');
    } else {
      setPinnedChannels(prev => [...prev, channel]);
      addLog(`PINNED: ${channel.channel_name}`, 'success');
    }
  };

  return (
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden border-[12px] border-[#171844]">
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#171844] px-6 py-4 flex items-center justify-between shadow-2xl border-b border-white/5 relative z-50">
        <div className="flex items-center gap-6">
           <Logo light size="sm" />
           <button 
             onClick={() => setSelectedSource(null)}
             className="text-[8px] font-black text-white/30 hover:text-white uppercase tracking-[0.3em] bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 transition-all"
           >
             Change Network
           </button>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-[#0070C0] text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Registry Library
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white shadow-lg shadow-green-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Operations Wall
            {pinnedChannels.length > 0 && <span className="bg-black/60 px-2 py-0.5 rounded-full text-[8px] border border-white/20 ml-1">{pinnedChannels.length}</span>}
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white uppercase tracking-widest">{selectedSource.toUpperCase()}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#87A238] shadow-[0_0_10px_#87A238] animate-pulse"></div>
            </div>
            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Uplink Stable</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#0F172A] to-[#020617] scroll-smooth">
          
          {activeTab === 'library' && (
            <div className="space-y-16 max-w-[1600px] mx-auto pb-20">
              <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div>
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Registry Explorer</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070C0]"></span>
                    Showing all nodes on {selectedSource.toUpperCase()}
                  </p>
                </div>
                <div className="relative w-full lg:w-[450px]">
                  <input 
                    type="text" 
                    placeholder="Quick Search Registry..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#171844]/50 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-[#0070C0]"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0070C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </header>

              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-8">
                    <div className="flex items-center justify-between bg-[#171844]/30 p-4 rounded-2xl border border-white/5">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{headend} Cluster</h3>
                      <button 
                        onClick={() => {
                          setPinnedChannels(prev => [...prev, ...filtered.filter(c => !prev.find(p => p.channel_name === c.channel_name))]);
                          setActiveTab('monitoring');
                        }}
                        className="text-[10px] font-black text-[#87A238] hover:text-white uppercase tracking-[0.2em] transition-colors"
                      >
                        Deploy Entire Cluster
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                      {filtered.map((channel) => {
                        const isPinned = !!pinnedChannels.find(p => p.channel_name === channel.channel_name);
                        return (
                          <div 
                            key={channel.channel_name} 
                            className={`bg-[#1E293B]/30 border border-white/5 rounded-2xl p-5 hover:border-[#0070C0]/50 transition-all flex flex-col ${isPinned ? 'ring-1 ring-[#87A238]' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-[11px] font-black text-white uppercase tracking-tight">{channel.channel_name}</span>
                              <button onClick={() => togglePin(channel)} className={`p-1.5 rounded ${isPinned ? 'text-[#87A238]' : 'text-white/20'}`}>
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                              </button>
                            </div>
                            <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} muted />
                            <div className="mt-4 text-[7px] font-mono text-slate-500 uppercase flex justify-between">
                               <span>IP: {channel.multicast_ip}</span>
                               <span>Source: {selectedSource}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Wall Monitoring</h2>
                 {pinnedChannels.length > 0 && (
                   <button onClick={() => setPinnedChannels([])} className="text-[10px] font-black text-red-500 uppercase tracking-widest">Terminate All</button>
                 )}
              </div>
              
              {pinnedChannels.length === 0 ? (
                <div className="flex-1 flex items-center justify-center opacity-20">
                   <Logo size="lg" />
                </div>
              ) : (
                <div className="grid gap-4 h-full content-start overflow-y-auto" style={{
                  gridTemplateColumns: `repeat(${pinnedChannels.length >= 9 ? 4 : pinnedChannels.length >= 5 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
                }}>
                  {pinnedChannels.map((channel) => (
                    <div key={channel.channel_name} className="relative aspect-video rounded-xl overflow-hidden group">
                      <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} showControls autoPlay />
                      <button 
                        onClick={() => togglePin(channel)}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        <aside className="w-80 bg-[#020617] border-l border-white/5 flex flex-col hidden xl:flex">
          <div className="p-8 border-b border-white/5 font-mono">
            <h4 className="text-[9px] text-white/40 uppercase tracking-[0.4em] mb-6">Operations Log</h4>
            <div className="space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] leading-tight">
                  <span className="text-slate-600">[{log.time}]</span> <span className={`${log.type === 'success' ? 'text-[#87A238]' : log.type === 'warn' ? 'text-red-500' : 'text-blue-400'}`}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <footer className="bg-[#171844] border-t border-white/5 px-8 py-3 flex justify-between items-center text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">
        <span>NOC Mode: Active</span>
        <span>Linked Node: {selectedSource?.toUpperCase() || 'NONE'}</span>
        <span>© 2025 Nonius CDN</span>
      </footer>
    </div>
  );
};

export default App;
