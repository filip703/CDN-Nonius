
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { searchParams, origin } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  // Hantera preflight OPTIONS anrop
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, Accept',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const rangeHeader = req.headers.get('range');
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...(rangeHeader ? { 'Range': rangeHeader } : {}),
        'User-Agent': 'Nonius-CDN-Proxy/5.0',
        'Accept': '*/*',
      },
    });

    const contentType = upstreamResponse.headers.get('content-type') || '';
    const isManifest = contentType.includes('mpegurl') || targetUrl.endsWith('.m3u8');

    const responseHeaders = new Headers();
    const headersToPreserve = ['content-type', 'cache-control', 'accept-ranges', 'content-length', 'content-range'];
    headersToPreserve.forEach(h => {
      const val = upstreamResponse.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

    if (isManifest) {
      // MANIFEST REWRITING LOGIC
      // Vi måste skriva om innehållet i .m3u8 filen så att alla länkar går via denna proxy
      const text = await upstreamResponse.text();
      const baseUrl = new URL(targetUrl);
      const proxyBase = `${origin}/api/hls-proxy?url=`;

      const rewrittenManifest = text.split('\n').map(line => {
        const trimmed = line.trim();
        // Ignonera kommentarer/tags som inte är länkar
        if (!trimmed || trimmed.startsWith('#')) {
          // Specialfall: Vissa tags innehåller URI="...", de måste också skrivas om
          if (trimmed.includes('URI="')) {
            return line.replace(/URI="([^"]+)"/g, (match, uri) => {
              const absoluteUri = new URL(uri, baseUrl).href;
              return `URI="${proxyBase}${encodeURIComponent(absoluteUri)}"`;
            });
          }
          return line;
        }
        
        // Gör länkarna absoluta och tunnla dem via proxyn
        try {
          const absoluteUrl = new URL(trimmed, baseUrl).href;
          return `${proxyBase}${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return line;
        }
      }).join('\n');

      return new Response(rewrittenManifest, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // För binära segment (.ts, .m4s), strömma direkt
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: 'Proxy Failed', details: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
