
import React, { useState } from 'react';
import { ChannelResponse } from '../types';
import VideoPlayer from './VideoPlayer';

interface ChannelCardProps {
  data: ChannelResponse;
  onPin?: (channel: ChannelResponse) => void;
  isPinned?: boolean;
}

const ChannelCard: React.FC<ChannelCardProps> = ({ data, onPin, isPinned }) => {
  const [showLive, setShowLive] = useState(false);

  if (data.status === 'not_found') {
    return (
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg text-red-800 shadow-sm">
        <h3 className="heading text-xl mb-1">Channel Specification Fault</h3>
        <p className="text-sm opacity-80">{data.message || "The requested resource is not in the configuration registry."}</p>
      </div>
    );
  }

  const DetailRow = ({ label, value, mono = false }: { label: string, value: string | null, mono?: boolean }) => (
    <div className="py-2">
      <div className="text-[10px] font-bold text-[#0070C0] uppercase tracking-widest mb-0.5">{label}</div>
      <div className={`text-slate-800 ${mono ? 'font-mono text-xs break-all bg-slate-50 p-1 rounded border border-slate-100' : 'text-sm font-semibold'}`}>
        {value || <span className="text-slate-400 italic font-normal">Unspecified</span>}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xl shadow-slate-200/50 hover:border-[#0070C0]/50 transition-all">
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${showLive ? 'bg-red-500 animate-pulse' : 'bg-[#87A238]'}`}></div>
          <h3 className="heading text-lg text-[#171844] uppercase tracking-tight">
            {data.channel_name}
          </h3>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={() => onPin?.(data)}
            disabled={isPinned}
            className={`text-[10px] px-4 py-1.5 rounded-md font-bold uppercase transition-all border ${
              isPinned 
              ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-white border-[#0070C0] text-[#0070C0] hover:bg-[#0070C0] hover:text-white'
            }`}
          >
            {isPinned ? 'In Wall' : 'Add to Monitoring'}
          </button>
          <button 
            onClick={() => setShowLive(!showLive)}
            className={`text-[10px] px-4 py-1.5 rounded-md font-bold uppercase transition-all ${
              showLive 
              ? 'bg-[#171844] text-white shadow-lg' 
              : 'bg-slate-800 text-white hover:bg-black shadow-md'
            }`}
          >
            {showLive ? 'Terminate Feed' : 'Launch Feed'}
          </button>
        </div>
      </div>

      {showLive && (
        <div className="p-4 bg-black">
          <VideoPlayer url={data.stream_url_https} />
        </div>
      )}

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
        <div className="space-y-4">
          <DetailRow label="IP Multicast" value={data.multicast_ip} mono />
          <DetailRow label="Control Node" value={data.headend_id} />
        </div>
        <div className="space-y-4">
          <DetailRow label="Public HLS Endpoint" value={data.stream_url_https} mono />
          <DetailRow label="Internal Proxy" value={data.stream_url_local} mono />
        </div>
      </div>
      
      <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-[9px] text-slate-400 uppercase flex justify-between font-semibold tracking-widest">
        <span>Provisioning Status: VALIDATED</span>
        <span>Secure Stream Key: ACTIVE</span>
      </div>
    </div>
  );
};

export default ChannelCard;
