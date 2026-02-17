
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const urlObj = new URL(req.url);
  const targetUrl = urlObj.searchParams.get('url');

  if (!targetUrl) {
    return new Response('Missing URL parameter', { status: 400 });
  }

  // Standard CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  try {
    // Vi skickar med Range om det finns (viktigt för vissa spelare)
    const range = req.headers.get('range');
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        ...(range ? { 'Range': range } : {}),
      },
      redirect: 'follow'
    });

    const newHeaders = new Headers(response.headers);
    
    // Tvinga CORS så webbläsaren blir nöjd
    newHeaders.set('Access-Control-Allow-Origin', '*');
    newHeaders.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    newHeaders.set('Access-Control-Expose-Headers', '*');

    // Returnera rå-datat direkt utan att röra innehållet
    return new Response(response.body, {
      status: response.status,
      headers: newHeaders,
    });
  } catch (e: any) {
    return new Response(`Proxy Error: ${e.message}`, { status: 500 });
  }
}
