import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingDown, Loader2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HVACPanelShell, { ResultSection, FormField, inputCls, selectCls, exportText } from './HVACPanelShell';
import BuildingImporter from './BuildingImporter';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const SYSTEM_TYPES = ['Central Air (Split)', 'Packaged RTU', 'Chilled Water', 'VRF/VRV', 'Heat Pump', 'Mini-Split', 'Boiler + FCU', 'Other'];

export default function EnergyPredictorPanel({ onClose }) {
  const [form, setForm] = useState({ sqft: '', city: '', state: '', system_type: 'Central Air (Split)', utility_rate: '0.13' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    const res = await base44.functions.invoke('hvacDesignAssistant', { mode: 'energy_predictor', ...form });
    setResult(res.data.result);
    setLoading(false);
  };

  const handleExport = () => {
    if (!result) return;
    const lines = [
      `Annual kWh: ${result.annual_kwh?.toLocaleString()}`,
      `Peak Demand: ${result.peak_demand_kw} kW`,
      `Carbon Footprint: ${result.carbon_footprint_tons_co2} tons CO2/yr`,
      `Efficiency Rating: ${result.efficiency_rating}`,
      '',
      'Monthly Breakdown:',
      ...(result.monthly_breakdown || []).map(m => `  ${m.month}: ${m.kwh} kWh — $${m.cost_usd}`),
      '',
      'Savings Opportunities:',
      ...(result.savings_opportunities || []).map(s => `  - ${s.measure}: $${s.annual_savings_usd}/yr (${s.payback_years} yr payback) — ${s.description}`),
    ];
    exportText('Energy_Predictor_Report', lines.join('\n'));
  };

  const ratingColors = { 'Below Average': '#ef4444', 'Average': '#f59e0b', 'Good': '#10b981', 'Excellent': '#06b6d4' };

  return (
    <HVACPanelShell title="Energy Predictor" icon={TrendingDown} accentColor="violet" onClose={onClose}>
      <div className="max-w-4xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Building Information</h3>
            <BuildingImporter accentColor="violet" onImport={(building) => {
              setForm(f => ({ ...f, sqft: building.total_sqft || '', city: building.city || '', state: building.state || '' }));
            }} />
          </div>
          <FormField label="Square Footage *">
            <input className={inputCls} type="number" placeholder="e.g. 15000" value={form.sqft} onChange={e => set('sqft', e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="City *">
              <input className={inputCls} placeholder="New York" value={form.city} onChange={e => set('city', e.target.value)} />
            </FormField>
            <FormField label="State *">
              <input className={inputCls} placeholder="NY" value={form.state} maxLength={2} onChange={e => set('state', e.target.value)} />
            </FormField>
          </div>
          <FormField label="Current System Type">
            <select className={selectCls} value={form.system_type} onChange={e => set('system_type', e.target.value)}>
              {SYSTEM_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </FormField>
          <FormField label="Utility Rate ($/kWh)">
            <input className={inputCls} type="number" step="0.01" placeholder="0.13" value={form.utility_rate} onChange={e => set('utility_rate', e.target.value)} />
          </FormField>
          <Button onClick={handleSubmit} disabled={loading || !form.sqft || !form.city} className="w-full bg-violet-500 hover:bg-violet-400 text-white font-semibold">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Predicting…</> : 'Generate Energy Prediction'}
          </Button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
              <p className="text-sm">Calculating energy profile…</p>
            </div>
          )}
          {result && !loading && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Prediction Results</h3>
                <Button size="sm" variant="outline" onClick={handleExport} className="border-slate-700 text-slate-300 hover:text-white gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Export
                </Button>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Annual kWh', value: result.annual_kwh?.toLocaleString() },
                  { label: 'Peak Demand', value: `${result.peak_demand_kw} kW` },
                  { label: 'CO₂/year', value: `${result.carbon_footprint_tons_co2} tons` },
                  { label: 'Rating', value: result.efficiency_rating, color: ratingColors[result.efficiency_rating] },
                ].map(s => (
                  <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                    <div className="text-xs text-slate-500">{s.label}</div>
                    <div className="text-sm font-bold mt-0.5" style={{ color: s.color || '#fff' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Monthly chart */}
              {result.monthly_breakdown?.length > 0 && (
                <ResultSection title="Monthly Energy Cost">
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={result.monthly_breakdown} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={v => v?.slice(0, 3)} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 6, fontSize: 12 }}
                        formatter={(v, n) => [n === 'cost_usd' ? `$${v}` : `${v} kWh`, n === 'cost_usd' ? 'Cost' : 'kWh']}
                      />
                      <Bar dataKey="cost_usd" fill="#7c3aed" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ResultSection>
              )}

              {/* Savings table */}
              {result.savings_opportunities?.length > 0 && (
                <ResultSection title="Savings Opportunities">
                  <div className="space-y-2">
                    {result.savings_opportunities.map((s, i) => (
                      <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-slate-800 last:border-0">
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-white">{s.measure}</div>
                          <div className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.description}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xs font-bold text-emerald-400">${s.annual_savings_usd?.toLocaleString()}/yr</div>
                          <div className="text-xs text-slate-500">{s.payback_years} yr payback</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ResultSection>
              )}
            </>
          )}
        </div>
      </div>
    </HVACPanelShell>
  );
}