
import { ChannelResponse } from './types';

export const RAW_CHANNELS = [
  { name: 'sjuan', ip: '224.168.0.7', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/sjuan.m3u8', local: 'http://se-ott.nonius.tv/sjuan/index.m3u8' },
  { name: 'tv8', ip: '224.168.0.8', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/tv8.m3u8', local: 'http://se-ott.nonius.tv/tv8/index.m3u8' },
  { name: 'tv4', ip: '224.168.0.4', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/tv4.m3u8', local: 'http://se-ott.nonius.tv/tv4/index.m3u8' },
  { name: 'tv10', ip: '224.168.0.10', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/tv10.m3u8', local: 'http://se-ott.nonius.tv/tv10/index.m3u8' },
  { name: 'skynews', ip: '224.168.0.17', head: 'heads5', https: 'https://se-ott.nonius.tv/heads5/skynews.m3u8', local: 'http://se-ott.nonius.tv/skynews/index.m3u8' },
  { name: 'svt2', ip: '224.168.0.2', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/svt2.m3u8', local: 'http://se-ott.nonius.tv/svt2/index.m3u8' },
  { name: 'tv3', ip: '224.168.0.3', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/tv3.m3u8', local: 'http://se-ott.nonius.tv/tv3/index.m3u8' },
  { name: 'svt1', ip: '224.168.0.1', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/svt1.m3u8', local: 'http://se-ott.nonius.tv/svt1/index.m3u8' },
  { name: 'Nickelodeon', ip: '224.168.0.27', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/Nickelodeon.m3u8', local: 'http://se-ott.nonius.tv/Nickelodeon/index.m3u8' },
  { name: 'mtv80', ip: '224.168.0.19', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/mtv80.m3u8', local: 'http://se-ott.nonius.tv/mtv80/index.m3u8' },
  { name: 'kunskaps', ip: '224.168.0.16', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/kunskaps.m3u8', local: 'http://se-ott.nonius.tv/kunskaps/index.m3u8' },
  { name: 'tv12', ip: '224.168.1.12', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/tv12.m3u8', local: 'http://se-ott.nonius.tv/tv12/index.m3u8' },
  { name: 'kanal11', ip: '224.168.1.11', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/kanal11.m3u8', local: 'http://se-ott.nonius.tv/kanal11/index.m3u8' },
  { name: 'kanal9', ip: '224.168.1.9', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/kanal9.m3u8', local: 'http://se-ott.nonius.tv/kanal9/index.m3u8' },
  { name: 'svtbarn', ip: '224.168.0.13', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/svtbarn.m3u8', local: 'http://se-ott.nonius.tv/svtbarn/index.m3u8' },
  { name: 'tv6', ip: '224.168.1.6', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/tv6.m3u8', local: 'http://se-ott.nonius.tv/tv6/index.m3u8' },
  { name: 'kanal5', ip: '224.168.1.5', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/kanal5.m3u8', local: 'http://se-ott.nonius.tv/kanal5/index.m3u8' },
  { name: 'cnni', ip: '224.168.0.20', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/cnni.m3u8', local: 'http://se-ott.nonius.tv/cnni/index.m3u8' },
  { name: 'YLE2', ip: '224.168.0.33', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/YLE2.m3u8', local: 'http://se-ott.nonius.tv/YLE2/index.m3u8' },
  { name: 'nrk2', ip: '224.168.0.29', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/nrk2.m3u8', local: 'http://se-ott.nonius.tv/nrk2/index.m3u8' },
  { name: 'nrk1', ip: '224.168.0.28', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/nrk1.m3u8', local: 'http://se-ott.nonius.tv/nrk1/index.m3u8' },
  { name: 'Viasat_hist', ip: '224.168.0.35', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/Viasat_hist.m3u8', local: 'http://se-ott.nonius.tv/Viasat_hist/index.m3u8' },
  { name: 'Eurosport1', ip: '224.168.0.26', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/Eurosport1.m3u8', local: 'http://se-ott.nonius.tv/Eurosport1/index.m3u8' },
  { name: 'DR1', ip: '224.168.0.30', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/DR1.m3u8', local: 'http://se-ott.nonius.tv/DR1/index.m3u8' },
  { name: 'DW', ip: '224.168.0.25', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/DW.m3u8', local: 'http://se-ott.nonius.tv/DW/index.m3u8' },
  { name: 'DR2', ip: '224.168.0.31', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/DR2.m3u8', local: 'http://se-ott.nonius.tv/DR2/index.m3u8' },
  { name: 'TLC', ip: '224.168.0.34', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/TLC.m3u8', local: 'http://se-ott.nonius.tv/TLC/index.m3u8' },
  { name: 'YLE1', ip: '224.168.0.32', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/YLE1.m3u8', local: 'http://se-ott.nonius.tv/YLE1/index.m3u8' },
  { name: 'bbc', ip: '224.168.0.21', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/bbc.m3u8', local: 'http://se-ott.nonius.tv/bbc/index.m3u8' },
  { name: 'aljazera', ip: '224.168.0.18', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/aljazera.m3u8', local: 'http://se-ott.nonius.tv/aljazera/index.m3u8' },
  { name: 'tv4guld', ip: '224.168.0.5', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/tv4guld.m3u8', local: 'http://se-ott.nonius.tv/tv4guld/index.m3u8' },
  { name: 'mtv00', ip: '224.168.0.22', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/mtv00.m3u8', local: 'http://se-ott.nonius.tv/mtv00/index.m3u8' },
  { name: 'MTV', ip: '224.168.0.36', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/MTV.m3u8', local: 'http://se-ott.nonius.tv/MTV/index.m3u8' },
  { name: 'CNBC', ip: '224.168.0.37', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/CNBC.m3u8', local: 'http://se-ott.nonius.tv/CNBC/index.m3u8' },
  { name: 'Eurosport2', ip: '224.168.0.38', head: 'heads1', https: 'https://se-ott.nonius.tv/heads1/Eurosport2.m3u8', local: 'http://se-ott.nonius.tv/Eurosport2/index.m3u8' },
  { name: 'bbcnordic', ip: '224.168.0.23', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/bbcnordic.m3u8', local: 'http://se-ott.nonius.tv/bbcnordic/index.m3u8' },
  { name: 'viaplaysport', ip: '224.168.19.2', head: 'heads2', https: 'https://se-ott.nonius.tv/heads2/viaplaysport.m3u8', local: null },
  { name: 'bloomberg', ip: '224.168.0.39', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/bloomberg.m3u8', local: null },
  { name: 'tv2', ip: '224.168.0.40', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/tv2.m3u8', local: null },
  { name: 'tv2news', ip: '224.168.0.41', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/tv2news.m3u8', local: null },
  { name: 'vsportgolf', ip: '224.168.0.42', head: 'heads3', https: 'https://se-ott.nonius.tv/heads3/vsportgolf.m3u8', local: null },
  { name: 'drramasjang', ip: '224.168.0.43', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/drramasjang.m3u8', local: null },
  { name: 'natgeod', ip: '224.168.0.44', head: 'heads4', https: 'https://se-ott.nonius.tv/heads4/natgeod.m3u8', local: null },
  { name: 'rlt', ip: '224.168.0.45', head: 'N/A', https: 'https://se-ott.nonius.tv/?/rlt.m3u8?', local: null },
  { name: 'zdf', ip: '224.168.0.46', head: 'N/A', https: 'https://se-ott.nonius.tv/?/zdf.m3u8?', local: null },
  { name: 'ard', ip: '224.168.0.47', head: 'N/A', https: 'https://se-ott.nonius.tv/?/ard.m3u8?', local: null },
];

export const searchChannels = (query: string): ChannelResponse => {
  const q = query.toLowerCase().replace(/\s/g, '');
  const found = RAW_CHANNELS.find(c => 
    c.name.toLowerCase().includes(q) || 
    q.includes(c.name.toLowerCase())
  );

  if (found) {
    return {
      channel_name: found.name,
      multicast_ip: found.ip,
      headend_id: found.head,
      stream_url_https: found.https,
      stream_url_local: found.local,
      status: 'found'
    };
  }

  return {
    channel_name: query,
    multicast_ip: '',
    headend_id: '',
    stream_url_https: '',
    stream_url_local: null,
    status: 'not_found',
    message: 'Channel not configured in CDN.'
  };
};

// System instruction for the Gemini service to act as a CDN Controller.
export const SYSTEM_INSTRUCTION = `You are a Swedish CDN Registry Provisioning Assistant for Nonius.
Your primary task is to resolve user channel queries to technical stream specifications.

AVAILABLE CHANNEL REGISTRY:
${JSON.stringify(RAW_CHANNELS, null, 2)}

OPERATIONAL DIRECTIVES:
1. Map user queries to the 'name' field in the registry (e.g., 'tv 4' matches 'tv4').
2. If found, return the exact technical specifications: channel_name, multicast_ip, headend_id, stream_url_https, and stream_url_local.
3. If NOT found, set status to "not_found" and provide a technical explanation in the 'message' field.
4. ALWAYS return a valid JSON object matching the requested schema.
5. Strictly use the provided registry data and do not fabricate information.`;
