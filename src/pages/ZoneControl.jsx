import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Thermometer, Wind, Droplets, Plus, Check, AlertTriangle, Calendar, Clock, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StatusBadge from '@/components/shared/StatusBadge';
import SensorReadout from '@/components/shared/SensorReadout';
import { cn } from '@/lib/utils';

const MODES = ['Cool', 'Heat', 'Auto', 'Fan Only', 'Off'];
const FAN_MODES = ['Auto', 'On', 'Circulate'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const modeColors = {
  Cool: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  Heat: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
  Auto: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  'Fan Only': 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  Off: 'border-border bg-muted text-muted-foreground',
};

export default function ZoneControl() {
  const { id } = useParams();
  const [zone, setZone] = useState(null);
  const [building, setBuilding] = useState(null);
  const [thermostat, setThermostat] = useState(null);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [saving, setSaving] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ name: '', days_of_week: [], start_time: '08:00', end_time: '18:00', setpoint_cooling: 74, setpoint_heating: 68, mode: 'Auto', is_active: true });

  const load = async () => {
    const [zones, t, r, a, s] = await Promise.all([
      base44.entities.Zone.filter({ id }),
      base44.entities.ThermostatSetting.filter({ zone_id: id }),
      base44.entities.EnvironmentReading.filter({ zone_id: id }),
      base44.entities.Alert.filter({ zone_id: id }),
      base44.entities.Schedule.filter({ zone_id: id }),
    ]);
    const z = zones[0];
    setZone(z);
    setReadings(r.sort((a, b) => b.timestamp?.localeCompare(a.timestamp)));
    setAlerts(a);
    setSchedules(s);
    if (t[0]) {
      setThermostat(t[0]);
    } else {
      setThermostat({ zone_id: id, building_id: z?.building_id, mode: 'Auto', setpoint_cooling: 74, setpoint_heating: 68, fan_mode: 'Auto', schedule_enabled: false });
    }
    if (z?.building_id) {
      const b = await base44.entities.Building.filter({ id: z.building_id });
      setBuilding(b[0]);
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveThermostat = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    const data = { ...thermostat, last_updated_by: user?.email };
    if (thermostat.id) {
      await base44.entities.ThermostatSetting.update(thermostat.id, data);
    } else {
      const created = await base44.entities.ThermostatSetting.create(data);
      setThermostat(created);
    }
    setSaving(false);
  };

  const acknowledgeAlert = async (alert) => {
    const user = await base44.auth.me();
    await base44.entities.Alert.update(alert.id, { status: 'Acknowledged', acknowledged_by: user?.email });
    load();
  };

  const resolveAlert = async (alert) => {
    await base44.entities.Alert.update(alert.id, { status: 'Resolved', resolved_at: new Date().toISOString() });
    load();
  };

  const saveSchedule = async () => {
    await base44.entities.Schedule.create({ ...newSchedule, zone_id: id, building_id: zone?.building_id });
    setScheduleModal(false);
    setNewSchedule({ name: '', days_of_week: [], start_time: '08:00', end_time: '18:00', setpoint_cooling: 74, setpoint_heating: 68, mode: 'Auto', is_active: true });
    load();
  };

  const toggleSchedule = async (s) => {
    await base44.entities.Schedule.update(s.id, { is_active: !s.is_active });
    load();
  };

  if (!zone || !thermostat) return <div className="p-6 text-muted-foreground">Loading…</div>;

  const latestReading = readings[0];
  const openAlerts = alerts.filter(a => a.status === 'Open' || a.status === 'Acknowledged');

  return (
    <div className="p-6 space-y-6">
      <Link to="/zones" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> Zones
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{zone.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">{building?.name}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">Floor {zone.floor || '?'}</span>
            <StatusBadge status={zone.status} />
          </div>
        </div>
        {openAlerts.length > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm text-red-400 font-medium">{openAlerts.length} Active Alert{openAlerts.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Thermostat Control */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Conditions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Current Conditions</h3>
            <SensorReadout temperature={latestReading?.temperature} humidity={latestReading?.humidity} co2_ppm={latestReading?.co2_ppm} />
            {latestReading && (
              <p className="text-xs text-muted-foreground mt-3 text-right">
                Last updated: {new Date(latestReading.timestamp).toLocaleString()} · {latestReading.source}
              </p>
            )}
          </div>

          {/* Mode Selector */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">HVAC Mode</h3>
            <div className="flex flex-wrap gap-2">
              {MODES.map(m => (
                <button
                  key={m}
                  onClick={() => setThermostat(t => ({ ...t, mode: m }))}
                  className={cn(
                    "px-4 py-2 rounded-lg border text-sm font-medium transition-all",
                    thermostat.mode === m ? modeColors[m] : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground hover:border-border/60'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Setpoints */}
          {thermostat.mode !== 'Off' && thermostat.mode !== 'Fan Only' && (
            <div className="bg-card border border-border rounded-xl p-5 space-y-5">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Temperature Setpoints</h3>
              {(thermostat.mode === 'Cool' || thermostat.mode === 'Auto') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-blue-400 font-medium">Cooling Setpoint</Label>
                    <span className="text-xl font-bold font-mono text-blue-400">{thermostat.setpoint_cooling}°F</span>
                  </div>
                  <Slider
                    value={[thermostat.setpoint_cooling]}
                    onValueChange={([v]) => setThermostat(t => ({ ...t, setpoint_cooling: v }))}
                    min={60} max={85} step={1}
                    className="[&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-400"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>60°F</span><span>85°F</span></div>
                </div>
              )}
              {(thermostat.mode === 'Heat' || thermostat.mode === 'Auto') && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm text-orange-400 font-medium">Heating Setpoint</Label>
                    <span className="text-xl font-bold font-mono text-orange-400">{thermostat.setpoint_heating}°F</span>
                  </div>
                  <Slider
                    value={[thermostat.setpoint_heating]}
                    onValueChange={([v]) => setThermostat(t => ({ ...t, setpoint_heating: v }))}
                    min={55} max={80} step={1}
                    className="[&_[role=slider]]:bg-orange-400 [&_[role=slider]]:border-orange-400"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>55°F</span><span>80°F</span></div>
                </div>
              )}
            </div>
          )}

          {/* Fan Mode */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Fan Mode</h3>
            <div className="flex gap-2">
              {FAN_MODES.map(fm => (
                <button
                  key={fm}
                  onClick={() => setThermostat(t => ({ ...t, fan_mode: fm }))}
                  className={cn(
                    "flex-1 py-2 rounded-lg border text-sm font-medium transition-all",
                    thermostat.fan_mode === fm
                      ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400'
                      : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Wind className="w-3.5 h-3.5 mx-auto mb-0.5" />
                  {fm}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Label className="text-sm text-foreground">Schedule Enabled</Label>
              <Switch
                checked={thermostat.schedule_enabled}
                onCheckedChange={v => setThermostat(t => ({ ...t, schedule_enabled: v }))}
              />
            </div>
          </div>

          <Button onClick={saveThermostat} disabled={saving} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3">
            {saving ? 'Applying Changes…' : 'Apply Thermostat Settings'}
          </Button>
        </div>

        {/* Right Panel */}
        <div className="space-y-4">
          {/* Active Alerts */}
          {openAlerts.length > 0 && (
            <div className="bg-card border border-red-500/20 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-red-500/20 bg-red-500/5">
                <h3 className="text-sm font-semibold text-red-400">Active Alerts</h3>
              </div>
              <div className="divide-y divide-border">
                {openAlerts.map(a => (
                  <div key={a.id} className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <StatusBadge status={a.severity} />
                        <div className="text-xs font-medium text-foreground mt-1">{a.alert_type}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.message}</div>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      {a.status === 'Open' && (
                        <button onClick={() => acknowledgeAlert(a)} className="flex-1 text-xs py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors">
                          Acknowledge
                        </button>
                      )}
                      <button onClick={() => resolveAlert(a)} className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                        Resolve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedules */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Schedules</h3>
              <button onClick={() => setScheduleModal(true)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add
              </button>
            </div>
            <div className="divide-y divide-border">
              {schedules.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">No schedules configured</div>
              ) : schedules.map(s => (
                <div key={s.id} className="p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.start_time} – {s.end_time} · {s.mode}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {DAYS.map(d => (
                        <span key={d} className={cn("text-xs px-1 rounded", s.days_of_week?.includes(d) ? 'bg-primary/20 text-primary' : 'text-muted-foreground/30')}>
                          {d[0]}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => toggleSchedule(s)} className="text-muted-foreground hover:text-foreground transition-colors">
                    {s.is_active ? <ToggleRight className="w-5 h-5 text-primary" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reading History */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold text-foreground">Reading History</h3>
            </div>
            <div className="overflow-auto max-h-56">
              {readings.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center">No readings recorded</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-3 py-2 text-left text-muted-foreground font-medium">Time</th>
                      <th className="px-3 py-2 text-right text-muted-foreground font-medium">°F</th>
                      <th className="px-3 py-2 text-right text-muted-foreground font-medium">%RH</th>
                      <th className="px-3 py-2 text-right text-muted-foreground font-medium">CO₂</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {readings.slice(0, 20).map(r => (
                      <tr key={r.id} className="hover:bg-muted/20">
                        <td className="px-3 py-1.5 text-muted-foreground font-mono">{r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-cyan-400">{r.temperature ?? '--'}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-blue-400">{r.humidity ?? '--'}</td>
                        <td className="px-3 py-1.5 text-right font-mono text-purple-400">{r.co2_ppm ?? '--'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      <Dialog open={scheduleModal} onOpenChange={setScheduleModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle className="text-foreground">Add Schedule</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-muted-foreground text-xs">Schedule Name</Label>
              <Input value={newSchedule.name} onChange={e => setNewSchedule(s => ({ ...s, name: e.target.value }))} className="mt-1 bg-input border-border text-foreground" placeholder="e.g. Business Hours" />
            </div>
            <div>
              <Label className="text-muted-foreground text-xs mb-2 block">Days of Week</Label>
              <div className="flex gap-1.5">
                {DAYS.map(d => (
                  <button key={d} onClick={() => setNewSchedule(s => ({ ...s, days_of_week: s.days_of_week.includes(d) ? s.days_of_week.filter(x => x !== d) : [...s.days_of_week, d] }))}
                    className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", newSchedule.days_of_week.includes(d) ? 'bg-primary/20 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground')}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-muted-foreground text-xs">Start Time</Label>
                <Input type="time" value={newSchedule.start_time} onChange={e => setNewSchedule(s => ({ ...s, start_time: e.target.value }))} className="mt-1 bg-input border-border text-foreground" />
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">End Time</Label>
                <Input type="time" value={newSchedule.end_time} onChange={e => setNewSchedule(s => ({ ...s, end_time: e.target.value }))} className="mt-1 bg-input border-border text-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Mode</Label>
              <Select value={newSchedule.mode} onValueChange={v => setNewSchedule(s => ({ ...s, mode: v }))}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModal(false)} className="border-border text-muted-foreground">Cancel</Button>
            <Button onClick={saveSchedule} disabled={!newSchedule.name} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}