
import React, { useState, useMemo, useEffect } from 'react';
import VideoPlayer from './components/VideoPlayer';
import Logo from './components/Logo';
import { RAW_CHANNELS } from './constants';
import { ChannelResponse } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');
  const [logs, setLogs] = useState<{msg: string, time: string, type: 'info' | 'warn' | 'success'}[]>([]);

  useEffect(() => {
    addLog("CDN Controller v4.2 Uplink Established", 'success');
    addLog("Monitoring all 4 Headend Clusters", 'info');
  }, []);

  const addLog = (msg: string, type: 'info' | 'warn' | 'success' = 'info') => {
    const time = new Date().toLocaleTimeString('sv-SE', { hour12: false });
    setLogs(prev => [{msg, time, type}, ...prev].slice(0, 15));
  };

  const allChannels = useMemo(() => {
    return RAW_CHANNELS.map(c => ({
      channel_name: c.name,
      multicast_ip: c.ip,
      headend_id: c.head,
      stream_url_https: c.https,
      stream_url_local: c.local,
      status: 'found' as const
    }));
  }, []);

  const categorizedChannels = useMemo(() => {
    const groups: Record<string, ChannelResponse[]> = {};
    allChannels.forEach(c => {
      const group = c.headend_id === 'N/A' ? 'Unassigned' : c.headend_id.toUpperCase();
      if (!groups[group]) groups[group] = [];
      groups[group].push(c);
    });
    return groups;
  }, [allChannels]);

  const deployCluster = (clusterName: string) => {
    const cluster = categorizedChannels[clusterName];
    if (cluster) {
      const newChannels = cluster.filter(c => !pinnedChannels.find(p => p.channel_name === c.channel_name));
      setPinnedChannels(prev => [...prev, ...newChannels]);
      addLog(`DEPLOY: ${clusterName} pushing ${newChannels.length} streams to Monitoring.`, 'success');
      setActiveTab('monitoring');
    }
  };

  const clearWall = () => {
    setPinnedChannels([]);
    addLog("Wall cleared. All monitoring sessions terminated.", 'warn');
  };

  const togglePin = (channel: ChannelResponse) => {
    const isPinned = pinnedChannels.find(p => p.channel_name === channel.channel_name);
    if (isPinned) {
      setPinnedChannels(prev => prev.filter(p => p.channel_name !== channel.channel_name));
      addLog(`REMOVED: ${channel.channel_name}`, 'info');
    } else {
      setPinnedChannels(prev => [...prev, channel]);
      addLog(`PINNED: ${channel.channel_name} to Wall`, 'success');
    }
  };

  return (
    <div className="h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden border-[12px] border-[#171844]">
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#171844] px-6 py-4 flex items-center justify-between shadow-2xl border-b border-white/5 relative z-50">
        <Logo light size="sm" />
        
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 backdrop-blur-md">
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-[#0070C0] text-white shadow-lg shadow-blue-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            Registry Library
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white shadow-lg shadow-green-500/20' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            Operations Wall
            {pinnedChannels.length > 0 && <span className="bg-black/60 px-2 py-0.5 rounded-full text-[8px] border border-white/20 ml-1">{pinnedChannels.length}</span>}
          </button>
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[7px] text-white/30 font-black uppercase tracking-[0.3em]">Aggregate Load</span>
            <span className="text-sm font-mono text-[#87A238] font-black tracking-tighter">{(pinnedChannels.length * 4.8).toFixed(1)} Gbps</span>
          </div>
          <div className="w-px h-10 bg-white/10 hidden md:block"></div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black text-white uppercase tracking-widest">NOC Stable</span>
              <div className="w-2.5 h-2.5 rounded-full bg-[#87A238] shadow-[0_0_10px_#87A238] animate-pulse"></div>
            </div>
            <span className="text-[7px] text-white/20 font-bold uppercase tracking-widest mt-0.5">Primary Cluster Active</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#0F172A] to-[#020617] scroll-smooth">
          
          {activeTab === 'library' && (
            <div className="space-y-16 max-w-[1600px] mx-auto pb-20">
              <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-white/5 pb-12">
                <div className="animate-in fade-in slide-in-from-left-4 duration-700">
                  <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">Registry Explorer</h1>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0070C0]"></span>
                    Central Provisioning & Signal Distribution
                  </p>
                </div>
                <div className="relative w-full lg:w-[450px] animate-in fade-in slide-in-from-right-4 duration-700">
                  <input 
                    type="text" 
                    placeholder="Search Node, IP or Headend..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-[#171844]/50 border border-white/10 rounded-2xl px-12 py-4 text-sm text-white focus:outline-none focus:border-[#0070C0] focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-white/20"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0070C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </header>

              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()) || headend.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="flex items-center justify-between bg-[#171844]/30 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-[#171844] flex items-center justify-center rounded-xl border border-[#0070C0]/20 shadow-xl">
                          <svg className="w-7 h-7 text-[#0070C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{headend} Cluster</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{channels.length} Nodes Configured</span>
                            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
                            <span className="text-[10px] text-[#87A238] font-black uppercase tracking-[0.2em] flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#87A238] animate-pulse"></span>
                              All Probes Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => deployCluster(headend)}
                        className="group flex items-center gap-3 bg-[#87A238]/10 hover:bg-[#87A238] border border-[#87A238]/30 px-8 py-3 rounded-xl transition-all duration-300"
                      >
                        <span className="text-[10px] font-black text-[#87A238] group-hover:text-white uppercase tracking-[0.2em]">Sync Cluster to Wall</span>
                        <svg className="w-4 h-4 text-[#87A238] group-hover:text-white group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
                      {filtered.map((channel) => {
                        const isPinned = !!pinnedChannels.find(p => p.channel_name === channel.channel_name);
                        return (
                          <div 
                            key={channel.channel_name} 
                            className={`group relative bg-[#1E293B]/30 border border-white/5 rounded-2xl p-5 hover:border-[#0070C0]/50 hover:bg-[#1E293B]/50 transition-all duration-500 flex flex-col ${isPinned ? 'ring-2 ring-[#87A238]/40' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover:text-[#0070C0] transition-colors">{channel.channel_name}</span>
                                <span className="text-[8px] font-mono text-slate-500 mt-0.5">{channel.multicast_ip}</span>
                              </div>
                              <button 
                                onClick={() => togglePin(channel)}
                                className={`p-2 rounded-lg transition-all ${isPinned ? 'bg-[#87A238] text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-[#171844] hover:text-[#0070C0]'}`}
                                title={isPinned ? "Remove from Wall" : "Add to Monitoring"}
                              >
                                {isPinned ? (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 9V4l1 1V2H7v2l1-1v5c0 2.18-1.79 3.99-4 4v2h7v7l1 1 1-1v-7h7v-2c-2.21-.01-4-1.82-4-4z" /></svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                                )}
                              </button>
                            </div>
                            
                            <div className="aspect-video bg-black rounded-xl overflow-hidden relative shadow-2xl border border-white/5 group-hover:scale-[1.02] transition-transform duration-500">
                               <VideoPlayer 
                                  url={channel.stream_url_https} 
                                  channelName={channel.channel_name} 
                                  showControls={false} 
                                  muted={true} 
                                  className="h-full"
                                />
                               <div className="absolute inset-0 bg-blue-500/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                              <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#87A238] shadow-[0_0_5px_#87A238]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]"></div>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]/20"></div>
                              </div>
                              <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">HLS/HTTP-V3</span>
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
            <div className="h-full flex flex-col animate-in fade-in zoom-in duration-700">
              <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Monitoring Wall</h2>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Real-time Multi-Stream Decapsulation</p>
                </div>
                {pinnedChannels.length > 0 && (
                  <button 
                    onClick={clearWall}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-2 rounded-xl border border-red-500/20 transition-all text-[9px] font-black uppercase tracking-widest"
                  >
                    Terminate All Feeds
                  </button>
                )}
              </div>

              {pinnedChannels.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                    <svg className="w-12 h-12 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-[0.5em]">No Active Ingests</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-3">Select nodes from registry to initialize monitoring</p>
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="mt-10 px-10 py-4 bg-[#0070C0] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-600 transition-all"
                  >
                    Open Library
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 h-full content-start overflow-y-auto pr-2 pb-10" style={{
                  gridTemplateColumns: `repeat(${pinnedChannels.length >= 9 ? 4 : pinnedChannels.length >= 5 ? 3 : pinnedChannels.length >= 2 ? 2 : 1}, 1fr)`
                }}>
                  {pinnedChannels.map((channel) => (
                    <div key={channel.channel_name} className="relative aspect-video bg-black rounded-xl overflow-hidden group border border-white/5 hover:border-[#87A238] shadow-2xl transition-all duration-300">
                      <VideoPlayer 
                        url={channel.stream_url_https} 
                        channelName={channel.channel_name} 
                        showControls={true} 
                        autoPlay={true}
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                         <div className="w-2 h-2 rounded-full bg-[#87A238] animate-pulse"></div>
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white uppercase tracking-tight">{channel.channel_name}</span>
                            <span className="text-[7px] font-mono text-white/40">{channel.headend_id.toUpperCase()} • {channel.multicast_ip}</span>
                         </div>
                      </div>
                      <button 
                        onClick={() => togglePin(channel)}
                        className="absolute top-4 right-4 p-2.5 bg-red-500/20 hover:bg-red-500 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                        title="Kill Feed"
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

        {/* Technical Sidebar / Logger */}
        <aside className="w-96 bg-[#020617] border-l border-white/5 flex flex-col hidden 2xl:flex shadow-[-20px_0_50px_rgba(0,0,0,0.5)]">
          <div className="p-8 border-b border-white/5 bg-[#171844]/20">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
              <span className="w-2 h-0.5 bg-[#0070C0]"></span>
              System Diagnostic
            </h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Global Uptime</span>
                <span className="text-[10px] font-mono text-white bg-white/5 px-2 py-1 rounded">244:12:04:12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">CDN Auth</span>
                <span className="flex items-center gap-2 text-[10px] font-mono text-[#87A238] font-bold">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]"></div>
                  ENCRYPTED
                </span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <span className="text-[7px] text-white/20 uppercase font-black mb-2 block">NOC Load Indicator</span>
                <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, (pinnedChannels.length * 8) + 15)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto font-mono scroll-smooth">
            <h5 className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-6">Real-time Operations Log</h5>
            <div className="space-y-6">
              {logs.map((log, i) => (
                <div key={i} className="text-[10px] border-l-2 border-white/10 pl-4 py-1 animate-in fade-in slide-in-from-left-4 duration-500">
                  <div className="flex items-center justify-between mb-1">
                     <span className="text-slate-600 text-[8px] uppercase">{log.time}</span>
                     <span className={`text-[7px] px-1 rounded uppercase font-black ${
                       log.type === 'success' ? 'bg-[#87A238]/10 text-[#87A238]' : 
                       log.type === 'warn' ? 'bg-red-500/10 text-red-500' : 
                       'bg-blue-500/10 text-blue-400'
                     }`}>{log.type}</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed font-mono tracking-tight">{log.msg}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 bg-black/40">
            <div className="bg-[#171844] p-4 rounded-xl border border-white/10">
              <span className="text-[8px] text-[#0070C0] font-black uppercase mb-2 block">Control Matrix V4</span>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({length: 12}).map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full ${i < pinnedChannels.length ? 'bg-[#87A238]' : 'bg-white/5'}`}></div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Global Status Bar */}
      <footer className="bg-[#171844] border-t border-white/5 px-8 py-3 flex justify-between items-center z-50">
        <div className="flex gap-10 items-center">
          <div className="flex gap-4">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Protocol: QUIC/V3</span>
             <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">Buffer: 8.0s Adaptive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]"></div>
            <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Heads (1-4) Synchronized</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">© 2025 NONIUS CDN CORE PRODUCTION</span>
           <span className="bg-white/10 px-2 py-0.5 rounded text-[7px] text-white/60 font-mono">v4.2.0-STABLE</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
