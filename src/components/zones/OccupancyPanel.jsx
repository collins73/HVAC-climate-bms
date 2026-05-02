import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Users, UserX, HelpCircle, Zap, ZapOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

const STATUS_CONFIG = {
  Occupied:   { icon: Users,       color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Occupied' },
  Unoccupied: { icon: UserX,       color: 'text-slate-400',   bg: 'bg-slate-500/10 border-slate-500/30',     label: 'Unoccupied' },
  Unknown:    { icon: HelpCircle,  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/30',     label: 'Unknown' },
};

export default function OccupancyPanel({ zone, onZoneUpdated }) {
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const occupancyStatus = zone.occupancy_status || 'Unknown';
  const energySave = !!zone.energy_save_mode;
  const cfg = STATUS_CONFIG[occupancyStatus];
  const Icon = cfg.icon;

  const isUnoccupied = occupancyStatus === 'Unoccupied';
  const effectiveCooling = energySave && isUnoccupied
    ? (zone.unoccupied_setpoint_cooling ?? 80)
    : null;
  const effectiveHeating = energySave && isUnoccupied
    ? (zone.unoccupied_setpoint_heating ?? 62)
    : null;

  const updateZone = async (patch) => {
    setSaving(true);
    const updated = await base44.entities.Zone.update(zone.id, {
      ...patch,
      occupancy_last_updated: new Date().toISOString(),
    });
    setSaving(false);
    onZoneUpdated(updated);
  };

  const setOccupancy = (status) => {
    updateZone({ occupancy_status: status, occupancy_count: status === 'Unoccupied' ? 0 : zone.occupancy_count });
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full px-4 py-3 flex items-center justify-between border-b border-border hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Occupancy &amp; Energy Saving</h3>
          {energySave && isUnoccupied && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
              <Zap className="w-3 h-3" /> Saving
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-medium flex items-center gap-1.5 px-2 py-1 rounded-full border', cfg.bg, cfg.color)}>
            <Icon className="w-3 h-3" /> {cfg.label}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="p-4 space-y-5">
          {/* Occupancy Status Buttons */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Current Occupancy Status</Label>
            <div className="flex gap-2">
              {['Occupied', 'Unoccupied', 'Unknown'].map(s => {
                const c = STATUS_CONFIG[s];
                const SIcon = c.icon;
                return (
                  <button
                    key={s}
                    disabled={saving}
                    onClick={() => setOccupancy(s)}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-lg border text-xs font-medium transition-all',
                      occupancyStatus === s ? cn(c.bg, c.color) : 'border-border text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <SIcon className="w-4 h-4" />
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Occupant Count */}
          {occupancyStatus === 'Occupied' && (
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Estimated Occupants: <span className="text-foreground font-semibold">{zone.occupancy_count ?? 0}</span>
              </Label>
              <Slider
                value={[zone.occupancy_count ?? 0]}
                onValueChange={([v]) => updateZone({ occupancy_status: 'Occupied', occupancy_count: v })}
                min={0} max={50} step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>0</span><span>50</span></div>
            </div>
          )}

          {/* Energy Save Toggle */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div>
              <Label className="text-sm text-foreground flex items-center gap-2">
                {energySave ? <Zap className="w-3.5 h-3.5 text-emerald-400" /> : <ZapOff className="w-3.5 h-3.5 text-muted-foreground" />}
                Energy Save Mode
              </Label>
              <p className="text-xs text-muted-foreground mt-0.5">Relax setpoints automatically when unoccupied</p>
            </div>
            <Switch
              checked={energySave}
              onCheckedChange={v => updateZone({ energy_save_mode: v })}
            />
          </div>

          {/* Unoccupied Setpoints (only shown when energy save is on) */}
          {energySave && (
            <div className="space-y-4 bg-muted/30 border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Unoccupied Setpoints</p>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-blue-400">Cooling (unoccupied)</Label>
                  <span className="text-sm font-bold font-mono text-blue-400">{zone.unoccupied_setpoint_cooling ?? 80}°F</span>
                </div>
                <Slider
                  value={[zone.unoccupied_setpoint_cooling ?? 80]}
                  onValueChange={([v]) => updateZone({ unoccupied_setpoint_cooling: v })}
                  min={60} max={90} step={1}
                  className="[&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>60°F</span><span>90°F</span></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-orange-400">Heating (unoccupied)</Label>
                  <span className="text-sm font-bold font-mono text-orange-400">{zone.unoccupied_setpoint_heating ?? 62}°F</span>
                </div>
                <Slider
                  value={[zone.unoccupied_setpoint_heating ?? 62]}
                  onValueChange={([v]) => updateZone({ unoccupied_setpoint_heating: v })}
                  min={50} max={75} step={1}
                  className="[&_[role=slider]]:bg-orange-400 [&_[role=slider]]:border-orange-400"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>50°F</span><span>75°F</span></div>
              </div>

              {/* Show effective setpoints when actively saving */}
              {isUnoccupied && (
                <div className="mt-1 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <Zap className="w-3.5 h-3.5 flex-shrink-0" />
                  Energy saving active — setpoints relaxed to {effectiveCooling}°F cool / {effectiveHeating}°F heat
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}