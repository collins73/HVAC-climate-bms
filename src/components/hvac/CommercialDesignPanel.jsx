import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Building2, Loader2, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HVACPanelShell, { ResultSection, FormField, inputCls, selectCls, exportText } from './HVACPanelShell';
import BuildingImporter from './BuildingImporter';

const ZONE_TYPES = ['Office', 'Conference Room', 'Lobby', 'Server Room', 'Warehouse', 'Retail', 'Restroom', 'Storage', 'Other'];

export default function CommercialDesignPanel({ onClose }) {
  const [form, setForm] = useState({ building_name: '', sqft: '', floors: '', city: '', state: '' });
  const [zones, setZones] = useState([{ name: '', sqft: '', zone_type: 'Office' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addZone = () => setZones(z => [...z, { name: '', sqft: '', zone_type: 'Office' }]);
  const removeZone = (i) => setZones(z => z.filter((_, idx) => idx !== i));
  const setZone = (i, k, v) => setZones(z => z.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('hvacDesignAssistant', { mode: 'commercial_design', ...form, zones });
    setResult(res.data.result);
    setLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `Building: ${form.building_name}`,
      `Total Cooling: ${result.total_cooling_tons} tons`,
      `Total Heating: ${result.total_heating_kbtu} kBTU/hr`,
      '',
      'System Summary:',
      result.system_summary,
      '',
      'Equipment Schedule:',
      ...(result.equipment_schedule || []).map(e => `  ${e.tag} | ${e.description} | ${e.capacity} | Qty: ${e.qty} | ${e.notes}`),
      '',
      'Controls Sequence:',
      ...(result.controls_sequence || []).map((c, i) => `  ${i + 1}. ${c}`),
      '',
      `Design Notes: ${result.design_notes}`,
    ];
    exportText('Commercial_Design_Report', lines.join('\n'));
  };

  return (
    <HVACPanelShell title="Commercial Design" icon={Building2} accentColor="amber" onClose={onClose}>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Building Information</h3>
            <BuildingImporter accentColor="amber" onImport={(building, zones) => {
              setForm({ building_name: building.name, sqft: building.total_sqft || '', floors: building.floors || '', city: building.city || '', state: building.state || '' });
              if (zones.length > 0) setZones(zones.map(z => ({ name: z.name, sqft: z.sqft || '', zone_type: z.zone_type || 'Office' })));
            }} />
          </div>
          <FormField label="Building Name *">
            <input className={inputCls} placeholder="e.g. Oakwood Office Complex" value={form.building_name} onChange={e => set('building_name', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Total Sqft *">
              <input className={inputCls} type="number" placeholder="50000" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
            </FormField>
            <FormField label="Floors *">
              <input className={inputCls} type="number" placeholder="4" value={form.floors} onChange={e => set('floors', e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City *">
              <input className={inputCls} placeholder="Chicago" value={form.city} onChange={e => set('city', e.target.value)} />
            </FormField>
            <FormField label="State *">
              <input className={inputCls} placeholder="IL" maxLength={2} value={form.state} onChange={e => set('state', e.target.value)} />
            </FormField>
          </div>

          {/* Zone table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-slate-400 font-medium">Zones</label>
              <button onClick={addZone} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                <Plus className="w-3 h-3" /> Add Zone
              </button>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {zones.map((z, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={inputCls + ' flex-1'} placeholder="Zone name" value={z.name} onChange={e => setZone(i, 'name', e.target.value)} />
                  <input className={inputCls + ' w-20'} type="number" placeholder="Sqft" value={z.sqft} onChange={e => setZone(i, 'sqft', e.target.value)} />
                  <select className={selectCls + ' w-28'} value={z.zone_type} onChange={e => setZone(i, 'zone_type', e.target.value)}>
                    {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {zones.length > 1 && (
                    <button onClick={() => removeZone(i)} className="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !form.building_name || !form.sqft} className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Designing…</> : 'Generate Commercial Design'}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <p className="text-sm">Generating commercial HVAC design…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Design Results</h3>
                <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 hover:text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Total Cooling</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">{result.total_cooling_tons} tons</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                  <div className="text-xs text-slate-500">Total Heating</div>
                  <div className="text-lg font-bold text-orange-400 font-mono">{result.total_heating_kbtu} kBTU/hr</div>
                </div>
              </div>

              <ResultSection title="System Summary">
                <p className="text-xs text-slate-300 leading-relaxed">{result.system_summary}</p>
              </ResultSection>

              {result.equipment_schedule?.length > 0 && (
                <ResultSection title="Equipment Schedule">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {['Tag', 'Description', 'Capacity', 'Qty'].map(h => (
                            <th key={h} className="text-left py-1.5 pr-3 text-slate-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {result.equipment_schedule.map((e, i) => (
                          <tr key={i}>
                            <td className="py-1.5 pr-3 text-cyan-400 font-mono font-semibold">{e.tag}</td>
                            <td className="py-1.5 pr-3 text-white">{e.description}</td>
                            <td className="py-1.5 pr-3 text-slate-300 font-mono">{e.capacity}</td>
                            <td className="py-1.5 text-slate-300">{e.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResultSection>
              )}

              {result.controls_sequence?.length > 0 && (
                <ResultSection title="Controls Sequence">
                  <ol className="space-y-1.5">
                    {result.controls_sequence.map((c, i) => (
                      <li key={i} className="flex gap-2 text-xs text-slate-300">
                        <span className="text-amber-400 font-mono font-bold flex-shrink-0">{i + 1}.</span>
                        {c}
                      </li>
                    ))}
                  </ol>
                </ResultSection>
              )}
            </>
          )}
        </div>
      </div>
    </HVACPanelShell>
  );
}