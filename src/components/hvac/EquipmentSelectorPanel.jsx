import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wrench, Loader2, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HVACPanelShell, { ResultSection, FormField, inputCls, selectCls, exportText } from './HVACPanelShell';
import BuildingImporter from './BuildingImporter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const CLIMATE_ZONES = ['1A','2A','2B','3A','3B','3C','4A','4B','4C','5A','5B','6A','6B','7'];

export default function EquipmentSelectorPanel({ onClose }) {
  const [form, setForm] = useState({ sqft: '', zone_count: '', climate_zone: '3A', building_type: 'commercial', cooling_load_btu: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('hvacDesignAssistant', { mode: 'equipment_selector', ...form });
    setResult(res.data.result);
    setLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `Primary System: ${result.primary_system?.name}`,
      `Type: ${result.primary_system?.type}`,
      `Capacity: ${result.primary_system?.capacity}`,
      `Efficiency: ${result.primary_system?.efficiency_rating}`,
      `Cost Range: ${result.primary_system?.estimated_cost_range}`,
      `Annual Energy Cost: $${result.annual_energy_cost_estimate?.toLocaleString()}`,
      '',
      'Alternative Systems:',
      ...(result.alternative_systems || []).map(s => `  - ${s.name}: ${s.capacity}`),
      '',
      'Accessories:',
      ...(result.accessories || []).map(a => `  - ${a.name}: ${a.description}`),
      '',
      `Sizing Notes: ${result.sizing_notes}`,
    ];
    exportText('Equipment_Selector_Report', lines.join('\n'));
  };

  return (
    <HVACPanelShell title="Equipment Selector" icon={Wrench} accentColor="cyan" onClose={onClose}>
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Building Parameters</h3>
            <BuildingImporter accentColor="cyan" onImport={(building, zones) => {
              setForm(f => ({ ...f, sqft: building.total_sqft || '', zone_count: zones.length || f.zone_count }));
            }} />
          </div>
          <FormField label="Building Square Footage *">
            <input className={inputCls} type="number" placeholder="e.g. 25000" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
          </FormField>
          <FormField label="Number of Zones *">
            <input className={inputCls} type="number" placeholder="e.g. 8" value={form.zone_count} onChange={e => set('zone_count', e.target.value)} />
          </FormField>
          <FormField label="ASHRAE Climate Zone">
            <select className={selectCls} value={form.climate_zone} onChange={e => set('climate_zone', e.target.value)}>
              {CLIMATE_ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </FormField>
          <FormField label="Building Type">
            <select className={selectCls} value={form.building_type} onChange={e => set('building_type', e.target.value)}>
              <option value="commercial">Commercial</option>
              <option value="residential">Residential</option>
            </select>
          </FormField>
          <FormField label="Known Cooling Load BTU/hr (optional)">
            <input className={inputCls} type="number" placeholder="Leave blank to estimate" value={form.cooling_load_btu} onChange={e => set('cooling_load_btu', e.target.value)} />
          </FormField>
          <Button onClick={handleSubmit} disabled={loading || !form.sqft || !form.zone_count} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Analyzing…</> : 'Generate Equipment Recommendation'}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm">AI is analyzing building parameters…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Results</h3>
                <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 hover:text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
              </div>

              {/* Primary System */}
              <ResultSection title="Primary System">
                <div className="space-y-1.5">
                  <div className="text-base font-bold text-cyan-400">{result.primary_system?.name}</div>
                  <div className="text-xs text-slate-400">{result.primary_system?.type} · {result.primary_system?.capacity}</div>
                  <div className="text-xs text-slate-300 mt-2 leading-relaxed">{result.primary_system?.description}</div>
                  <div className="flex gap-4 mt-3">
                    <div className="text-xs"><span className="text-slate-500">Efficiency:</span> <span className="text-white font-mono">{result.primary_system?.efficiency_rating}</span></div>
                    <div className="text-xs"><span className="text-slate-500">Cost:</span> <span className="text-white font-mono">{result.primary_system?.estimated_cost_range}</span></div>
                  </div>
                  {result.annual_energy_cost_estimate && (
                    <div className="mt-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-cyan-400 font-semibold">
                      Est. Annual Energy Cost: ${result.annual_energy_cost_estimate?.toLocaleString()}
                    </div>
                  )}
                </div>
              </ResultSection>

              {/* Alternatives */}
              {result.alternative_systems?.length > 0 && (
                <ResultSection title="Alternative Systems">
                  <div className="space-y-2">
                    {result.alternative_systems.map((s, i) => (
                      <div key={i} className="border border-slate-700 rounded-lg p-3">
                        <div className="text-sm font-medium text-white">{s.name} <span className="text-xs text-slate-400">{s.capacity}</span></div>
                        <div className="flex gap-4 mt-1.5 text-xs">
                          <div className="text-emerald-400">✓ {s.pros}</div>
                          <div className="text-red-400">✗ {s.cons}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {/* Accessories */}
              {result.accessories?.length > 0 && (
                <ResultSection title="Accessories & Add-ons">
                  <div className="space-y-1.5">
                    {result.accessories.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {a.recommended ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />}
                        <span className="text-slate-300"><span className="text-white font-medium">{a.name}:</span> {a.description}</span>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.sizing_notes && (
                <ResultSection title="Sizing Notes">
                  <p className="text-xs text-slate-300 leading-relaxed">{result.sizing_notes}</p>
                </ResultSection>
              )}
            </>
          )}
        </div>
      </div>
    </HVACPanelShell>
  );
}