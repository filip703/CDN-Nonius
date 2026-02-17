
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ChannelCard from './components/ChannelCard';
import VideoPlayer from './components/VideoPlayer';
import { RAW_CHANNELS } from './constants';
import { ChannelResponse } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [previewChannel, setPreviewChannel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');
  const [refreshKey, setRefreshKey] = useState(0);

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

  const pinChannel = (channel: ChannelResponse) => {
    if (!pinnedChannels.find(c => c.channel_name === channel.channel_name)) {
      setPinnedChannels(prev => [...prev, channel]);
    }
  };

  const unpinChannel = (name: string) => {
    setPinnedChannels(prev => prev.filter(c => c.channel_name !== name));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] flex flex-col font-sans">
      <div className="max-w-[1600px] mx-auto w-full px-6 flex-1 flex flex-col">
        <Header />

        <nav className="flex items-center gap-10 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('library')}
            className={`pb-4 px-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'library' ? 'text-[#0070C0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Registry Library
            {activeTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070C0]"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`pb-4 px-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-3 ${
              activeTab === 'monitoring' ? 'text-[#0070C0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Operations Wall
            {pinnedChannels.length > 0 && (
              <span className="bg-[#87A238] text-white text-[9px] px-1.5 py-0.5 rounded-sm font-mono leading-none">
                {pinnedChannels.length}
              </span>
            )}
            {activeTab === 'monitoring' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0070C0]"></div>}
          </button>
        </nav>

        <div className="flex-1 pb-12">
          {activeTab === 'library' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                   <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                   <input 
                    type="text"
                    placeholder="Sök kanal i registret..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-transparent text-sm focus:outline-none w-full font-medium"
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest hidden md:block">
                  Provisioned Nodes: {allChannels.length}
                </div>
              </div>

              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-5">
                    <div className="flex items-center gap-4">
                      <h3 className="heading text-[10px] uppercase tracking-[0.3em] text-slate-400 font-black">
                        {headend} Cluster
                      </h3>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                      {filtered.map((channel) => (
                        <div key={channel.channel_name} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#0070C0]/30 transition-all flex flex-col">
                          <div className="relative aspect-video bg-slate-100">
                            {previewChannel === channel.channel_name ? (
                              <VideoPlayer url={channel.stream_url_https} showControls={false} />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center mb-2 group-hover:bg-[#0070C0] group-hover:border-[#0070C0] transition-all">
                                  <svg className="w-4 h-4 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <button 
                                  onClick={() => setPreviewChannel(channel.channel_name)}
                                  className="text-[8px] font-black uppercase tracking-widest text-[#0070C0]"
                                >
                                  Launch Probe
                                </button>
                              </div>
                            )}
                            {previewChannel === channel.channel_name && (
                              <button 
                                onClick={() => setPreviewChannel(null)}
                                className="absolute top-2 right-2 bg-black/60 text-white text-[8px] font-bold px-2 py-1 rounded uppercase z-20 hover:bg-red-600 transition-colors"
                              >
                                Close
                              </button>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-[#171844] uppercase tracking-tight">{channel.channel_name}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-[#87A238]"></div>
                            </div>
                            <span className="text-[9px] font-mono text-slate-400">{channel.multicast_ip}</span>
                            
                            <button 
                              onClick={() => pinChannel(channel)}
                              disabled={!!pinnedChannels.find(p => p.channel_name === channel.channel_name)}
                              className={`mt-4 w-full text-[9px] font-bold py-2 rounded uppercase tracking-widest transition-all border ${
                                pinnedChannels.find(p => p.channel_name === channel.channel_name)
                                ? 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-[#0070C0] text-[#0070C0] hover:bg-[#0070C0] hover:text-white'
                              }`}
                            >
                              {pinnedChannels.find(p => p.channel_name === channel.channel_name) ? 'In Wall' : 'Monitor'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="animate-in fade-in duration-500">
              {pinnedChannels.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-2xl border border-slate-200">
                  <h3 className="heading text-sm text-slate-400 uppercase tracking-[0.3em] mb-2">Wall Standby</h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">Inga aktiva strömmar i övervakningen</p>
                  <button onClick={() => setActiveTab('library')} className="mt-8 text-[10px] font-bold text-[#0070C0] uppercase tracking-widest underline underline-offset-4">Öppna registret</button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between bg-slate-900 px-6 py-3 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">Live Feed Active • {pinnedChannels.length} Streams</span>
                    </div>
                    <button onClick={() => setPinnedChannels([])} className="text-[9px] font-bold text-red-400 uppercase hover:text-red-300 transition-colors">Terminate All</button>
                  </div>

                  <div className={`grid gap-4 ${
                    pinnedChannels.length === 1 ? 'grid-cols-1 max-w-4xl mx-auto' : 
                    pinnedChannels.length === 2 ? 'grid-cols-2' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {pinnedChannels.map((channel) => (
                      <div key={`${channel.channel_name}-${refreshKey}`} className="relative bg-black rounded-lg overflow-hidden group shadow-2xl">
                        <VideoPlayer url={channel.stream_url_https} showControls={true} />
                        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest bg-[#0070C0] px-2 py-0.5 rounded">{channel.channel_name}</span>
                          <button onClick={() => unpinChannel(channel.channel_name)} className="text-white/60 hover:text-red-500 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <footer className="py-10 border-t border-slate-200 text-center">
        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.4em]">
          Nonius Swedish CDN Registry &bull; Verified Direct IP Path
        </div>
      </footer>
    </div>
  );
};

export default App;
