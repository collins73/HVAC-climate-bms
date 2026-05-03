import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// List webhooks
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // For now, return mock webhook data
    const webhooks = [
      {
        id: 'wh_1',
        url: 'https://example.com/webhooks/alerts',
        event: 'alert.created',
        secret: 'secret_1234567890',
        created_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return Response.json({ webhooks });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});