import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileImage, CheckCircle2, Loader2, Building2, Layers, Thermometer, Calendar, AlertTriangle, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';

const ZONE_TYPES = ['Office', 'Lobby', 'Server Room', 'Conference Room', 'Warehouse', 'Retail', 'Residential', 'Other'];

const ASHRAE_DEFAULTS = {
  Office:            { cooling: 74, heating: 70, fan: 'Auto', startTime: '07:00', endTime: '19:00' },
  'Conference Room': { cooling: 74, heating: 70, fan: 'Auto', startTime: '08:00', endTime: '18:00' },
  Lobby:             { cooling: 75, heating: 68, fan: 'Auto', startTime: '07:00', endTime: '19:00' },
  'Server Room':     { cooling: 65, heating: 60, fan: 'On',   startTime: '00:00', endTime: '23:59' },
  Warehouse:         { cooling: 75, heating: 65, fan: 'Auto', startTime: '07:00', endTime: '18:00' },
  Retail:            { cooling: 74, heating: 68, fan: 'Auto', startTime: '08:00', endTime: '21:00' },
  Residential:       { cooling: 75, heating: 68, fan: 'Auto', startTime: '06:00', endTime: '22:00' },
  Other:             { cooling: 75, heating: 68, fan: 'Auto', startTime: '07:00', endTime: '18:00' },
};

export default function ImportBlueprint() {
  const [step, setStep] = useState('upload'); // upload | analyzing | review | saving | done
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState(null); // { building_name, total_sqft, floors, address, zones[] }
  const [savedSummary, setSavedSummary] = useState(null);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploading(false);
    analyzeImage(file_url);
  };

  const analyzeImage = async (url) => {
    setStep('analyzing');
    setError(null);
    const res = await base44.functions.invoke('analyzeBlueprint', { image_url: url });
    const data = res.data;
    if (!data || !data.zones) {
      setError('Could not extract floor plan data. Please try a clearer image.');
      setStep('upload');
      return;
    }
    setParsed({
      building_name: data.building_name || 'Imported Building',
      total_sqft: data.total_sqft || 0,
      floors: data.floors || 1,
      address: data.address || '',
      zones: (data.zones || []).map((z, i) => ({ ...z, _key: i })),
    });
    setStep('review');
  };

  const updateBuilding = (k, v) => setParsed(p => ({ ...p, [k]: v }));
  const updateZone = (key, k, v) => setParsed(p => ({ ...p, zones: p.zones.map(z => z._key === key ? { ...z, [k]: v } : z) }));
  const removeZone = (key) => setParsed(p => ({ ...p, zones: p.zones.filter(z => z._key !== key) }));
  const addZone = () => setParsed(p => ({ ...p, zones: [...p.zones, { _key: Date.now(), name: 'New Zone', zone_type: 'Office', sqft: 500, floor: 1, notes: '' }] }));

  const handleConfirm = async () => {
    setStep('saving');
    // 1. Create building (attach blueprint image if we have one)
    const building = await base44.entities.Building.create({
      name: parsed.building_name,
      address: parsed.address,
      floors: parsed.floors,
      total_sqft: parsed.total_sqft,
      status: 'Active',
      blueprints: imageUrl ? [{
        name: `Floor Plan`,
        url: imageUrl,
        floor: 1,
        uploaded_at: new Date().toISOString(),
      }] : [],
    });

    // 2. Create zones + thermostat + schedule + sensor pin per zone
    const zoneResults = [];
    for (const z of parsed.zones) {
      const zone = await base44.entities.Zone.create({
        name: z.name,
        building_id: building.id,
        floor: z.floor || 1,
        zone_type: z.zone_type || 'Other',
        sqft: z.sqft,
        status: 'Active',
        notes: z.notes || '',
      });
      zoneResults.push(zone);

      const defs = ASHRAE_DEFAULTS[z.zone_type] || ASHRAE_DEFAULTS.Other;
      const sensorType = z.sensor_type || 'Temperature';
      const hasPinCoords = z.x_pct != null && z.y_pct != null;

      await Promise.all([
        base44.entities.ThermostatSetting.create({
          zone_id: zone.id,
          building_id: building.id,
          mode: z.zone_type === 'Server Room' ? 'Cool' : 'Auto',
          setpoint_cooling: defs.cooling,
          setpoint_heating: defs.heating,
          fan_mode: defs.fan,
          schedule_enabled: true,
        }),
        base44.entities.Schedule.create({
          zone_id: zone.id,
          building_id: building.id,
          name: `${z.name} Occupied`,
          days_of_week: z.zone_type === 'Server Room' ? ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] : ['Mon','Tue','Wed','Thu','Fri'],
          start_time: defs.startTime,
          end_time: defs.endTime,
          setpoint_cooling: defs.cooling,
          setpoint_heating: defs.heating,
          mode: z.zone_type === 'Server Room' ? 'Cool' : 'Auto',
          is_active: true,
        }),
        hasPinCoords ? base44.entities.SensorPin.create({
          building_id: building.id,
          blueprint_index: 0,
          zone_id: zone.id,
          label: z.name,
          sensor_type: sensorType,
          x_pct: parseFloat(z.x_pct.toFixed(2)),
          y_pct: parseFloat(z.y_pct.toFixed(2)),
          notes: z.notes || '',
        }) : Promise.resolve(),
      ]);
    }

    setSavedSummary({ building, zones: zoneResults });
    setStep('done');
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Import Blueprint"
        subtitle="Upload a floor plan image — AI will extract zones, sq ft, and configure ASHRAE defaults automatically"
      />

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-xs">
        {['upload', 'analyzing', 'review', 'saving', 'done'].map((s, i) => {
          const steps = ['Upload', 'Analyzing', 'Review', 'Saving', 'Done'];
          const current = ['upload', 'analyzing', 'review', 'saving', 'done'].indexOf(step);
          const idx = i;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-medium transition-all ${
                idx < current ? 'bg-primary/20 border-primary/40 text-primary' :
                idx === current ? 'bg-primary text-primary-foreground border-primary' :
                'bg-card border-border text-muted-foreground'
              }`}>
                {idx < current ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 text-center leading-none">{i + 1}</span>}
                {steps[i]}
              </div>
              {i < 4 && <div className={`h-px w-4 ${idx < current ? 'bg-primary/40' : 'bg-border'}`} />}
            </div>
          );
        })}
      </div>

      {/* Upload Step */}
      {step === 'upload' && (
        <div className="space-y-4">
          <label
            className="flex flex-col items-center justify-center w-full min-h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={e => handleFile(e.target.files[0])} />
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading image…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Drop a floor plan image here</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP supported · AI will extract zones automatically</p>
                </div>
                <Button size="sm" className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
                  <FileImage className="w-4 h-4 mr-1.5" /> Choose File
                </Button>
              </div>
            )}
          </label>
          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>
      )}

      {/* Analyzing Step */}
      {step === 'analyzing' && (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Loader2 className="w-9 h-9 text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-foreground">AI Analyzing Floor Plan</p>
            <p className="text-sm text-muted-foreground mt-1">Extracting zones, dimensions, and building data…</p>
          </div>
          {imageUrl && <img src={imageUrl} alt="blueprint" className="max-w-xs max-h-40 rounded-lg border border-border object-contain opacity-50" />}
        </div>
      )}

      {/* Review Step */}
      {step === 'review' && parsed && (
        <div className="space-y-6">
          {/* Preview image + building info */}
          <div className="grid md:grid-cols-2 gap-4">
            {imageUrl && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <img src={imageUrl} alt="blueprint" className="w-full h-48 object-contain p-2" />
              </div>
            )}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Building Info</span>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Building Name</Label>
                <Input value={parsed.building_name} onChange={e => updateBuilding('building_name', e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Total Sq Ft</Label>
                  <Input type="number" value={parsed.total_sqft} onChange={e => updateBuilding('total_sqft', Number(e.target.value))} className="mt-1 h-8 text-sm bg-input border-border" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Floors</Label>
                  <Input type="number" value={parsed.floors} onChange={e => updateBuilding('floors', Number(e.target.value))} className="mt-1 h-8 text-sm bg-input border-border" />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Address (optional)</Label>
                <Input value={parsed.address} onChange={e => updateBuilding('address', e.target.value)} className="mt-1 h-8 text-sm bg-input border-border" placeholder="123 Main St" />
              </div>
            </div>
          </div>

          {/* Zones */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{parsed.zones.length} Zones Detected</span>
              </div>
              <Button size="sm" variant="outline" onClick={addZone} className="h-7 text-xs border-border">
                + Add Zone
              </Button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {parsed.zones.map(z => (
                <div key={z._key} className="grid grid-cols-12 gap-2 items-center bg-muted/30 border border-border rounded-lg p-2">
                  <div className="col-span-4">
                    <Input value={z.name} onChange={e => updateZone(z._key, 'name', e.target.value)} className="h-7 text-xs bg-input border-border" placeholder="Zone name" />
                  </div>
                  <div className="col-span-3">
                    <Select value={z.zone_type || 'Other'} onValueChange={v => updateZone(z._key, 'zone_type', v)}>
                      <SelectTrigger className="h-7 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {ZONE_TYPES.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={z.sqft || ''} onChange={e => updateZone(z._key, 'sqft', Number(e.target.value))} className="h-7 text-xs bg-input border-border" placeholder="Sq ft" />
                  </div>
                  <div className="col-span-2">
                    <Input type="number" value={z.floor || 1} onChange={e => updateZone(z._key, 'floor', Number(e.target.value))} className="h-7 text-xs bg-input border-border" placeholder="Floor" />
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeZone(z._key)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-2">
              <span className="col-span-4">Name</span>
              <span className="col-span-3">Type</span>
              <span className="col-span-2">Sq Ft</span>
              <span className="col-span-2">Floor</span>
            </div>
          </div>

          {/* ASHRAE notice */}
          <div className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
            <Thermometer className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">ASHRAE Defaults Applied Automatically</span> — Each zone will receive thermostat setpoints and occupied schedules (Mon–Fri) based on zone type. Server Rooms get 24/7 cooling at 65°F.
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep('upload'); setImageUrl(null); setParsed(null); }} className="border-border text-muted-foreground">
              Start Over
            </Button>
            <Button onClick={handleConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Confirm & Import Building
            </Button>
          </div>
        </div>
      )}

      {/* Saving Step */}
      {step === 'saving' && (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-base font-semibold text-foreground">Creating Building & Zones</p>
          <p className="text-sm text-muted-foreground">Applying ASHRAE defaults and schedules…</p>
        </div>
      )}

      {/* Done Step */}
      {step === 'done' && savedSummary && (
        <div className="space-y-6">
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">Import Successful!</p>
              <p className="text-sm text-muted-foreground mt-1">{savedSummary.building.name} has been created with {savedSummary.zones.length} zones</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">{savedSummary.building.name}</span>
            </div>
            {savedSummary.zones.map(z => (
              <div key={z.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span className="text-foreground font-medium">{z.name}</span>
                <span>· {z.zone_type} · Floor {z.floor}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setStep('upload'); setImageUrl(null); setParsed(null); setSavedSummary(null); }} className="border-border text-muted-foreground">
              Import Another
            </Button>
            <Button onClick={() => window.location.href = `/buildings/${savedSummary.building.id}`} className="bg-primary text-primary-foreground hover:bg-primary/90 flex-1">
              <Building2 className="w-4 h-4 mr-1.5" /> View Building
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}