export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL', { status: 400 });
  }

  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  try {
    const upstreamResponse = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow'
    });

    // Vi skapar nya headers för att undvika konflikter med 'content-length' 
    // eller 'content-encoding' från källan som kan krocka med Edge-runtimen.
    const responseHeaders = new Headers();
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Content-Type', upstreamResponse.headers.get('content-type') || 'application/vnd.apple.mpegurl');
    
    // Kopiera över Range-support om det finns
    if (upstreamResponse.headers.has('accept-ranges')) {
      responseHeaders.set('accept-ranges', upstreamResponse.headers.get('accept-ranges')!);
    }

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    return new Response(`Proxy error: ${error.message}`, { 
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}