import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { image_url, image_base64 } = await req.json();

  const prompt = `You are an expert architectural analyst. Analyze this building floor plan image and extract structured data.

Return a JSON object with:
- building_name: string (infer from any labels or use "Imported Building")
- total_sqft: number (estimate total floor area)
- floors: number (number of floors shown, default 1)
- address: string (if visible, else "")
- zones: array of objects, each with:
  - name: string (room/zone name as labeled)
  - zone_type: one of ["Office","Lobby","Server Room","Conference Room","Warehouse","Retail","Residential","Other"]
  - sqft: number (estimated sq ft for this zone)
  - floor: number (which floor, default 1)
  - notes: string (any relevant notes)

Be thorough — identify every distinct room or area visible.`;

  const fileInput = image_url || image_base64;
  const result = await base44.integrations.Core.InvokeLLM({
    prompt,
    file_urls: [fileInput],
    response_json_schema: {
      type: 'object',
      properties: {
        building_name: { type: 'string' },
        total_sqft: { type: 'number' },
        floors: { type: 'number' },
        address: { type: 'string' },
        zones: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              zone_type: { type: 'string' },
              sqft: { type: 'number' },
              floor: { type: 'number' },
              notes: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json(result);
});