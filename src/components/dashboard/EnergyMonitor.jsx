import { useMemo } from 'react';
import { Zap, TrendingDown, TrendingUp, Minus, Flame, Snowflake, Wind } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Estimation model:
// Base load per zone = 0.5 kW (fans, controls)
// Cooling load: watts per sqft based on how far current temp is above setpoint_cooling
// Heating load: watts per sqft based on how far current temp is below setpoint_heating
// Fallback sqft = 500 if not set
const W_PER_SQFT_PER_DEGREE = 0.08; // watts per sqft per °F delta
const BASE_KW_PER_ZONE = 0.5;

function estimateZoneKw(zone, thermostatSetting, latestReading) {
  const sqft = zone.sqft || 500;
  const mode = thermostatSetting?.mode || 'Auto';
  const currentTemp = latestReading?.temperature;

  if (!currentTemp || mode === 'Off') return BASE_KW_PER_ZONE * 0.1;

  let delta = 0;
  let activeMode = 'idle';

  if (mode === 'Cool' || mode === 'Auto') {
    const setpointCool = thermostatSetting?.setpoint_cooling ?? 74;
    if (currentTemp > setpointCool) {
      delta = currentTemp - setpointCool;
      activeMode = 'cooling';
    }
  }
  if ((mode === 'Heat' || mode === 'Auto') && delta === 0) {
    const setpointHeat = thermostatSetting?.setpoint_heating ?? 68;
    if (currentTemp < setpointHeat) {
      delta = setpointHeat - currentTemp;
      activeMode = 'heating';
    }
  }
  if (mode === 'Fan Only') {
    activeMode = 'fan';
    delta = 0;
  }

  const loadKw = BASE_KW_PER_ZONE + (sqft * W_PER_SQFT_PER_DEGREE * delta) / 1000;
  return { kw: Math.max(0.05, loadKw), activeMode };
}

const modeColors = {
  cooling: '#22d3ee',
  heating: '#f97316',
  fan: '#a78bfa',
  idle: '#374151',
};

const ModeIcon = ({ mode, className }) => {
  if (mode === 'cooling') return <Snowflake className={className} />;
  if (mode === 'heating') return <Flame className={className} />;
  if (mode === 'fan') return <Wind className={className} />;
  return <Minus className={className} />;
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="font-medium text-foreground mb-1">{d.name}</div>
      <div className="text-muted-foreground">{d.kw.toFixed(2)} kW estimated</div>
      <div className="capitalize" style={{ color: modeColors[d.activeMode] }}>{d.activeMode}</div>
    </div>
  );
};

export default function EnergyMonitor({ zones, thermostatSettings, latestByZone, loading }) {
  const zoneData = useMemo(() => {
    return zones.map(zone => {
      const ts = thermostatSettings.find(t => t.zone_id === zone.id);
      const reading = latestByZone[zone.id];
      const result = estimateZoneKw(zone, ts, reading);
      const kw = typeof result === 'object' ? result.kw : result;
      const activeMode = typeof result === 'object' ? result.activeMode : 'idle';
      return { id: zone.id, name: zone.name, kw, activeMode };
    }).sort((a, b) => b.kw - a.kw);
  }, [zones, thermostatSettings, latestByZone]);

  const totalKw = zoneData.reduce((sum, z) => sum + z.kw, 0);
  const peakZone = zoneData[0];
  const coolingCount = zoneData.filter(z => z.activeMode === 'cooling').length;
  const heatingCount = zoneData.filter(z => z.activeMode === 'heating').length;

  // Estimated monthly kWh (assuming 10hrs/day active)
  const monthlyKwh = (totalKw * 10 * 30).toFixed(0);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold text-foreground text-sm">Energy Usage Monitor</h2>
        </div>
        <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">Estimated</span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground text-sm">Loading…</div>
      ) : zones.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">No zones to estimate</div>
      ) : (
        <div className="p-5 space-y-5">
          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/40 border border-border rounded-lg p-3 text-center">
              <div className="text-xl font-bold font-mono text-amber-400">{totalKw.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground mt-0.5">kW Now</div>
            </div>
            <div className="bg-muted/40 border border-border rounded-lg p-3 text-center">
              <div className="text-xl font-bold font-mono text-foreground">{monthlyKwh}</div>
              <div className="text-xs text-muted-foreground mt-0.5">kWh/mo est.</div>
            </div>
            <div className="bg-muted/40 border border-border rounded-lg p-3 text-center">
              <div className="text-xl font-bold font-mono text-cyan-400">{coolingCount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">Cooling zones</div>
            </div>
          </div>

          {/* Bar chart */}
          {zoneData.length > 0 && (
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={zoneData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} axisLine={false} unit=" kW" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="kw" radius={[4, 4, 0, 0]}>
                    {zoneData.map((entry) => (
                      <Cell key={entry.id} fill={modeColors[entry.activeMode]} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Zone list */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {zoneData.map(z => (
              <div key={z.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-2 min-w-0">
                  <ModeIcon mode={z.activeMode} className="w-3.5 h-3.5 flex-shrink-0" style={{ color: modeColors[z.activeMode] }} />
                  <span className="text-foreground truncate">{z.name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="capitalize text-muted-foreground">{z.activeMode}</span>
                  <span className="font-mono font-medium text-amber-400">{z.kw.toFixed(2)} kW</span>
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 pt-1 border-t border-border flex-wrap">
            {[['cooling', 'Cooling'], ['heating', 'Heating'], ['fan', 'Fan Only'], ['idle', 'Idle/Off']].map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: modeColors[key] }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}