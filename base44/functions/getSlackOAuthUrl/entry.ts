import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const clientId = Deno.env.get('SLACK_CLIENT_ID');
    const redirectUri = Deno.env.get('SLACK_REDIRECT_URI') || 'https://hvac.example.com/oauth/slack/callback';
    
    const oauth_url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write,channels:read&redirect_uri=${redirectUri}`;
    
    return Response.json({ oauth_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});