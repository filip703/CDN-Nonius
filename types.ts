
export type Status = 'found' | 'not_found' | 'idle' | 'loading' | 'error';

export interface ChannelResponse {
  channel_name: string;
  multicast_ip: string;
  headend_id: string;
  stream_url_https: string;
  stream_url_local: string | null;
  status: 'found' | 'not_found';
  message?: string;
}

export interface QueryRecord {
  id: string;
  query: string;
  timestamp: number;
  response: ChannelResponse | null;
  error?: string;
}
