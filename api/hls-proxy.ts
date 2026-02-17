export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const targetUrl = new URL(req.url).searchParams.get('url');

  if (!targetUrl) {
    return new Response('No URL provided', { status: 400 });
  }

  try {
    const res = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      redirect: 'follow'
    });
    
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Content-Type', res.headers.get('Content-Type') || 'application/vnd.apple.mpegurl');

    return new Response(res.body, {
      status: res.status,
      headers
    });
  } catch (err: any) {
    // Om detta ger 502 för interna IP-adresser (172.x) beror det på att Vercel inte kan nå dem.
    // Testa de "Globala" kanalerna för att verifiera att proxyn fungerar.
    return new Response('Proxy Connection Failed', { 
      status: 502,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}