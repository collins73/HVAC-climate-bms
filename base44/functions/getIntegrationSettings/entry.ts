import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Return integration settings for the user
    const settings = {
      slack: {
        enabled: false,
        workspace: null,
        channel: null,
      },
    };
    return Response.json(settings);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});