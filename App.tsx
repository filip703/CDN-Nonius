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
      addLog("Node heartbeat detected. Decoders ready.", 'info');
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

  // Mandatory Gatekeeper View
  if (!selectedSource) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-10 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-50"></div>
        
        <div className="mb-20 animate-in fade-in slide-in-from-top-10 duration-1000">
           <Logo light size="lg" />
        </div>
        
        <div className="text-center mb-16 relative z-10">
          <h1 className="text-white text-2xl font-black uppercase tracking-[0.6em] mb-3">CDN Control Infrastructure</h1>
          <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.4em]">Initialize Monitoring Node • Restricted Session</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl relative z-10">
          {[
            { id: 'global', name: 'Global OTT', desc: 'Nonius Cloud Public Proxy', color: 'blue' },
            { id: 'sthlm-edge', name: 'Stockholm EDGE', desc: '172.18.56.5 Core Node', color: 'orange' },
            { id: 'porto-hq', name: 'Maia Porto HQ', desc: '10.20.30.253 Maia HQ', color: 'green' },
            { id: 'porto-noc', name: 'Maia Porto NOC', desc: '10.0.30.40 Porto NOC', color: 'red' }
          ].map((src) => (
            <button
              key={src.id}
              onClick={() => setSelectedSource(src.id as SourceKey)}
              className="group relative bg-[#171844]/40 border border-white/5 p-10 rounded-[2.5rem] hover:bg-[#171844] hover:border-[#0070C0]/50 transition-all duration-500 text-left overflow-hidden shadow-2xl hover:shadow-blue-500/10"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                 <svg className="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <div className="relative z-10">
                <div className={`w-12 h-1.5 rounded-full mb-8 ${src.color === 'blue' ? 'bg-[#0070C0]' : src.color === 'orange' ? 'bg-orange-500' : src.color === 'green' ? 'bg-[#87A238]' : 'bg-red-500'}`}></div>
                <h3 className="text-white text-xl font-black uppercase tracking-tighter mb-2">{src.name}</h3>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{src.desc}</p>
                <div className="mt-12 flex items-center gap-3 text-[9px] font-black text-[#0070C0] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                  Initialize Link
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
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
      addLog(`DISCONNECTED: ${channel.channel_name}`, 'info');
    } else {
      setPinnedChannels(prev => [...prev, channel]);
      addLog(`LINKED: ${channel.channel_name} to Wall`, 'success');
    }
  };

  return (
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden border-[12px] border-[#171844]">
      
      {/* Dynamic Navigation Bar */}
      <nav className="bg-[#171844] px-6 py-4 flex items-center justify-between shadow-2xl border-b border-white/5 relative z-50">
        <div className="flex items-center gap-6">
           <Logo light size="sm" />
           <div className="h-8 w-px bg-white/10 mx-2"></div>
           <button 
             onClick={() => {
                setSelectedSource(null);
                setPinnedChannels([]);
             }}
             className="text-[9px] font-black text-white/40 hover:text-white uppercase tracking-[0.2em] bg-white/5 px-4 py-2 rounded-xl border border-white/5 transition-all hover:border-[#0070C0]/50"
           >
             Disconnect Node
           </button>
        </div>
        
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-[#0070C0] text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Registry Library
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-10 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white shadow-lg shadow-green-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            Operations Wall
            {pinnedChannels.length > 0 && <span className="bg-black/60 px-2 py-0.5 rounded-full text-[8px] border border-white/20 ml-1">{pinnedChannels.length}</span>}
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">{selectedSource.toUpperCase()}</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#87A238] shadow-[0_0_15px_#87A238] animate-pulse"></div>
            </div>
            <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest mt-1">Uplink Encryption Active</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-12 bg-gradient-to-br from-[#0F172A] to-[#020617] scroll-smooth">
          
          {activeTab === 'library' && (
            <div className="space-y-16 max-w-[1600px] mx-auto pb-24">
              <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 border-b border-white/5 pb-16">
                <div className="animate-in fade-in slide-in-from-left-6 duration-700">
                  <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-3">Registry Explorer</h1>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#0070C0]"></span>
                    Isolated Infrastructure: {selectedSource.toUpperCase()}
                  </p>
                </div>
                <div className="relative w-full lg:w-[500px] animate-in fade-in slide-in-from-right-6 duration-700">
                  <input 
                    type="text" 
                    placeholder="Search Channels, IP or Headends..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#171844]/50 border border-white/10 rounded-[2rem] px-14 py-5 text-sm text-white focus:outline-none focus:border-[#0070C0] focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/20"
                  />
                  <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#0070C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </header>

              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="flex items-center justify-between bg-[#171844]/30 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
                      <div className="flex items-center gap-8">
                         <div className="w-16 h-16 bg-[#171844] flex items-center justify-center rounded-2xl border border-white/10 shadow-2xl">
                            <svg className="w-8 h-8 text-[#0070C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                         </div>
                         <div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{headend}</h3>
                            <div className="flex items-center gap-4 mt-1">
                               <span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">{channels.length} Configured Nodes</span>
                               <span className="text-[11px] text-[#87A238] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#87A238] animate-pulse"></span>
                                  Ready for Ingest
                               </span>
                            </div>
                         </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newPins = filtered.filter(c => !pinnedChannels.find(p => p.channel_name === c.channel_name));
                          setPinnedChannels(prev => [...prev, ...newPins]);
                          setActiveTab('monitoring');
                          addLog(`DEPLOY: Cluster ${headend} linked to operations.`, 'success');
                        }}
                        className="bg-white/5 border border-white/10 hover:border-[#87A238]/50 px-10 py-4 rounded-2xl transition-all group"
                      >
                        <span className="text-[11px] font-black text-white/40 group-hover:text-[#87A238] uppercase tracking-[0.2em]">Deploy Entire Cluster</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-8">
                      {filtered.map((channel) => {
                        const isPinned = !!pinnedChannels.find(p => p.channel_name === channel.channel_name);
                        return (
                          <div 
                            key={channel.channel_name} 
                            className={`group relative bg-[#1E293B]/30 border border-white/5 rounded-[2rem] p-6 hover:border-[#0070C0]/50 hover:bg-[#1E293B]/50 transition-all duration-500 flex flex-col ${isPinned ? 'ring-2 ring-[#87A238]/40 shadow-[0_0_30px_rgba(135,162,56,0.1)]' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-6">
                              <div className="flex flex-col">
                                <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-[#0070C0] transition-colors">{channel.channel_name}</span>
                                <span className="text-[9px] font-mono text-slate-500 mt-1">{channel.multicast_ip}</span>
                              </div>
                              <button 
                                onClick={() => togglePin(channel)}
                                className={`p-2.5 rounded-xl transition-all ${isPinned ? 'bg-[#87A238] text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-500 hover:bg-[#171844] hover:text-[#0070C0]'}`}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" /></svg>
                              </button>
                            </div>
                            
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl border border-white/5 group-hover:scale-[1.02] transition-transform duration-500">
                               <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} muted={true} />
                            </div>

                            <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{selectedSource === 'global' ? 'HLS PROXY' : 'LOCAL EDGE'}</span>
                               <div className="flex gap-2">
                                  <div className="w-2 h-2 rounded-full bg-[#87A238] shadow-[0_0_5px_#87A238]"></div>
                                  <div className="w-2 h-2 rounded-full bg-[#87A238]/20"></div>
                               </div>
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
            <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-700">
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Monitoring Wall</h2>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-2">Active Ingest Streams • Infrastructure: {selectedSource.toUpperCase()}</p>
                 </div>
                 {pinnedChannels.length > 0 && (
                   <button 
                    onClick={() => {
                      setPinnedChannels([]);
                      addLog("Emergency override: All monitoring sessions terminated.", 'warn');
                    }} 
                    className="flex items-center gap-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-8 py-3 rounded-2xl border border-red-500/20 transition-all text-[10px] font-black uppercase tracking-widest"
                   >
                     Terminate All Feeds
                   </button>
                 )}
              </div>
              
              {pinnedChannels.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-center">
                   <Logo size="lg" />
                   <p className="mt-12 text-[11px] font-black text-white uppercase tracking-[0.6em]">No Active Video Probes</p>
                   <button 
                    onClick={() => setActiveTab('library')}
                    className="mt-8 px-10 py-4 bg-[#0070C0] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all"
                   >
                    Ingest from Library
                   </button>
                </div>
              ) : (
                <div className="grid gap-6 h-full content-start overflow-y-auto pr-4 pb-20" style={{
                  gridTemplateColumns: `repeat(${pinnedChannels.length >= 9 ? 4 : pinnedChannels.length >= 5 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
                }}>
                  {pinnedChannels.map((channel) => (
                    <div key={channel.channel_name} className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden group border border-white/5 hover:border-[#87A238] shadow-2xl transition-all duration-300">
                      <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} showControls={true} autoPlay={true} />
                      
                      <div className="absolute top-5 left-5 flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                         <div className="w-2.5 h-2.5 rounded-full bg-[#87A238] animate-pulse shadow-[0_0_10px_#87A238]"></div>
                         <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-tight">{channel.channel_name}</span>
                            <span className="text-[8px] font-mono text-white/40">{channel.multicast_ip}</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => togglePin(channel)}
                        className="absolute top-5 right-5 p-3 bg-red-500/20 hover:bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Technical Sidebar */}
        <aside className="w-96 bg-[#020617] border-l border-white/5 flex flex-col hidden 2xl:flex shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="p-10 border-b border-white/5 bg-[#171844]/20">
             <h4 className="text-[10px] font-black text-white uppercase tracking-[0.5em] mb-10 flex items-center gap-3">
               <span className="w-3 h-0.5 bg-[#0070C0]"></span>
               Node Diagnostic
             </h4>
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Aggregate Load</span>
                   <span className="text-xs font-mono text-[#87A238] font-bold">{(pinnedChannels.length * 5.2).toFixed(1)} Gbps</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Active Links</span>
                   <span className="text-xs font-mono text-white">{pinnedChannels.length} / 24</span>
                </div>
                <div className="pt-6 border-t border-white/5">
                   <span className="text-[8px] text-white/20 uppercase font-black mb-3 block tracking-widest">NOC Buffer Utilization</span>
                   <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-1000 ease-out" 
                        style={{ width: `${Math.min(100, (pinnedChannels.length * 10) + 12)}%` }}
                      ></div>
                   </div>
                </div>
             </div>
          </div>

          <div className="flex-1 p-10 overflow-y-auto font-mono scroll-smooth">
             <h5 className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-8">Operations Log v4.5</h5>
             <div className="space-y-6">
                {logs.map((log, i) => (
                  <div key={i} className="text-[10px] border-l-2 border-white/5 pl-5 py-1.5 animate-in fade-in slide-in-from-left-4">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-slate-600 text-[9px] uppercase font-bold">{log.time}</span>
                       <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-tighter uppercase ${
                         log.type === 'success' ? 'bg-[#87A238]/10 text-[#87A238]' : 
                         log.type === 'warn' ? 'bg-red-500/10 text-red-500' : 
                         'bg-blue-500/10 text-blue-400'
                       }`}>{log.type}</span>
                    </div>
                    <p className="text-slate-400 leading-relaxed tracking-tight">{log.msg}</p>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-10 bg-black/40">
             <div className="bg-[#171844] p-6 rounded-3xl border border-white/5 shadow-2xl">
                <span className="text-[9px] text-[#0070C0] font-black uppercase mb-4 block tracking-widest">Control Matrix Status</span>
                <div className="grid grid-cols-4 gap-3">
                   {Array.from({length: 12}).map((_, i) => (
                     <div key={i} className={`h-2 rounded-full ${i < pinnedChannels.length ? 'bg-[#87A238]' : 'bg-white/5 shadow-inner'}`}></div>
                   ))}
                </div>
             </div>
          </div>
        </aside>
      </div>

      <footer className="bg-[#171844] border-t border-white/5 px-10 py-4 flex justify-between items-center z-50">
        <div className="flex gap-12 items-center">
          <div className="flex gap-6">
             <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Protocol: QUIC/HLS-V3</span>
             <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Session: {Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#87A238] shadow-[0_0_8px_#87A238]"></div>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.4em]">Node Uplink: ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">NONIUS CDN CORE PRODUCTION UNIT</span>
           <span className="bg-white/5 px-3 py-1 rounded-lg text-[8px] text-white/50 font-mono border border-white/5">v4.5.2-STABLE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;