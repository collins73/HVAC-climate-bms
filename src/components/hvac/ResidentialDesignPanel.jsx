import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Home, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HVACPanelShell, { ResultSection, FormField, inputCls, selectCls, exportText } from './HVACPanelShell';

export default function ResidentialDesignPanel({ onClose }) {
  const [form, setForm] = useState({ sqft: '', bedrooms: '', floors: '1', city: '', state: '', has_existing: false });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('hvacDesignAssistant', { mode: 'residential_design', ...form });
    setResult(res.data.result);
    setLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `Recommended System: ${result.recommended_system?.name}`,
      `Type: ${result.recommended_system?.type}`,
      `Capacity: ${result.recommended_system?.capacity_tons} tons`,
      `SEER: ${result.recommended_system?.seer_rating}`,
      `Annual Energy Cost: $${result.annual_energy_cost}`,
      `Energy Savings: ${result.energy_savings_vs_baseline}`,
      '',
      'Manual J Summary:',
      `  Cooling: ${result.manual_j_summary?.cooling_load_btuh} BTU/hr`,
      `  Heating: ${result.manual_j_summary?.heating_load_btuh} BTU/hr`,
      `  CFM: ${result.manual_j_summary?.design_cfm}`,
      '',
      'Equipment List:',
      ...(result.equipment_list || []).map(e => `  - ${e.item} (${e.model_example}) x${e.qty}: ${e.notes}`),
      '',
      `Installation Notes: ${result.installation_notes}`,
    ];
    exportText('Residential_Design_Report', lines.join('\n'));
  };

  return (
    <HVACPanelShell title="Residential Design" icon={Home} accentColor="emerald" onClose={onClose}>
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white">Home Details</h3>
          <FormField label="Home Square Footage *">
            <input className={inputCls} type="number" placeholder="2400" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Bedrooms *">
              <input className={inputCls} type="number" placeholder="3" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
            </FormField>
            <FormField label="Floors">
              <select className={selectCls} value={form.floors} onChange={e => set('floors', e.target.value)}>
                {['1','2','3'].map(f => <option key={f} value={f}>{f} floor{f > 1 ? 's' : ''}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City *">
              <input className={inputCls} placeholder="Austin" value={form.city} onChange={e => set('city', e.target.value)} />
            </FormField>
            <FormField label="State *">
              <input className={inputCls} placeholder="TX" maxLength={2} value={form.state} onChange={e => set('state', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Existing System?">
            <div className="flex gap-3 mt-1">
              {[{ label: 'No (New Construction)', v: false }, { label: 'Yes (Replacement)', v: true }].map(opt => (
                <button key={String(opt.v)} onClick={() => set('has_existing', opt.v)}
                  className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${form.has_existing === opt.v ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'border-slate-700 text-slate-400 hover:text-white'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </FormField>
          <Button onClick={handleSubmit} disabled={loading || !form.sqft || !form.bedrooms || !form.city} className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Designing…</> : 'Generate Residential Design'}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              <p className="text-sm">Generating residential HVAC design…</p>
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

              <ResultSection title="Recommended System">
                <div className="text-base font-bold text-emerald-400">{result.recommended_system?.name}</div>
                <div className="text-xs text-slate-400 mt-1">{result.recommended_system?.type} · {result.recommended_system?.capacity_tons} tons · SEER {result.recommended_system?.seer_rating}</div>
                <div className="text-xs text-slate-300 mt-2 leading-relaxed">{result.recommended_system?.description}</div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-slate-800 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500">Annual Cost</div>
                    <div className="text-sm font-bold text-white">${result.annual_energy_cost?.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-2.5">
                    <div className="text-xs text-slate-500">Savings vs Baseline</div>
                    <div className="text-sm font-bold text-emerald-400">{result.energy_savings_vs_baseline}</div>
                  </div>
                </div>
              </ResultSection>

              {result.manual_j_summary && (
                <ResultSection title="Manual J Summary">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Cooling', value: `${result.manual_j_summary.cooling_load_btuh?.toLocaleString()} BTU/hr` },
                      { label: 'Heating', value: `${result.manual_j_summary.heating_load_btuh?.toLocaleString()} BTU/hr` },
                      { label: 'Design CFM', value: result.manual_j_summary.design_cfm?.toLocaleString() },
                    ].map(s => (
                      <div key={s.label} className="bg-slate-800 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500">{s.label}</div>
                        <div className="text-xs font-bold text-white mt-0.5">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  {result.manual_j_summary.notes && <p className="text-xs text-slate-400 mt-2">{result.manual_j_summary.notes}</p>}
                </ResultSection>
              )}

              {result.equipment_list?.length > 0 && (
                <ResultSection title="Equipment List">
                  <div className="space-y-2">
                    {result.equipment_list.map((e, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">{e.qty}</span>
                        <div>
                          <span className="text-white font-medium">{e.item}</span>
                          {e.model_example && <span className="text-slate-400"> ({e.model_example})</span>}
                          {e.notes && <span className="text-slate-500"> — {e.notes}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}

              {result.installation_notes && (
                <ResultSection title="Installation Notes">
                  <p className="text-xs text-slate-300 leading-relaxed">{result.installation_notes}</p>
                </ResultSection>
              )}
            </>
          )}
        </div>
      </div>
    </HVACPanelShell>
  );
}