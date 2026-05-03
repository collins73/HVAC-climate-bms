import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { image_url, image_base64 } = await req.json();

  const prompt = `You are an expert architectural analyst. Analyze this building floor plan image and extract structured data.

IMPORTANT RULES:
1. Every zone must have a UNIQUE name. If multiple rooms are the same type (e.g. 3 conference rooms), number them: "Conference Room 1", "Conference Room 2", etc.
2. For each zone, estimate its CENTER POSITION as x_pct (0-100, left to right) and y_pct (0-100, top to bottom) as a percentage of the total image dimensions.
3. Be thorough — identify every distinct room or area visible.
4. sensor_type should be one of: "Temperature", "Humidity", "CO2", "Thermostat", "Air Quality", "Other"
5. Assign a primary sensor_type per zone based on its function: Server Room → "Temperature", Conference Room → "CO2", Office → "CO2", Lobby → "Air Quality", Other → "Temperature"

Return a JSON object with:
- building_name: string (infer from any labels or use "Imported Building")
- total_sqft: number (estimate total floor area in sq ft)
- floors: number (number of floors shown, default 1)
- address: string (if visible, else "")
- zones: array of objects, each with:
  - name: string (unique room/zone name as labeled, numbered if duplicates)
  - zone_type: one of ["Office","Lobby","Server Room","Conference Room","Warehouse","Retail","Residential","Other"]
  - sqft: number (estimated sq ft for this zone)
  - floor: number (which floor, default 1)
  - notes: string (any relevant notes)
  - x_pct: number (center X position 0-100 as % of image width)
  - y_pct: number (center Y position 0-100 as % of image height)
  - sensor_type: string (primary sensor type for this zone)`;

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
              notes: { type: 'string' },
              x_pct: { type: 'number' },
              y_pct: { type: 'number' },
              sensor_type: { type: 'string' }
            }
          }
        }
      }
    }
  });

  return Response.json(result);
});