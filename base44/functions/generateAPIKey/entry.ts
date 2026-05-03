import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, scopes, facilities, expiresIn } = await req.json();

    if (!name) {
      return Response.json({ error: 'Name is required' }, { status: 400 });
    }

    // Generate a secure API key
    const apiKeyRaw = crypto.randomUUID() + '_' + Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(apiKeyRaw));
    const apiKeyHashed = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    // Calculate expiration if provided (in days)
    let expiresAt = null;
    if (expiresIn) {
      const date = new Date();
      date.setDate(date.getDate() + expiresIn);
      expiresAt = date.toISOString();
    }

    // Create credential record
    const credential = await base44.entities.APICredential.create({
      name,
      api_key: apiKeyHashed,
      organization_id: user.id, // Use user ID as org ID for now
      description: description || '',
      enabled: true,
      scopes: scopes || ['buildings:read', 'zones:read', 'readings:read'],
      facilities: facilities || [],
      expires_at: expiresAt,
    });

    // Return the raw key only once (never stored in plaintext)
    return Response.json({
      success: true,
      credential: {
        id: credential.id,
        name: credential.name,
        api_key: apiKeyRaw, // Only sent once during creation
        scopes: credential.scopes,
        created_at: credential.created_date,
      },
      message: 'Save your API key — it will not be shown again',
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});