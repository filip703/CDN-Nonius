
export type Status = 'found' | 'not_found' | 'idle' | 'loading' | 'error';
export type SourceKey = 'global' | 'sthlm-edge' | 'porto-hq' | 'porto-noc';

export interface ChannelResponse {
  channel_name: string;
  multicast_ip: string;
  headend_id: string;
  stream_url_https: string;
  stream_url_local: string | null;
  status: 'found' | 'not_found';
  message?: string;
  source?: SourceKey;
}

export interface QueryRecord {
  id: string;
  query: string;
  timestamp: number;
  response: ChannelResponse | null;
  error?: string;
}
