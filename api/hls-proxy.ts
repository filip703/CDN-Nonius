
export const config = {
  runtime: 'edge',
};

/**
 * Production-grade HLS Proxy for Vercel Edge
 * Handles CORS bypass, header preservation, and byte-range requests for segments.
 */
export default async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  // 1. Diagnostics: Perform a quick check on the upstream
  // This helps identify if the link is broken (404), protected (403), or if it's a signed URL.
  try {
    const diagnosticResponse = await fetch(targetUrl, { 
      method: 'HEAD',
      signal: AbortSignal.timeout(3000) // 3s timeout for diagnostics
    }).catch(e => ({ status: 0, ok: false, statusText: e.message }));

    if (diagnosticResponse.status === 404) {
      console.warn(`[HLS Proxy] 404 Not Found: ${targetUrl}`);
    } else if (diagnosticResponse.status === 403) {
      console.warn(`[HLS Proxy] 403 Forbidden - Check if tokens/cookies are required: ${targetUrl}`);
    } else if (diagnosticResponse.status === 0) {
      console.error(`[HLS Proxy] Upstream Timeout/Network Error: ${targetUrl}`);
    }
  } catch (diagError) {
    // Silently continue to main fetch if diagnostic fails
  }

  try {
    const rangeHeader = req.headers.get('range');
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15s total request timeout

    const upstreamResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        ...(rangeHeader ? { 'Range': rangeHeader } : {}),
        'User-Agent': 'Nonius-CDN-Proxy/4.0 (Vercel Edge)',
        'Accept': '*/*',
      },
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    // Prepare response headers
    const responseHeaders = new Headers();
    
    // 2. Preserve streaming-critical headers
    const headersToPreserve = [
      'content-type',
      'cache-control',
      'accept-ranges',
      'content-length',
      'content-range',
      'date',
      'last-modified',
      'etag'
    ];

    headersToPreserve.forEach(header => {
      const value = upstreamResponse.headers.get(header);
      if (value) responseHeaders.set(header, value);
    });

    // 3. Inject CORS and Range-Support headers
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range, Content-Type, Accept');
    responseHeaders.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Date');

    // Handle M3U8 Rewriting (Optional but recommended for nested playlists/relative segments)
    // If we want segments to also go through proxy automatically, we could rewrite the body.
    // However, the prompt asks to update the player. HLS.js handles relative URLs based on the manifest URL.
    
    let body: BodyInit | null = upstreamResponse.body;
    
    // For M3U8, we might need to inspect the body for "token" or "redirect" patterns
    const contentType = upstreamResponse.headers.get('content-type') || '';
    if (contentType.includes('application/vnd.apple.mpegurl') || contentType.includes('application/x-mpegurl')) {
       // Future: Implement manifest rewriting here if absolute URLs in manifest bypass the proxy.
    }

    return new Response(body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });

  } catch (error: any) {
    const isTimeout = error.name === 'AbortError';
    console.error(`[HLS Proxy] Error: ${isTimeout ? 'Request Timed Out' : error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: isTimeout ? 'Upstream Timeout' : 'Internal Proxy Error', 
        details: error.message 
      }), 
      { 
        status: isTimeout ? 504 : 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    );
  }
}
