
import { SourceKey } from './types';

export const GLOBAL_CHANNELS = [
  { name: 'sjuan', ip: '224.168.0.7', head: 'heads3', https: 'https://se-ott.nonius.tv/sjuan/index.m3u8', local: 'http://se-ott.nonius.tv/sjuan/index.m3u8' },
  { name: 'tv8', ip: '224.168.0.8', head: 'heads1', https: 'https://se-ott.nonius.tv/tv8/index.m3u8', local: 'http://se-ott.nonius.tv/tv8/index.m3u8' },
  { name: 'tv4', ip: '224.168.0.4', head: 'heads1', https: 'https://se-ott.nonius.tv/tv4/index.m3u8', local: 'http://se-ott.nonius.tv/tv4/index.m3u8' },
  { name: 'tv10', ip: '224.168.0.10', head: 'heads1', https: 'https://se-ott.nonius.tv/tv10/index.m3u8', local: 'http://se-ott.nonius.tv/tv10/index.m3u8' },
  { name: 'skynews', ip: '224.168.0.17', head: 'heads5', https: 'https://se-ott.nonius.tv/skynews/index.m3u8', local: 'http://se-ott.nonius.tv/skynews/index.m3u8' },
  { name: 'svt2', ip: '224.168.0.2', head: 'heads3', https: 'https://se-ott.nonius.tv/svt2/index.m3u8', local: 'http://se-ott.nonius.tv/svt2/index.m3u8' },
  { name: 'tv3', ip: '224.168.0.3', head: 'heads1', https: 'https://se-ott.nonius.tv/tv3/index.m3u8', local: 'http://se-ott.nonius.tv/tv3/index.m3u8' },
  { name: 'svt1', ip: '224.168.0.1', head: 'heads3', https: 'https://se-ott.nonius.tv/svt1/index.m3u8', local: 'http://se-ott.nonius.tv/svt1/index.m3u8' },
  { name: 'Nickelodeon', ip: '224.168.0.27', head: 'heads3', https: 'https://se-ott.nonius.tv/Nickelodeon/index.m3u8', local: 'http://se-ott.nonius.tv/Nickelodeon/index.m3u8' },
  { name: 'mtv80', ip: '224.168.0.19', head: 'heads3', https: 'https://se-ott.nonius.tv/mtv80/index.m3u8', local: 'http://se-ott.nonius.tv/mtv80/index.m3u8' },
  { name: 'kunskaps', ip: '224.168.0.16', head: 'heads3', https: 'https://se-ott.nonius.tv/kunskaps/index.m3u8', local: 'http://se-ott.nonius.tv/kunskaps/index.m3u8' },
  { name: 'tv12', ip: '224.168.1.12', head: 'heads2', https: 'https://se-ott.nonius.tv/tv12/index.m3u8', local: 'http://se-ott.nonius.tv/tv12/index.m3u8' },
  { name: 'kanal11', ip: '224.168.1.11', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal11/index.m3u8', local: 'http://se-ott.nonius.tv/kanal11/index.m3u8' },
  { name: 'kanal9', ip: '224.168.1.9', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal9/index.m3u8', local: 'http://se-ott.nonius.tv/kanal9/index.m3u8' },
  { name: 'svtbarn', ip: '224.168.0.13', head: 'heads3', https: 'https://se-ott.nonius.tv/svtbarn/index.m3u8', local: 'http://se-ott.nonius.tv/svtbarn/index.m3u8' },
  { name: 'tv6', ip: '224.168.1.6', head: 'heads2', https: 'https://se-ott.nonius.tv/tv6/index.m3u8', local: 'http://se-ott.nonius.tv/tv6/index.m3u8' },
  { name: 'kanal5', ip: '224.168.1.5', head: 'heads2', https: 'https://se-ott.nonius.tv/kanal5/index.m3u8', local: 'http://se-ott.nonius.tv/kanal5/index.m3u8' },
  { name: 'viaplaysport', ip: '224.168.19.2', head: 'heads2', https: 'https://se-ott.nonius.tv/viaplaysport/index.m3u8', local: null },
];

export const STOCKHOLM_CHANNELS = [
  { name: 'sjuan', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/sjuan/index.m3u8', local: 'http://172.18.56.5/sjuan/index.m3u8' },
  { name: 'tv8', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/tv8/index.m3u8', local: 'http://172.18.56.5/tv8/index.m3u8' },
  { name: 'tv4', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/tv4/index.m3u8', local: 'http://172.18.56.5/tv4/index.m3u8' },
  { name: 'skynews', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/skynews/index.m3u8', local: 'http://172.18.56.5/skynews/index.m3u8' },
  { name: 'svt1', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/svt1/index.m3u8', local: 'http://172.18.56.5/svt1/index.m3u8' },
  { name: 'viaplaysport', ip: '172.18.56.5', head: 'sthlm-edge', https: 'http://172.18.56.5/viaplaysport/index.m3u8', local: 'http://172.18.56.5/viaplaysport/index.m3u8' },
];

export const PORTO_HQ_CHANNELS = [
  { name: 'sjuan', ip: '10.20.30.253', head: 'maia-hq', https: 'http://10.20.30.253/sjuan/index.m3u8', local: 'http://10.20.30.253/sjuan/index.m3u8' },
  { name: 'tv8', ip: '10.20.30.253', head: 'maia-hq', https: 'http://10.20.30.253/tv8/index.m3u8', local: 'http://10.20.30.253/tv8/index.m3u8' },
  { name: 'tv4', ip: '10.20.30.253', head: 'maia-hq', https: 'http://10.20.30.253/tv4/index.m3u8', local: 'http://10.20.30.253/tv4/index.m3u8' },
  { name: 'svt1', ip: '10.20.30.253', head: 'maia-hq', https: 'http://10.20.30.253/svt1/index.m3u8', local: 'http://10.20.30.253/svt1/index.m3u8' },
  { name: 'viaplaysport', ip: '10.20.30.253', head: 'maia-hq', https: 'http://10.20.30.253/viaplaysport/index.m3u8', local: 'http://10.20.30.253/viaplaysport/index.m3u8' },
];

export const PORTO_NOC_CHANNELS = [
  { name: 'sjuan', ip: '10.0.30.40', head: 'maia-noc', https: 'http://10.0.30.40/sjuan/index.m3u8', local: 'http://10.0.30.40/sjuan/index.m3u8' },
  { name: 'tv8', ip: '10.0.30.40', head: 'maia-noc', https: 'http://10.0.30.40/tv8/index.m3u8', local: 'http://10.0.30.40/tv8/index.m3u8' },
  { name: 'tv4', ip: '10.0.30.40', head: 'maia-noc', https: 'http://10.0.30.40/tv4/index.m3u8', local: 'http://10.0.30.40/tv4/index.m3u8' },
  { name: 'svt1', ip: '10.0.30.40', head: 'maia-noc', https: 'http://10.0.30.40/svt1/index.m3u8', local: 'http://10.0.30.40/svt1/index.m3u8' },
  { name: 'viaplaysport', ip: '10.0.30.40', head: 'maia-noc', https: 'http://10.0.30.40/viaplaysport/index.m3u8', local: 'http://10.0.30.40/viaplaysport/index.m3u8' },
];

export const RAW_CHANNELS = [
  ...GLOBAL_CHANNELS.map(c => ({ ...c, source: 'global' as SourceKey })),
  ...STOCKHOLM_CHANNELS.map(c => ({ ...c, source: 'sthlm-edge' as SourceKey })),
  ...PORTO_HQ_CHANNELS.map(c => ({ ...c, source: 'porto-hq' as SourceKey })),
  ...PORTO_NOC_CHANNELS.map(c => ({ ...c, source: 'porto-noc' as SourceKey })),
];

export const SYSTEM_INSTRUCTION = `You are a Nonius CDN Provisioning Bot.
Map user queries to the registry. Return JSON matching ChannelResponse.
If query is vague, suggest the nearest match.`;
