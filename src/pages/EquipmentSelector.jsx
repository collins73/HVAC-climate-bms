import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Wrench, Loader2, Sparkles, ChevronLeft, Building2, Home, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import ReactMarkdown from 'react-markdown';

const CLIMATE_ZONES = ['1A','2A','2B','3A','3B','3C','4A','4B','4C','5A','5B','6A','6B','7'];

const DEFAULTS = {
  commercial: { sqft: 10000, floors: 3, ceiling: 12, occupants: 60, ventilation: 20, lighting: 1.2, equipment: 2.0, wwr: 0.35 },
  residential: { sqft: 2200, floors: 2, ceiling: 9, occupants: 4, ventilation: 7.5, lighting: 0.5, equipment: 0.5, wwr: 0.18 },
};

export default function EquipmentSelector() {
  const urlType = new URLSearchParams(window.location.search).get('type') || 'commercial';
  const [bldgType, setBldgType] = useState(urlType);
  const [form, setForm] = useState(DEFAULTS[urlType]);
  const [climateZone, setClimateZone] = useState('3A');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const switchType = (t) => {
    setBldgType(t);
    setForm(DEFAULTS[t]);
    setResult(null);
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior HVAC engineer with expertise in ASHRAE standards. A ${bldgType} building needs HVAC equipment selection. Analyze and provide detailed recommendations.

BUILDING PARAMETERS:
- Type: ${bldgType}
- Total Sq Ft: ${form.sqft} ft²
- Floors: ${form.floors}
- Ceiling Height: ${form.ceiling} ft
- Occupants: ${form.occupants}
- ASHRAE Climate Zone: ${climateZone}
- Window-to-Wall Ratio: ${form.wwr}
- Ventilation: ${form.ventilation} CFM/person
- Lighting Power Density: ${form.lighting} W/ft²
- Equipment Load: ${form.equipment} W/ft²

Provide your analysis in this exact markdown structure:

## 🧮 Load Summary
- Estimated Cooling Load: X tons (show calculation)
- Estimated Heating Load: X kBTU/hr (show calculation)
- Ventilation Required: X CFM total

## 🏆 Recommended Equipment (Primary)
List the PRIMARY recommended HVAC system type with:
- System type and why it's best for this building
- Specific model category/size range (e.g., "50-ton air-cooled chiller, 2-pipe system")
- Efficiency rating targets (EER/COP/SEER/IEER)
- Manufacturer categories to consider

## 🔄 Alternative Systems
List 2 alternative system types with brief pros/cons each.

## 🌬️ Ventilation & IAQ
- Minimum OA requirements per ASHRAE 62.1
- ERV/HRV recommendation if applicable
- Filtration recommendation (MERV rating)

## ⚡ Energy Code Compliance
- Applicable ASHRAE 90.1 requirements for this climate zone
- Minimum efficiency requirements
- Any demand-controlled ventilation requirements

## 💡 Designer Notes
Key design considerations, zoning strategy, and any special recommendations for this building type.`,
      model: 'claude_sonnet_4_6',
    });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <Link to="/hvac" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> HVAC Designer
      </Link>

      <PageHeader
        title="Equipment Selector"
        subtitle="Input building parameters for AI-powered ASHRAE-compliant equipment recommendations"
      />

      {/* Building type toggle */}
      <div className="flex gap-2">
        {[
          { id: 'commercial', label: 'Commercial', icon: Building2 },
          { id: 'residential', label: 'Residential', icon: Home },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => switchType(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                bldgType === t.id
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              }`}>
              <Icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Input form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Building Parameters</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Total Sq Ft</Label>
                <Input type="number" value={form.sqft} onChange={e => set('sqft', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Floors</Label>
                <Input type="number" value={form.floors} onChange={e => set('floors', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ceiling Height (ft)</Label>
                <Input type="number" value={form.ceiling} onChange={e => set('ceiling', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Occupants</Label>
                <Input type="number" value={form.occupants} onChange={e => set('occupants', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Ventilation (CFM/person)</Label>
                <Input type="number" value={form.ventilation} onChange={e => set('ventilation', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Lighting (W/ft²)</Label>
                <Input type="number" step="0.1" value={form.lighting} onChange={e => set('lighting', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Equipment (W/ft²)</Label>
                <Input type="number" step="0.1" value={form.equipment} onChange={e => set('equipment', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Window-to-Wall Ratio</Label>
                <Input type="number" step="0.01" min="0" max="1" value={form.wwr} onChange={e => set('wwr', +e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">ASHRAE Climate Zone</Label>
              <Select value={climateZone} onValueChange={setClimateZone}>
                <SelectTrigger className="mt-1 h-8 text-sm bg-input border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {CLIMATE_ZONES.map(z => <SelectItem key={z} value={z} className="text-xs">Zone {z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={analyze} disabled={loading} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {loading ? 'Analyzing…' : 'Get Equipment Recommendations'}
            </Button>

            <div className="flex items-start gap-2 bg-primary/5 border border-primary/15 rounded-lg p-3">
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground">Uses <span className="text-primary font-medium">Claude Sonnet</span> — a premium AI model for engineering-grade accuracy. Uses more integration credits.</p>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="h-full min-h-64 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-3 text-muted-foreground p-10 text-center">
              <Wrench className="w-12 h-12 opacity-20" />
              <p className="text-sm">Fill in building parameters and click <strong className="text-foreground">Get Equipment Recommendations</strong> to receive AI-generated ASHRAE-compliant equipment selections.</p>
            </div>
          )}
          {loading && (
            <div className="h-full min-h-64 bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-4 text-muted-foreground p-10">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-sm">Analyzing building loads and selecting equipment…</p>
            </div>
          )}
          {result && !loading && (
            <div className="bg-card border border-border rounded-xl p-6 prose prose-sm prose-invert max-w-none
              [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-5 [&_h2]:mb-2 [&_h2:first-child]:mt-0
              [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground/90
              [&_ul]:my-1 [&_li]:text-muted-foreground [&_li]:text-sm [&_li]:leading-relaxed
              [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed
              [&_strong]:text-foreground">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}