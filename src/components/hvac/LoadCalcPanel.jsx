import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cpu, Loader2, Download, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HVACPanelShell, { ResultSection, FormField, inputCls, selectCls, exportText } from './HVACPanelShell';

const ZONE_TYPES = ['Office', 'Conference Room', 'Lobby', 'Server Room', 'Warehouse', 'Retail', 'Restroom', 'Storage', 'Other'];

export default function LoadCalcPanel({ onClose }) {
  const [form, setForm] = useState({ building_name: '', sqft: '', city: '', state: '' });
  const [zones, setZones] = useState([{ name: '', sqft: '', zone_type: 'Office' }]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addZone = () => setZones(z => [...z, { name: '', sqft: '', zone_type: 'Office' }]);
  const removeZone = (i) => setZones(z => z.filter((_, idx) => idx !== i));
  const setZone = (i, k, v) => setZones(z => z.map((item, idx) => idx === i ? { ...item, [k]: v } : item));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('hvacDesignAssistant', { mode: 'load_calc', ...form, zones });
    setResult(res.data.result);
    setLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `Building: ${form.building_name}`,
      `Total Cooling: ${result.total_cooling_tons} tons`,
      `Total Heating: ${result.total_heating_kw} kW`,
      `Total CFM: ${result.total_cfm}`,
      '',
      'Zone Breakdown:',
      ...(result.zone_breakdown || []).map(z => `  ${z.zone_name} (${z.sqft} sqft, ${z.zone_type}): ${z.cooling_tons} tons | ${z.heating_kw} kW | ${z.cfm} CFM`),
      '',
      'ASHRAE Compliance:',
      ...(result.ashrae_compliance || []).map(c => `  [${c.status}] ${c.standard}: ${c.description}`),
      '',
      `Notes: ${result.summary_notes}`,
    ];
    exportText('Load_Calculation_Report', lines.join('\n'));
  };

  return (
    <HVACPanelShell title="AI Load Calculation" icon={Cpu} accentColor="cyan" onClose={onClose}>
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Building Parameters</h3>
          <FormField label="Building Name *">
            <input className={inputCls} placeholder="e.g. Riverside Tech Center" value={form.building_name} onChange={e => set('building_name', e.target.value)} />
          </FormField>
          <FormField label="Total Sqft *">
            <input className={inputCls} type="number" placeholder="30000" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City *">
              <input className={inputCls} placeholder="Denver" value={form.city} onChange={e => set('city', e.target.value)} />
            </FormField>
            <FormField label="State *">
              <input className={inputCls} placeholder="CO" maxLength={2} value={form.state} onChange={e => set('state', e.target.value)} />
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
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {zones.map((z, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input className={inputCls + ' flex-1'} placeholder="Zone name" value={z.name} onChange={e => setZone(i, 'name', e.target.value)} />
                  <input className={inputCls + ' w-20'} type="number" placeholder="Sqft" value={z.sqft} onChange={e => setZone(i, 'sqft', e.target.value)} />
                  <select className={selectCls + ' w-28'} value={z.zone_type} onChange={e => setZone(i, 'zone_type', e.target.value)}>
                    {ZONE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {zones.length > 1 && (
                    <button onClick={() => removeZone(i)} className="text-slate-500 hover:text-red-400 flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button onClick={handleSubmit} disabled={loading || !form.building_name || !form.sqft} className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Calculating…</> : 'Run Load Calculation'}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
              <p className="text-sm">Running ASHRAE load calculations…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Calculation Results</h3>
                <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 hover:text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Cooling', value: `${result.total_cooling_tons} tons`, color: 'text-cyan-400' },
                  { label: 'Heating', value: `${result.total_heating_kw} kW`, color: 'text-orange-400' },
                  { label: 'Total CFM', value: result.total_cfm?.toLocaleString(), color: 'text-violet-400' },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-500 mb-1">{s.label}</div>
                    <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Zone breakdown */}
              {result.zone_breakdown?.length > 0 && (
                <ResultSection title="Zone Breakdown">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {['Zone', 'Sqft', 'Cooling', 'Heating', 'CFM'].map(h => (
                            <th key={h} className="text-left py-1.5 pr-3 text-slate-500 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {result.zone_breakdown.map((z, i) => (
                          <tr key={i}>
                            <td className="py-1.5 pr-3 text-white font-medium">{z.zone_name}</td>
                            <td className="py-1.5 pr-3 text-slate-400 font-mono">{z.sqft?.toLocaleString()}</td>
                            <td className="py-1.5 pr-3 text-cyan-400 font-mono">{z.cooling_tons}t</td>
                            <td className="py-1.5 pr-3 text-orange-400 font-mono">{z.heating_kw}kW</td>
                            <td className="py-1.5 text-violet-400 font-mono">{z.cfm}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ResultSection>
              )}

              {/* ASHRAE compliance */}
              {result.ashrae_compliance?.length > 0 && (
                <ResultSection title="ASHRAE Compliance">
                  <div className="space-y-2">
                    {result.ashrae_compliance.map((c, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        {c.status === 'Pass'
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          : <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />}
                        <div>
                          <span className="text-xs font-semibold text-white">{c.standard} </span>
                          <span className="text-xs text-slate-400">{c.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.summary_notes && (
                <ResultSection title="Engineer Notes">
                  <p className="text-xs text-slate-300 leading-relaxed">{result.summary_notes}</p>
                </ResultSection>
              )}
            </>
          )}
        </div>
      </div>
    </HVACPanelShell>
  );
}