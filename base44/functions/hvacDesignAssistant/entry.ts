import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { mode, ...params } = body;

    const modePrompts = {
      equipment_selector: `You are a senior HVAC engineer. Given these building parameters, recommend HVAC equipment.
Building: ${params.sqft} sqft, ${params.zone_count} zones, climate zone ${params.climate_zone}, ${params.building_type} building.
${params.cooling_load_btu ? `Known cooling load: ${params.cooling_load_btu} BTU/hr.` : 'Estimate the cooling load.'}

Provide a JSON response with:
- primary_system: { name, type, capacity, efficiency_rating, description, estimated_cost_range }
- alternative_systems: array of { name, type, capacity, pros, cons }
- accessories: array of { name, description, recommended }
- annual_energy_cost_estimate: number (USD)
- sizing_notes: string`,

      energy_predictor: `You are an energy analyst specializing in HVAC systems. Predict energy use for this building.
Building: ${params.sqft} sqft in ${params.city}, ${params.state}.
Current system: ${params.system_type}. Utility rate: $${params.utility_rate}/kWh.

Provide a JSON response with:
- annual_kwh: number
- monthly_breakdown: array of 12 objects { month, kwh, cost_usd } (Jan–Dec)
- savings_opportunities: array of { measure, annual_savings_usd, payback_years, description }
- carbon_footprint_tons_co2: number
- peak_demand_kw: number
- efficiency_rating: string (e.g. "Below Average", "Average", "Good")`,

      commercial_design: `You are a licensed mechanical engineer. Design an HVAC system for this commercial building.
Building: ${params.building_name}, ${params.sqft} sqft, ${params.floors} floors in ${params.city}, ${params.state}.
Zones: ${JSON.stringify(params.zones)}.

Provide a JSON response with:
- system_summary: string (200 words describing the overall design approach)
- equipment_schedule: array of { tag, description, capacity, qty, notes }
- controls_sequence: array of string (each being one control sequence item)
- total_cooling_tons: number
- total_heating_kbtu: number
- design_notes: string`,

      residential_design: `You are a residential HVAC specialist. Design a system for this home.
Home: ${params.sqft} sqft, ${params.bedrooms} bedrooms, ${params.floors} floors in ${params.city}, ${params.state}.
Existing system: ${params.has_existing ? 'Yes (replacement)' : 'No (new construction)'}.

Provide a JSON response with:
- recommended_system: { name, type, capacity_tons, seer_rating, description }
- equipment_list: array of { item, model_example, qty, notes }
- manual_j_summary: { cooling_load_btuh, heating_load_btuh, design_cfm, notes }
- annual_energy_cost: number
- energy_savings_vs_baseline: string
- installation_notes: string`,

      load_calc: `You are an ASHRAE-certified load calculation engineer. Perform a detailed load calculation.
Building: ${params.building_name}, ${params.sqft} sqft in ${params.city}, ${params.state}.
Zones: ${JSON.stringify(params.zones)}.

Provide a JSON response with:
- total_cooling_tons: number
- total_heating_kw: number
- total_cfm: number
- zone_breakdown: array of { zone_name, sqft, zone_type, cooling_tons, heating_kw, cfm }
- ashrae_compliance: array of { standard, description, status } (status: "Pass" or "Review")
- summary_notes: string`,
    };

    const prompt = modePrompts[mode];
    if (!prompt) return Response.json({ error: 'Invalid mode' }, { status: 400 });

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: { type: 'object' },
      model: 'claude_sonnet_4_6',
    });

    return Response.json({ result, mode });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});