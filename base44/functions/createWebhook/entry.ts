import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { url, event, secret } = await req.json();
    
    if (!url || !event) {
      return Response.json({ error: 'URL and event are required' }, { status: 400 });
    }

    const webhook = {
      id: `wh_${Math.random().toString(36).substring(7)}`,
      url,
      event,
      secret: secret || Math.random().toString(36).substring(7),
      created_date: new Date().toISOString(),
      created_by: user.email,
    };

    // In production, store webhook in database
    return Response.json({ webhook });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});