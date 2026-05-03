import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Verify API key and get organization context
async function verifyAndGetContext(base44, apiKey) {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(apiKey));
  const apiKeyHashed = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const credentials = await base44.asServiceRole.entities.APICredential.filter({
    api_key: apiKeyHashed,
    enabled: true,
  });

  if (!credentials || credentials.length === 0) {
    return { error: 'Invalid API key', status: 401 };
  }

  const credential = credentials[0];

  if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
    return { error: 'API key expired', status: 401 };
  }

  return {
    valid: true,
    organization_id: credential.organization_id,
    scopes: credential.scopes,
    facilities: credential.facilities,
    credential_id: credential.id,
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const url = new URL(req.url);
    const path = url.pathname;
    const apiKey = url.searchParams.get('api_key');

    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }

    // Verify API key
    const auth = await verifyAndGetContext(base44, apiKey);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    // Route requests
    if (path === '/api/v1/facilities' && req.method === 'GET') {
      // Get buildings/facilities
      const buildings = await base44.asServiceRole.entities.Building.list('-updated_date', 100);
      const filtered = auth.facilities.length > 0 
        ? buildings.filter(b => auth.facilities.includes(b.id))
        : buildings.filter(b => b.created_by === auth.organization_id || !b.created_by); // Filter by org

      return Response.json({
        success: true,
        count: filtered.length,
        data: filtered.map(b => ({
          id: b.id,
          name: b.name,
          address: b.address,
          city: b.city,
          state: b.state,
          zip: b.zip,
          status: b.status,
          floors: b.floors,
          total_sqft: b.total_sqft,
          created_date: b.created_date,
        })),
      });
    }

    if (path.match(/^\/api\/v1\/facilities\/[^\/]+$/) && req.method === 'GET') {
      // Get specific facility with zones
      const facilityId = path.split('/').pop();
      
      if (auth.facilities.length > 0 && !auth.facilities.includes(facilityId)) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }

      const building = await base44.asServiceRole.entities.Building.filter({ id: facilityId });
      if (!building || building.length === 0) {
        return Response.json({ error: 'Facility not found' }, { status: 404 });
      }

      const zones = await base44.asServiceRole.entities.Zone.filter({ building_id: facilityId });

      return Response.json({
        success: true,
        facility: building[0],
        zones: zones.map(z => ({
          id: z.id,
          name: z.name,
          floor: z.floor,
          zone_type: z.zone_type,
          sqft: z.sqft,
          status: z.status,
          occupancy_status: z.occupancy_status,
          occupancy_count: z.occupancy_count,
        })),
      });
    }

    if (path.match(/^\/api\/v1\/zones\/[^\/]+\/readings$/) && req.method === 'GET') {
      // Get zone readings
      const zoneId = path.split('/')[4];
      const limit = parseInt(url.searchParams.get('limit') || '100');

      const readings = await base44.asServiceRole.entities.EnvironmentReading.filter(
        { zone_id: zoneId },
        '-timestamp',
        limit
      );

      return Response.json({
        success: true,
        count: readings.length,
        data: readings.map(r => ({
          timestamp: r.timestamp,
          temperature: r.temperature,
          humidity: r.humidity,
          co2_ppm: r.co2_ppm,
          air_quality_index: r.air_quality_index,
          source: r.source,
        })),
      });
    }

    if (path === '/api/v1/health' && req.method === 'GET') {
      // Health check
      return Response.json({ status: 'ok', authenticated: true });
    }

    return Response.json({ error: 'Endpoint not found' }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});