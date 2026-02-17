export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // 1. Hantera CORS Preflight direkt
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response('No URL', { status: 400 });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    // Vi tvingar på rätt MIME-typ om det är en manifestfil
    const contentType = targetUrl.endsWith('.m3u8') 
      ? 'application/vnd.apple.mpegurl' 
      : (response.headers.get('content-type') || 'video/MP2T');
    
    headers.set('Content-Type', contentType);

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error: any) {
    // Om vi får 502 här betyder det att Vercel inte når IP-adressen (vilket stämmer för 172.18.x.x)
    return new Response(`Connect Failure: ${error.message}`, { 
      status: 502, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }
}