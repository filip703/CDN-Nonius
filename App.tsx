
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import ChannelCard from './components/ChannelCard';
import VideoPlayer from './components/VideoPlayer';
import { RAW_CHANNELS, searchChannels } from './constants';
import { Status, ChannelResponse } from './types';

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [pinnedChannels, setPinnedChannels] = useState<ChannelResponse[]>([]);
  const [previewChannel, setPreviewChannel] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'library' | 'monitoring'>('library');
  const [refreshKey, setRefreshKey] = useState(0);

  // Parse all channels into technical response format
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
      const group = c.headend_id === 'N/A' ? 'External Nodes' : c.headend_id;
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

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#222222] flex flex-col selection:bg-[#0070C0]/20">
      <div className="max-w-[1600px] mx-auto w-full px-6 flex-1 flex flex-col">
        <Header />

        <nav className="flex items-center gap-12 mb-8 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('library')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${
              activeTab === 'library' ? 'text-[#0070C0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            CDN Registry Library
            {activeTab === 'library' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0070C0] rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab('monitoring')}
            className={`pb-4 px-2 text-xs font-bold uppercase tracking-[0.2em] transition-all relative flex items-center gap-2 ${
              activeTab === 'monitoring' ? 'text-[#0070C0]' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Monitoring Wall
            {pinnedChannels.length > 0 && (
              <span className="bg-[#87A238] text-white text-[9px] px-2 py-0.5 rounded-full font-mono">
                {pinnedChannels.length}
              </span>
            )}
            {activeTab === 'monitoring' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0070C0] rounded-t-full"></div>}
          </button>
        </nav>

        <div className="flex-1 flex flex-col gap-8 pb-12">
          
          {activeTab === 'library' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-12">
              
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sök kanal:</span>
                   <input 
                    type="text"
                    placeholder="Filtrera namn..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-4 text-xs focus:outline-none focus:border-[#0070C0] w-64 font-semibold"
                  />
                </div>
                <div className="text-[10px] font-mono text-[#0070C0] font-bold uppercase">
                  Active Registry Nodes: {allChannels.length}
                </div>
              </div>

              {/* Fix: Explicitly type the entries result to ensure 'channels' is inferred correctly as ChannelResponse[] instead of unknown */}
              {(Object.entries(categorizedChannels) as [string, ChannelResponse[]][]).map(([headend, channels]) => {
                const filtered = channels.filter(c => c.channel_name.toLowerCase().includes(query.toLowerCase()));
                if (filtered.length === 0) return null;

                return (
                  <section key={headend} className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h3 className="heading text-xs uppercase tracking-[0.4em] text-[#171844] bg-slate-100 px-4 py-1 rounded-full border border-slate-200">
                        {headend} Group
                      </h3>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                      {filtered.map((channel) => (
                        <div key={channel.channel_name} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#0070C0]/40 transition-all flex flex-col">
                          
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            {previewChannel === channel.channel_name ? (
                              <VideoPlayer key={`${channel.channel_name}-${refreshKey}`} url={channel.stream_url_https} showControls={false} />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                <span className="text-3xl opacity-20 group-hover:opacity-40 transition-opacity">📡</span>
                                <button 
                                  onClick={() => setPreviewChannel(channel.channel_name)}
                                  className="mt-2 text-[8px] font-bold text-[#0070C0] uppercase tracking-widest border border-[#0070C0]/20 px-2 py-1 rounded hover:bg-[#0070C0] hover:text-white transition-all"
                                >
                                  Öppna Live-sond
                                </button>
                              </div>
                            )}
                            {previewChannel === channel.channel_name && (
                              <button 
                                onClick={() => setPreviewChannel(null)}
                                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-md text-[8px] uppercase font-bold z-30"
                              >
                                Stäng sond
                              </button>
                            )}
                          </div>

                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-bold text-[#171844] uppercase tracking-tight">{channel.channel_name}</span>
                              <span className="text-[8px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">
                                {channel.multicast_ip}
                              </span>
                            </div>
                            
                            <div className="mt-auto flex gap-2 pt-4">
                              <button 
                                onClick={() => pinChannel(channel)}
                                className={`flex-1 text-[9px] font-bold py-2 rounded uppercase tracking-widest transition-all ${
                                  pinnedChannels.find(p => p.channel_name === channel.channel_name)
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-[#0070C0] text-white hover:bg-[#1E83EC] shadow-md shadow-[#0070C0]/20'
                                }`}
                              >
                                {pinnedChannels.find(p => p.channel_name === channel.channel_name) ? 'Tillagd' : 'Lägg till i vägg'}
                              </button>
                            </div>
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
                <div className="text-center py-40 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="text-6xl mb-6 grayscale opacity-20 animate-bounce">📡</div>
                  <h3 className="heading text-xl text-slate-400 uppercase tracking-widest">Övervakningsväggen är tom</h3>
                  <p className="text-slate-400 text-sm mt-2 max-w-xs mx-auto">Gå till biblioteket och lägg till kanaler för att se dem här.</p>
                  <button 
                    onClick={() => setActiveTab('library')}
                    className="mt-8 px-8 py-3 bg-[#171844] text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all"
                  >
                    Öppna biblioteket
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                      <h2 className="heading text-lg text-[#171844] uppercase tracking-widest">Live Operations Control</h2>
                      <p className="text-[10px] text-[#87A238] font-bold uppercase tracking-widest mt-0.5">Stream-status: AKTIV • Synkroniserade strömmar: {pinnedChannels.length}</p>
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleRefreshAll}
                        className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-lg hover:bg-slate-200 transition-all border border-slate-200 flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        Uppdatera alla
                      </button>
                      <button 
                        onClick={() => setPinnedChannels([])}
                        className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
                      >
                        Töm väggen
                      </button>
                    </div>
                  </div>

                  <div className={`grid gap-8 ${
                    pinnedChannels.length === 1 ? 'grid-cols-1 max-w-5xl mx-auto' : 
                    pinnedChannels.length === 2 ? 'grid-cols-1 lg:grid-cols-2' :
                    pinnedChannels.length <= 4 ? 'grid-cols-1 md:grid-cols-2' :
                    'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  }`}>
                    {pinnedChannels.map((channel) => (
                      <div key={`${channel.channel_name}-${refreshKey}`} className="relative group bg-black rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-1 ring-slate-800">
                        <VideoPlayer url={channel.stream_url_https} showControls={true} />
                        
                        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex justify-between items-start opacity-100 group-hover:opacity-100 transition-opacity z-10">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-white bg-[#0070C0] px-3 py-1 rounded shadow-lg border border-white/10">
                              {channel.channel_name}
                            </span>
                            <div className="mt-1.5 flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-[#87A238] animate-pulse"></div>
                               <span className="text-[8px] text-white/60 font-mono uppercase tracking-widest">{channel.multicast_ip}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => unpinChannel(channel.channel_name)}
                            className="bg-red-600/20 text-white p-2 rounded-xl backdrop-blur-md shadow-lg hover:bg-red-600 transition-colors border border-white/10"
                            title="Decommission Stream"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>

                        <div className="absolute bottom-4 left-4 flex gap-4 text-[9px] font-bold text-white/40 group-hover:text-white/80 transition-colors uppercase tracking-[0.2em] z-10">
                          <span>NODE: {channel.headend_id}</span>
                          <span>LATENCY: SYNCHRONIZED</span>
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
      
      <footer className="py-12 bg-white border-t border-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-6">
           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-4">
            &copy; {new Date().getFullYear()} NONIUS &bull; HOSPITALITY TECHNOLOGY &bull; SWEDISH CDN REGISTRY
          </div>
          <p className="text-[9px] text-slate-300 leading-relaxed uppercase tracking-wider">
            Automated Provisioning Node &bull; All endpoints are monitored via HLS.js Probing Logic &bull; Unauthorized stream mirroring is prohibited.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
