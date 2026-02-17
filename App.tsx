
import React, { useState, useMemo, useEffect } from 'react';
import Header from './components/Header';
import VideoPlayer from './components/VideoPlayer';
import Logo from './components/Logo';
import { RAW_CHANNELS } from './constants';
import { ChannelResponse } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');
  const [logs, setLogs] = useState<{msg: string, time: string}[]>([]);

  useEffect(() => {
    addLog("System Initialized. All Headends Online.");
  }, []);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('sv-SE', { hour12: false });
    setLogs(prev => [{msg, time}, ...prev].slice(0, 5));
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
      const group = c.headend_id === 'N/A' ? 'External' : c.headend_id;
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
      addLog(`DEPLOY: Cluster ${clusterName} pushed to Monitoring Wall.`);
      setActiveTab('monitoring');
    }
  };

  const togglePin = (channel: ChannelResponse) => {
    const isPinned = pinnedChannels.find(p => p.channel_name === channel.channel_name);
    if (isPinned) {
      setPinnedChannels(prev => prev.filter(p => p.channel_name !== channel.channel_name));
      addLog(`REMOVED: ${channel.channel_name} from wall.`);
    } else {
      setPinnedChannels(prev => [...prev, channel]);
      addLog(`ADDED: ${channel.channel_name} to monitoring.`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-300 flex flex-col font-sans overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="bg-[#171844] border-b border-white/10 px-6 py-4 flex items-center justify-between z-50 shadow-2xl">
        <Logo light size="sm" />
        
        <div className="flex bg-white/5 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setActiveTab('library')}
            className={`px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'library' ? 'bg-[#0070C0] text-white' : 'text-white/40 hover:text-white'}`}
          >
            Registry Library
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'monitoring' ? 'bg-[#87A238] text-white' : 'text-white/40 hover:text-white'}`}
          >
            Operations Wall
            {pinnedChannels.length > 0 && <span className="bg-black/30 px-1.5 py-0.5 rounded text-[8px]">{pinnedChannels.length}</span>}
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-white/40 font-bold uppercase">Total Bandwidth</span>
            <span className="text-xs font-mono text-[#87A238] font-black">{(pinnedChannels.length * 5.2).toFixed(1)} Gbps</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#87A238] animate-pulse"></div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">NOC-1 Stable</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          
          {activeTab === 'library' && (
            <div className="space-y-12 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                  <h1 className="text-2xl font-bold text-white uppercase tracking-tighter mb-1">Channel Registry</h1>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Global CDN Provisioning & Distribution</p>
                </div>
                <div className="relative w-full md:w-96">
                  <input 
                    type="text" 
                    placeholder="Search channel or node..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-full px-10 py-3 text-sm focus:outline-none focus:border-[#0070C0] transition-all"
                  />
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
              </div>

              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-[#171844] text-[#87A238] p-2 rounded border border-[#87A238]/20">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white uppercase tracking-tight">{headend} Cluster</h3>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{channels.length} Nodes Online</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => deployCluster(headend)}
                        className="text-[10px] font-black text-[#87A238] border border-[#87A238]/30 px-4 py-2 rounded uppercase hover:bg-[#87A238] hover:text-white transition-all tracking-widest"
                      >
                        Deploy Cluster to Wall
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filtered.map((channel) => {
                        const isPinned = !!pinnedChannels.find(p => p.channel_name === channel.channel_name);
                        return (
                          <div key={channel.channel_name} className="bg-[#1E293B]/50 border border-white/5 rounded-lg p-4 hover:border-[#0070C0]/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-white uppercase truncate w-32">{channel.channel_name}</span>
                                <span className="text-[8px] font-mono text-slate-500">{channel.multicast_ip}</span>
                              </div>
                              <button 
                                onClick={() => togglePin(channel)}
                                className={`p-1.5 rounded transition-colors ${isPinned ? 'bg-[#87A238] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                              >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 9V4l1 1V2H7v2l1-1v5c0 2.18-1.79 3.99-4 4v2h7v7l1 1 1-1v-7h7v-2c-2.21-.01-4-1.82-4-4z" /></svg>
                              </button>
                            </div>
                            <div className="aspect-video bg-black rounded mb-4 overflow-hidden relative group-hover:ring-1 ring-[#0070C0]">
                              <VideoPlayer url={channel.stream_url_https} showControls={false} muted={true} />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Probe</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-[#87A238]"></div>
                                <div className="w-1 h-1 rounded-full bg-[#87A238]"></div>
                                <div className="w-1 h-1 rounded-full bg-white/20"></div>
                              </div>
                              <span className="text-[7px] font-bold text-slate-600 uppercase">Latency: 24ms</span>
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
            <div className="h-full flex flex-col animate-in fade-in duration-500">
              {pinnedChannels.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 border-2 border-dashed border-white/10 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                  <h3 className="text-sm font-bold text-white/20 uppercase tracking-[0.4em]">Monitoring Wall Standby</h3>
                  <p className="text-[9px] text-white/10 uppercase tracking-widest mt-2">Zero Active Ingests detected</p>
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="mt-8 px-8 py-3 bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all rounded"
                  >
                    Open Registry
                  </button>
                </div>
              ) : (
                <div className="grid gap-2 h-full content-start" style={{
                  gridTemplateColumns: `repeat(${pinnedChannels.length > 9 ? 4 : pinnedChannels.length > 4 ? 3 : pinnedChannels.length > 1 ? 2 : 1}, 1fr)`
                }}>
                  {pinnedChannels.map((channel) => (
                    <div key={channel.channel_name} className="relative aspect-video bg-black group border border-white/5 hover:border-[#0070C0] transition-colors">
                      <VideoPlayer url={channel.stream_url_https} channelName={channel.channel_name} showControls={false} />
                      <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/60 px-2 py-1 rounded border border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">{channel.channel_name}</span>
                        <div className="w-1 h-3 bg-[#0070C0]"></div>
                        <span className="text-[8px] font-mono text-white/60">{channel.headend_id}</span>
                      </div>
                      <button 
                        onClick={() => togglePin(channel)}
                        className="absolute top-2 right-2 p-1.5 bg-black/40 hover:bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-all"
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

        {/* Console / Log Sidebar (Tech Hat) */}
        <aside className="w-80 bg-[#0F172A] border-l border-white/5 flex flex-col hidden xl:flex">
          <div className="p-6 border-b border-white/5 bg-[#171844]/20">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4">System Console</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-slate-500 uppercase font-bold">Uptime</span>
                <span className="text-[9px] font-mono text-white">142:12:04</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[8px] text-slate-500 uppercase font-bold">API Status</span>
                <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#87A238]">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]"></div>
                  CONNECTED
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto font-mono">
            <div className="space-y-4">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] border-l border-white/10 pl-3 py-1 animate-in fade-in slide-in-from-left-2">
                  <span className="text-slate-600 mr-2">[{log.time}]</span>
                  <span className={log.msg.includes('DEPLOY') ? 'text-[#87A238]' : 'text-slate-400'}>{log.msg}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-white/5 bg-black/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-[8px] font-black text-white uppercase tracking-widest">Network Load</span>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-[#0070C0] h-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, (pinnedChannels.length * 12) + 10)}%` }}
              ></div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mini-footer for tech info */}
      <footer className="bg-[#171844] border-t border-white/5 px-6 py-2 flex justify-between items-center z-50">
        <div className="flex gap-6">
          <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Protocol: HLS/HTTP/3</span>
          <span className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Security: AES-128 Validated</span>
        </div>
        <span className="text-[7px] font-bold text-white/40 uppercase tracking-widest">Nonius CDN Core v4.2.0-Production</span>
      </footer>
    </div>
  );
};

export default App;
