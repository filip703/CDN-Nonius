export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const urlObj = new URL(req.url);
  const targetUrl = urlObj.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { 
      status: 400,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }

  // Handle preflight OPTIONS calls
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': 'Range, Content-Type, Accept, Origin, X-Requested-With, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    const rangeHeader = req.headers.get('range');
    
    // Some streams require specific headers to not 403
    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...(rangeHeader ? { 'Range': rangeHeader } : {}),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
      redirect: 'follow',
    });

    // Final URL after any redirects
    const finalUrl = upstreamResponse.url;
    const baseUrl = new URL(finalUrl);

    const contentType = upstreamResponse.headers.get('content-type')?.toLowerCase() || '';
    
    // More inclusive manifest check
    const isManifest = 
      contentType.includes('mpegurl') || 
      contentType.includes('application/x-mpegurl') || 
      contentType.includes('application/vnd.apple.mpegurl') ||
      contentType.includes('text/plain') || // Some misconfigured servers
      targetUrl.includes('.m3u8') ||
      finalUrl.includes('.m3u8');

    const responseHeaders = new Headers();
    
    // Copy relevant headers
    const headersToPreserve = ['content-type', 'cache-control', 'accept-ranges', 'content-range', 'expires', 'last-modified', 'etag'];
    headersToPreserve.forEach(h => {
      const val = upstreamResponse.headers.get(h);
      if (val) responseHeaders.set(h, val);
    });

    // Enforce CORS for the browser
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

    if (isManifest && upstreamResponse.ok) {
      const text = await upstreamResponse.text();
      // Use current origin and path for proxying
      const proxyBase = `${urlObj.origin}${urlObj.pathname}?url=`;

      const lines = text.split(/\r?\n/);
      const rewrittenManifest = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        // Tags that might contain URIs
        if (trimmed.startsWith('#')) {
          // Handle common tags with URI attributes
          // EXT-X-KEY, EXT-X-MEDIA, EXT-X-MAP, EXT-X-PART-INF, etc.
          return line.replace(/URI="([^"]+)"/g, (match, uri) => {
            try {
              const absoluteUri = new URL(uri, baseUrl).href;
              return `URI="${proxyBase}${encodeURIComponent(absoluteUri)}"`;
            } catch {
              return match;
            }
          });
        }
        
        // This line is a URL for a segment or variant playlist
        try {
          const absoluteUrl = new URL(trimmed, baseUrl).href;
          return `${proxyBase}${encodeURIComponent(absoluteUrl)}`;
        } catch (e) {
          return line;
        }
      }).join('\n');

      // Always clear content-length for modified body
      responseHeaders.delete('content-length');
      
      // Ensure it's treated as a manifest
      if (!responseHeaders.get('content-type')?.includes('mpegurl')) {
        responseHeaders.set('content-type', 'application/vnd.apple.mpegurl');
      }

      return new Response(rewrittenManifest, {
        status: 200,
        headers: responseHeaders,
      });
    }

    // For everything else (video chunks), stream directly
    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });

  } catch (error: any) {
    console.error('HLS Proxy Fatal Error:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Proxy Tunnel Exception', 
      details: error.message 
    }), { 
      status: 502,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      }
    });
  }
}
