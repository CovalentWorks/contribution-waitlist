export default async () => {
 const origin = process.env.SITE_URL;
 const secret = process.env.WORKER_SECRET;
 if (!origin || !secret) throw new Error('Worker configuration missing');
 const response = await fetch(`${origin}/api/worker`, { method: 'POST', headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(50000) });
 if (!response.ok) throw new Error(`Email worker failed: ${response.status}`);
 return new Response(null, { status: 204 });
};
