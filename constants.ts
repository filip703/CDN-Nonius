
import { SourceKey } from './types';

// Global OTT Streams (Served via HTTPS, often needs CORS proxy)
export const GLOBAL_CHANNELS = [
  { name: 'sjuan', ip: '224.168.0.7', head: 'heads3', https: 'https://se-ott.nonius.tv/sjuan/index.m3u8', local: null },
  { name: 'tv8', ip: '224.168.0.8', head: 'heads1', https: 'https://se-ott.nonius.tv/tv8/index.m3u8', local: null },
  { name: 'tv4', ip: '224.168.0.4', head: 'heads1', https: 'https://se-ott.nonius.tv/tv4/index.m3u8', local: null },
  { name: 'tv10', ip: '224.168.0.10', head: 'heads1', https: 'https://se-ott.nonius.tv/tv10/index.m3u8', local: null },
  { name: 'skynews', ip: '224.168.0.17', head: 'heads5', https: 'https://se-ott.nonius.tv/skynews/index.m3u8', local: null },
  { name: 'svt2', ip: '224.168.0.2', head: 'heads3', https: 'https://se-ott.nonius.tv/svt2/index.m3u8', local: null },
  { name: 'tv3', ip: '224.168.0.3', head: 'heads1', https: 'https://se-ott.nonius.tv/tv3/index.m3u8', local: null },
  { name: 'svt1', ip: '224.168.0.1', head: 'heads3', https: 'https://se-ott.nonius.tv/svt1/index.m3u8', local: null },
  { name: 'Nickelodeon', ip: '224.168.0.27', head: 'heads3', https: 'https://se-ott.nonius.tv/Nickelodeon/index.m3u8', local: null },
  { name: 'mtv80', ip: '224.168.0.19', head: 'heads3', https: 'https://se-ott.nonius.tv/mtv80/index.m3u8', local: null },
  { name: 'kunskaps', ip: '224.168.0.16', head: 'heads3', https: 'https://se-ott.nonius.tv/kunskaps/index.m3u8', local: null },
  { name: 'tv12', ip: '224.168.1.12', head: 'heads2', https: 'https://se-ott.nonius.tv/tv12/index.m3u8', local: null },
  { name: 'kanal11', ip: '224.168.1.11', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal11/index.m3u8', local: null },
  { name: 'kanal9', ip: '224.168.1.9', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal9/index.m3u8', local: null },
  { name: 'svtbarn', ip: '224.168.0.13', head: 'heads3', https: 'https://se-ott.nonius.tv/svtbarn/index.m3u8', local: null },
  { name: 'tv6', ip: '224.168.1.6', head: 'heads2', https: 'https://se-ott.nonius.tv/tv6/index.m3u8', local: null },
  { name: 'kanal5', ip: '224.168.1.5', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal5/index.m3u8', local: null },
  { name: 'viaplaysport', ip: '224.168.19.2', head: 'heads2', https: 'https://se-ott.nonius.tv/viaplaysport/index.m3u8', local: null },
];

const STHLM_IP = '172.18.56.5';
const STHLM_CHANNELS_LIST = [
  'sjuan', 'tv8', 'tv4', 'tv10', 'skynews', 'svt2', 'tv3', 'svt1', 'Nickelodeon', 'mtv80', 
  'kunskaps', 'tv12', 'kanal11', 'kanal9', 'svtbarn', 'tv6', 'kanal5', 'cnni', 'YLE2', 
  'nrk2', 'nrk1', 'Viasat_hist', 'Eurosport1', 'DR1', 'DW', 'DR2', 'TLC', 'YLE1', 
  'bbc', 'aljazera', 'tv4guld', 'mtv00', 'MTV', 'CNBC', 'Eurosport2'
];

export const STOCKHOLM_CHANNELS = STHLM_CHANNELS_LIST.map(name => ({
  name, ip: STHLM_IP, head: 'sthlm-edge', https: `http://${STHLM_IP}/${name}/index.m3u8`, local: `http://${STHLM_IP}/${name}/index.m3u8`
}));

const MAIA_HQ_IP = '10.20.30.253';
const MAIA_HQ_LIST = [
  'sjuan', 'tv8', 'tv4', 'tv10', 'skynews', 'svt2', 'tv3', 'svt1', 'Nickelodeon', 'mtv80', 
  'kunskaps', 'tv12', 'kanal11', 'kanal9', 'svtbarn', 'tv6', 'kanal5', 'cnni', 'YLE2', 
  'nrk2', 'nrk1', 'Viasat_hist', 'Eurosport1', 'DR1', 'DW', 'DR2', 'TLC', 'YLE1', 
  'bbc', 'aljazera', 'tv4guld', 'mtv00', 'MTV', 'CNBC', 'Eurosport2', 'bbcnordic', 'viaplaysport'
];

export const PORTO_HQ_CHANNELS = MAIA_HQ_LIST.map(name => ({
  name, ip: MAIA_HQ_IP, head: 'maia-hq', https: `http://${MAIA_HQ_IP}/${name}/index.m3u8`, local: `http://${MAIA_HQ_IP}/${name}/index.m3u8`
}));

const MAIA_NOC_IP = '10.0.30.40';
const MAIA_NOC_LIST = [
  'sjuan', 'tv8', 'tv4', 'skynews', 'svt2', 'svt1', 'kunskaps', 'tv12', 'kanal9', 
  'svtbarn', 'kanal5', 'YLE1', 'bbc', 'mtv00', 'bbcnordic', 'viaplaysport'
];

export const PORTO_NOC_CHANNELS = MAIA_NOC_LIST.map(name => ({
  name, ip: MAIA_NOC_IP, head: 'maia-noc', https: `http://${MAIA_NOC_IP}/${name}/index.m3u8`, local: `http://${MAIA_NOC_IP}/${name}/index.m3u8`
}));

export const RAW_CHANNELS = [
  ...GLOBAL_CHANNELS.map(c => ({ ...c, source: 'global' as SourceKey })),
  ...STOCKHOLM_CHANNELS.map(c => ({ ...c, source: 'sthlm-edge' as SourceKey })),
  ...PORTO_HQ_CHANNELS.map(c => ({ ...c, source: 'porto-hq' as SourceKey })),
  ...PORTO_NOC_CHANNELS.map(c => ({ ...c, source: 'porto-noc' as SourceKey })),
];

export const SYSTEM_INSTRUCTION = `You are a Nonius CDN Provisioning Bot.
Resolve TV channel configuration from the available registries.
SOURCES: Global, Stockholm EDGE (172.18.56.5), Porto HQ Maia (10.20.30.253), Porto Maia NOC (10.0.30.40).`;
