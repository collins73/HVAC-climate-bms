import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { api_key, scope } = await req.json();

    if (!api_key) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }

    // Hash the provided key to compare
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(api_key));
    const apiKeyHashed = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Find credential by hashed key
    const credentials = await base44.asServiceRole.entities.APICredential.filter({
      api_key: apiKeyHashed,
      enabled: true,
    });

    if (!credentials || credentials.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const credential = credentials[0];

    // Check if expired
    if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
      return Response.json({ error: 'API key expired' }, { status: 401 });
    }

    // Check scope if specified
    if (scope && !credential.scopes.includes(scope)) {
      return Response.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Update last_used timestamp
    await base44.asServiceRole.entities.APICredential.update(credential.id, {
      last_used: new Date().toISOString(),
    });

    return Response.json({
      valid: true,
      credential_id: credential.id,
      organization_id: credential.organization_id,
      scopes: credential.scopes,
      facilities: credential.facilities,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});