import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Calculator, Save, Trash2, ChevronDown, ChevronUp, Zap, Thermometer, Sun, Wind, Users, Monitor, Building2, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// ------------------------------------------------------------------
// ASHRAE-inspired simplified load estimation
// ------------------------------------------------------------------
function estimateLoads(p) {
  const {
    total_sqft, ceiling_height_ft, climate_zone,
    wall_insulation_rvalue, roof_insulation_rvalue,
    window_u_factor, window_shgc, window_to_wall_ratio,
    primary_solar_exposure,
    occupant_density, lighting_power_density, equipment_power_density,
    infiltration_rate, ventilation_cfm_per_person,
    design_outdoor_temp_cooling, design_outdoor_temp_heating,
    indoor_setpoint_cooling, indoor_setpoint_heating,
    floors = 1,
  } = p;

  const sqft = total_sqft || 1;
  const volume_ft3 = sqft * (ceiling_height_ft || 9);
  const occupants = sqft / (occupant_density || 150);
  const perimeter_ft = 4 * Math.sqrt(sqft / (floors || 1)); // rough perimeter per floor
  const wall_area_ft2 = perimeter_ft * (ceiling_height_ft || 9) * (floors || 1);
  const window_area_ft2 = wall_area_ft2 * (window_to_wall_ratio || 0.3);
  const opaque_wall_area = wall_area_ft2 - window_area_ft2;
  const roof_area_ft2 = sqft / (floors || 1); // only top floor ceiling

  const deltaT_cool = (design_outdoor_temp_cooling || 95) - (indoor_setpoint_cooling || 74);
  const deltaT_heat = (indoor_setpoint_heating || 68) - (design_outdoor_temp_heating || 10);

  // Solar exposure multiplier (south-facing is worst in northern hemisphere)
  const solarMultiplier = {
    South: 1.0, Southwest: 0.95, Southeast: 0.95,
    West: 0.85, East: 0.80,
    North: 0.40, Northwest: 0.50, Northeast: 0.50,
  }[primary_solar_exposure] || 0.75;

  // --- Cooling BTU/hr ---
  const wallConduction_cool = (opaque_wall_area / (wall_insulation_rvalue || 13)) * deltaT_cool;
  const roofConduction_cool = (roof_area_ft2 / (roof_insulation_rvalue || 30)) * (deltaT_cool + 20); // roof gets extra solar
  const windowConduction_cool = window_area_ft2 * (window_u_factor || 0.35) * deltaT_cool;
  const solarGain_cool = window_area_ft2 * (window_shgc || 0.25) * 200 * solarMultiplier; // 200 BTU/hr/ft² peak solar
  const infiltration_cool = volume_ft3 * (infiltration_rate || 0.35) / 60 * 1.1 * deltaT_cool; // sensible
  const ventilation_cool = (ventilation_cfm_per_person || 20) * occupants * 1.1 * deltaT_cool;
  const occupant_cool = occupants * 450; // ~450 BTU/hr sensible per person (office activity)
  const lighting_cool = (lighting_power_density || 1.0) * sqft * 3.412; // W×3.412 = BTU/hr
  const equipment_cool = (equipment_power_density || 1.5) * sqft * 3.412;

  const total_cooling_btu = wallConduction_cool + roofConduction_cool + windowConduction_cool +
    solarGain_cool + infiltration_cool + ventilation_cool + occupant_cool + lighting_cool + equipment_cool;
  const cooling_load_tons = total_cooling_btu / 12000;

  // --- Heating BTU/hr ---
  const wallConduction_heat = (opaque_wall_area / (wall_insulation_rvalue || 13)) * deltaT_heat;
  const roofConduction_heat = (roof_area_ft2 / (roof_insulation_rvalue || 30)) * deltaT_heat;
  const windowConduction_heat = window_area_ft2 * (window_u_factor || 0.35) * deltaT_heat;
  const infiltration_heat = volume_ft3 * (infiltration_rate || 0.35) / 60 * 1.1 * deltaT_heat;
  const ventilation_heat = (ventilation_cfm_per_person || 20) * occupants * 1.1 * deltaT_heat;
  const total_heating_btu = wallConduction_heat + roofConduction_heat + windowConduction_heat +
    infiltration_heat + ventilation_heat;
  const heating_load_kbtu = total_heating_btu / 1000;

  return {
    cooling_load_tons: Math.round(cooling_load_tons * 10) / 10,
    heating_load_kbtu: Math.round(heating_load_kbtu * 10) / 10,
    cooling_load_breakdown: {
      'Wall Conduction':   Math.round(wallConduction_cool),
      'Roof Conduction':   Math.round(roofConduction_cool),
      'Window Conduction': Math.round(windowConduction_cool),
      'Solar Gain':        Math.round(solarGain_cool),
      'Infiltration':      Math.round(infiltration_cool),
      'Ventilation':       Math.round(ventilation_cool),
      'Occupants':         Math.round(occupant_cool),
      'Lighting':          Math.round(lighting_cool),
      'Equipment':         Math.round(equipment_cool),
    },
    heating_load_breakdown: {
      'Wall Conduction':   Math.round(wallConduction_heat),
      'Roof Conduction':   Math.round(roofConduction_heat),
      'Window Conduction': Math.round(windowConduction_heat),
      'Infiltration':      Math.round(infiltration_heat),
      'Ventilation':       Math.round(ventilation_heat),
    },
  };
}

const CLIMATE_ZONES = [
  { value: '1A', label: '1A – Very Hot Humid (Miami)' },
  { value: '2A', label: '2A – Hot Humid (Houston)' },
  { value: '2B', label: '2B – Hot Dry (Phoenix)' },
  { value: '3A', label: '3A – Warm Humid (Atlanta)' },
  { value: '3B', label: '3B – Warm Dry (Las Vegas)' },
  { value: '3C', label: '3C – Warm Marine (San Francisco)' },
  { value: '4A', label: '4A – Mixed Humid (Baltimore)' },
  { value: '4B', label: '4B – Mixed Dry (Albuquerque)' },
  { value: '4C', label: '4C – Mixed Marine (Seattle)' },
  { value: '5A', label: '5A – Cool Humid (Chicago)' },
  { value: '5B', label: '5B – Cool Dry (Denver)' },
  { value: '6A', label: '6A – Cold Humid (Minneapolis)' },
  { value: '6B', label: '6B – Cold Dry (Helena)' },
  { value: '7',  label: '7 – Very Cold (Fairbanks)' },
];

const SOLAR_DIRECTIONS = ['North','Northeast','East','Southeast','South','Southwest','West','Northwest'];

const DEFAULTS = {
  name: 'New Estimate',
  ceiling_height_ft: 9,
  climate_zone: '3A',
  wall_insulation_rvalue: 13,
  roof_insulation_rvalue: 30,
  window_u_factor: 0.35,
  window_shgc: 0.25,
  window_to_wall_ratio: 0.30,
  primary_solar_exposure: 'South',
  occupant_density: 150,
  lighting_power_density: 1.0,
  equipment_power_density: 1.5,
  infiltration_rate: 0.35,
  ventilation_cfm_per_person: 20,
  design_outdoor_temp_cooling: 95,
  design_outdoor_temp_heating: 10,
  indoor_setpoint_cooling: 74,
  indoor_setpoint_heating: 68,
};

function NumberField({ label, hint, value, onChange, min, max, step = 0.1, unit }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}{unit && <span className="text-muted-foreground/60 ml-1">({unit})</span>}</Label>
      {hint && <p className="text-xs text-muted-foreground/60 mb-1">{hint}</p>}
      <Input
        type="number"
        min={min} max={max} step={step}
        value={value ?? ''}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="mt-0.5 h-8 text-sm bg-input border-border text-foreground"
      />
    </div>
  );
}

function BreakdownBar({ data, totalBtu, color }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => {
        const pct = totalBtu > 0 ? Math.round((val / totalBtu) * 100) : 0;
        return (
          <div key={key} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{key}</span>
              <span className="font-mono text-foreground">{(val / 1000).toFixed(1)} kBTU/hr <span className="text-muted-foreground">({pct}%)</span></span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn("h-1.5 rounded-full", color)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function LoadEstimator({ building }) {
  const [estimates, setEstimates] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [params, setParams] = useState({ ...DEFAULTS, total_sqft: building?.total_sqft || 5000, floors: building?.floors || 1 });
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [section, setSection] = useState('envelope'); // envelope | internal | hvac

  const set = (k, v) => setParams(p => ({ ...p, [k]: v }));

  useEffect(() => {
    loadEstimates();
  }, [building?.id]);

  // Live calculation whenever params change
  useEffect(() => {
    const r = estimateLoads(params);
    setResults(r);
  }, [params]);

  const loadEstimates = async () => {
    if (!building?.id) return;
    const list = await base44.entities.BuildingLoad.filter({ building_id: building.id });
    setEstimates(list.sort((a, b) => b.created_date?.localeCompare(a.created_date)));
  };

  const loadEstimate = (est) => {
    setActiveId(est.id);
    const { id, created_date, updated_date, created_by, cooling_load_tons, heating_load_kbtu, cooling_load_breakdown, heating_load_breakdown, ...p } = est;
    setParams(p);
  };

  const saveEstimate = async () => {
    setSaving(true);
    const payload = { ...params, building_id: building.id, ...results };
    if (activeId) {
      await base44.entities.BuildingLoad.update(activeId, payload);
    } else {
      const created = await base44.entities.BuildingLoad.create(payload);
      setActiveId(created.id);
    }
    await loadEstimates();
    setSaving(false);
  };

  const deleteEstimate = async (id) => {
    await base44.entities.BuildingLoad.delete(id);
    if (activeId === id) { setActiveId(null); setParams({ ...DEFAULTS, total_sqft: building?.total_sqft || 5000, floors: building?.floors || 1 }); }
    loadEstimates();
  };

  const newEstimate = () => {
    setActiveId(null);
    setParams({ ...DEFAULTS, total_sqft: building?.total_sqft || 5000, floors: building?.floors || 1 });
  };

  const totalCoolingBtu = results ? Object.values(results.cooling_load_breakdown).reduce((a, b) => a + b, 0) : 0;
  const totalHeatingBtu = results ? Object.values(results.heating_load_breakdown).reduce((a, b) => a + b, 0) : 0;

  const SECTIONS = [
    { id: 'envelope', label: 'Envelope', icon: Building2 },
    { id: 'internal', label: 'Internal Loads', icon: Users },
    { id: 'hvac', label: 'HVAC / Design Temps', icon: Thermometer },
  ];

  return (
    <div className="space-y-4">
      {/* Saved estimates strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={newEstimate}
          className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-colors"
        >
          <Plus className="w-3 h-3" /> New
        </button>
        {estimates.map(est => (
          <div key={est.id} className={cn(
            "flex-shrink-0 flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
            activeId === est.id ? 'bg-primary/15 border-primary/30 text-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'
          )}>
            <span onClick={() => loadEstimate(est)}>{est.name}</span>
            <button onClick={() => deleteEstimate(est.id)} className="text-muted-foreground hover:text-red-400 transition-colors">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* --- Left: Parameters --- */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Design Parameters</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={params.name}
                onChange={e => set('name', e.target.value)}
                className="h-7 text-xs bg-input border-border w-40"
                placeholder="Estimate name…"
              />
              <Button size="sm" onClick={saveEstimate} disabled={saving} className="h-7 text-xs gap-1.5 bg-primary text-primary-foreground">
                <Save className="w-3 h-3" /> {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Section tabs */}
          <div className="flex border-b border-border">
            {SECTIONS.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setSection(s.id)}
                  className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium border-b-2 transition-all",
                    section === s.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}>
                  <Icon className="w-3.5 h-3.5" />{s.label}
                </button>
              );
            })}
          </div>

          <div className="p-4 space-y-4">
            {/* Building basics always shown */}
            <div className="grid grid-cols-3 gap-3">
              <NumberField label="Total Sq Ft" value={params.total_sqft} onChange={v => set('total_sqft', v)} step={100} unit="ft²" />
              <NumberField label="Floors" value={params.floors} onChange={v => set('floors', v)} min={1} step={1} />
              <NumberField label="Ceiling Height" value={params.ceiling_height_ft} onChange={v => set('ceiling_height_ft', v)} min={7} max={30} step={0.5} unit="ft" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Climate Zone (ASHRAE)</Label>
              <Select value={params.climate_zone} onValueChange={v => set('climate_zone', v)}>
                <SelectTrigger className="mt-0.5 h-8 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CLIMATE_ZONES.map(z => <SelectItem key={z.value} value={z.value} className="text-xs">{z.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence mode="wait">
              {section === 'envelope' && (
                <motion.div key="envelope" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Wall Insulation" hint="Higher = better" value={params.wall_insulation_rvalue} onChange={v => set('wall_insulation_rvalue', v)} min={0} max={60} step={1} unit="R-value" />
                    <NumberField label="Roof Insulation" hint="Higher = better" value={params.roof_insulation_rvalue} onChange={v => set('roof_insulation_rvalue', v)} min={0} max={80} step={1} unit="R-value" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <NumberField label="Window U-Factor" hint="Lower = better" value={params.window_u_factor} onChange={v => set('window_u_factor', v)} min={0.1} max={1.2} step={0.01} unit="BTU/hr·ft²·°F" />
                    <NumberField label="Window SHGC" hint="Solar Heat Gain (0–1)" value={params.window_shgc} onChange={v => set('window_shgc', v)} min={0.1} max={0.9} step={0.01} />
                    <NumberField label="Window/Wall Ratio" hint="Fraction of wall that is glass" value={params.window_to_wall_ratio} onChange={v => set('window_to_wall_ratio', v)} min={0.05} max={0.95} step={0.01} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-amber-400" /> Primary Solar Exposure</Label>
                    <p className="text-xs text-muted-foreground/60 mb-1">Facade direction receiving the most sunlight</p>
                    <div className="grid grid-cols-4 gap-1.5 mt-1">
                      {SOLAR_DIRECTIONS.map(d => (
                        <button key={d} onClick={() => set('primary_solar_exposure', d)}
                          className={cn("py-1.5 text-xs rounded-lg border font-medium transition-all",
                            params.primary_solar_exposure === d
                              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              : 'border-border text-muted-foreground hover:text-foreground'
                          )}>
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                  <NumberField label="Infiltration Rate" hint="Tighter construction = lower ACH" value={params.infiltration_rate} onChange={v => set('infiltration_rate', v)} min={0.1} max={2.0} step={0.05} unit="ACH" />
                </motion.div>
              )}

              {section === 'internal' && (
                <motion.div key="internal" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Occupant Density" hint="Sq ft per person" value={params.occupant_density} onChange={v => set('occupant_density', v)} min={50} max={1000} step={10} unit="ft²/person" />
                    <NumberField label="Ventilation" value={params.ventilation_cfm_per_person} onChange={v => set('ventilation_cfm_per_person', v)} min={5} max={60} step={1} unit="CFM/person" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Lighting Power Density" hint="Typical office: 1.0 W/ft²" value={params.lighting_power_density} onChange={v => set('lighting_power_density', v)} min={0.1} max={5.0} step={0.1} unit="W/ft²" />
                    <NumberField label="Equipment / Plug Loads" hint="Dense office: 2–3 W/ft²" value={params.equipment_power_density} onChange={v => set('equipment_power_density', v)} min={0.1} max={8.0} step={0.1} unit="W/ft²" />
                  </div>
                </motion.div>
              )}

              {section === 'hvac' && (
                <motion.div key="hvac" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                  <p className="text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-3 py-2">
                    Design temperatures represent the peak outdoor conditions used to size HVAC equipment. Use local ASHRAE 99% design data.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Outdoor Design Temp – Cooling" value={params.design_outdoor_temp_cooling} onChange={v => set('design_outdoor_temp_cooling', v)} min={80} max={120} step={1} unit="°F" />
                    <NumberField label="Outdoor Design Temp – Heating" value={params.design_outdoor_temp_heating} onChange={v => set('design_outdoor_temp_heating', v)} min={-30} max={50} step={1} unit="°F" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <NumberField label="Indoor Setpoint – Cooling" value={params.indoor_setpoint_cooling} onChange={v => set('indoor_setpoint_cooling', v)} min={68} max={80} step={1} unit="°F" />
                    <NumberField label="Indoor Setpoint – Heating" value={params.indoor_setpoint_heating} onChange={v => set('indoor_setpoint_heating', v)} min={60} max={75} step={1} unit="°F" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* --- Right: Results --- */}
        <div className="lg:col-span-2 space-y-4">
          {results && (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-blue-500/25 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-blue-400">{results.cooling_load_tons}</div>
                  <div className="text-xs text-muted-foreground mt-1">Tons Cooling</div>
                  <div className="text-xs text-blue-400/70 mt-1 font-mono">{(results.cooling_load_tons * 12).toFixed(0)} kBTU/hr</div>
                </div>
                <div className="bg-card border border-orange-500/25 rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold font-mono text-orange-400">{results.heating_load_kbtu}</div>
                  <div className="text-xs text-muted-foreground mt-1">kBTU/hr Heating</div>
                  <div className="text-xs text-orange-400/70 mt-1 font-mono">{(results.heating_load_kbtu * 1000 / 3412).toFixed(1)} kW equiv.</div>
                </div>
              </div>

              {/* Rule-of-thumb benchmarks */}
              <div className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Benchmarks</div>
                {[
                  { label: 'Cooling Intensity', value: ((results.cooling_load_tons * 12000) / (params.total_sqft || 1)).toFixed(1), unit: 'BTU/hr·ft²', good: v => v < 30, warn: v => v < 50 },
                  { label: 'Heating Intensity', value: ((results.heating_load_kbtu * 1000) / (params.total_sqft || 1)).toFixed(1), unit: 'BTU/hr·ft²', good: v => v < 25, warn: v => v < 45 },
                  { label: 'Sq Ft per Ton', value: Math.round((params.total_sqft || 1) / (results.cooling_load_tons || 1)), unit: 'ft²/ton', good: v => v > 300, warn: v => v > 200 },
                ].map(item => {
                  const val = parseFloat(item.value);
                  const isGood = item.good(val);
                  const isWarn = !isGood && item.warn(val);
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className={cn("text-xs font-mono font-semibold",
                        isGood ? 'text-emerald-400' : isWarn ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {item.value} <span className="font-normal text-muted-foreground">{item.unit}</span>
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Load breakdown accordion */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowBreakdown(v => !v)}
                  className="w-full px-4 py-3 flex items-center justify-between text-sm font-semibold text-foreground hover:bg-muted/20 transition-colors"
                >
                  Load Breakdown
                  {showBreakdown ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {showBreakdown && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-5">
                        <div>
                          <div className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-1"><Wind className="w-3 h-3" /> Cooling Breakdown</div>
                          <BreakdownBar data={results.cooling_load_breakdown} totalBtu={totalCoolingBtu} color="bg-blue-500/60" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-orange-400 mb-2 flex items-center gap-1"><Thermometer className="w-3 h-3" /> Heating Breakdown</div>
                          <BreakdownBar data={results.heating_load_breakdown} totalBtu={totalHeatingBtu} color="bg-orange-500/60" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                Estimates use simplified ASHRAE-based heat transfer calculations. Results are for early-stage sizing only — engage a licensed mechanical engineer for final equipment selection.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}