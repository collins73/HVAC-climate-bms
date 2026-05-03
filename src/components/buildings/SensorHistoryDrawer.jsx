import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Thermometer, Droplets, Wind, Gauge, Zap, HelpCircle, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SENSOR_ICONS = {
  Temperature:   { Icon: Thermometer, color: 'text-cyan-400',     stroke: '#22d3ee' },
  Humidity:      { Icon: Droplets,    color: 'text-blue-400',     stroke: '#60a5fa' },
  CO2:           { Icon: Wind,        color: 'text-purple-400',   stroke: '#c084fc' },
  Thermostat:    { Icon: Gauge,       color: 'text-amber-400',    stroke: '#fbbf24' },
  'Air Quality': { Icon: Zap,         color: 'text-emerald-400',  stroke: '#34d399' },
  Other:         { Icon: HelpCircle,  color: 'text-muted-foreground', stroke: '#6b7280' },
};

const METRICS = {
  Temperature:   [{ key: 'temperature',      label: 'Temperature', unit: '°F', stroke: '#22d3ee' }],
  Humidity:      [{ key: 'humidity',         label: 'Humidity',    unit: '%',  stroke: '#60a5fa' }],
  CO2:           [{ key: 'co2_ppm',          label: 'CO₂',        unit: ' ppm', stroke: '#c084fc' }],
  Thermostat:    [{ key: 'temperature',      label: 'Temperature', unit: '°F', stroke: '#fbbf24' },
                  { key: 'humidity',         label: 'Humidity',    unit: '%',  stroke: '#60a5fa' }],
  'Air Quality': [{ key: 'air_quality_index',label: 'AQI',         unit: '',   stroke: '#34d399' }],
  Other:         [{ key: 'temperature',      label: 'Temperature', unit: '°F', stroke: '#6b7280' },
                  { key: 'humidity',         label: 'Humidity',    unit: '%',  stroke: '#60a5fa' },
                  { key: 'co2_ppm',          label: 'CO₂',        unit: ' ppm', stroke: '#c084fc' }],
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-2 text-xs shadow-xl">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-foreground font-medium">{p.name}: {p.value}{p.unit}</span>
        </div>
      ))}
    </div>
  );
}

export default function SensorHistoryDrawer({ pin, zone, onClose }) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pin?.zone_id) { setLoading(false); return; }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    base44.entities.EnvironmentReading.list('-timestamp', 500).then(all => {
      const filtered = all
        .filter(r => r.zone_id === pin.zone_id && r.timestamp >= since)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setReadings(filtered);
      setLoading(false);
    });
  }, [pin?.zone_id]);

  const cfg = SENSOR_ICONS[pin?.sensor_type] || SENSOR_ICONS.Other;
  const metrics = METRICS[pin?.sensor_type] || METRICS.Other;
  const { Icon } = cfg;

  // Format chart data
  const chartData = readings.map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temperature: r.temperature,
    humidity: r.humidity,
    co2_ppm: r.co2_ppm,
    air_quality_index: r.air_quality_index,
  }));

  // Compute stats for each metric
  const stats = metrics.map(m => {
    const vals = readings.map(r => r[m.key]).filter(v => v != null);
    if (!vals.length) return { ...m, avg: null, min: null, max: null, trend: 'flat' };
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const trend = vals.length > 1
      ? vals[vals.length - 1] > vals[0] + 1 ? 'up'
      : vals[vals.length - 1] < vals[0] - 1 ? 'down'
      : 'flat'
      : 'flat';
    return { ...m, avg: avg.toFixed(1), min: min.toFixed(1), max: max.toFixed(1), trend };
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-3">
              <div className={cn('w-9 h-9 rounded-full flex items-center justify-center border-2', 
                pin?.sensor_type === 'Temperature' ? 'bg-cyan-500/20 border-cyan-500/40' :
                pin?.sensor_type === 'Humidity' ? 'bg-blue-500/20 border-blue-500/40' :
                pin?.sensor_type === 'CO2' ? 'bg-purple-500/20 border-purple-500/40' :
                pin?.sensor_type === 'Air Quality' ? 'bg-emerald-500/20 border-emerald-500/40' :
                'bg-amber-500/20 border-amber-500/40'
              )}>
                <Icon className={cn('w-4 h-4', cfg.color)} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">{pin?.label}</h2>
                <p className="text-xs text-muted-foreground">
                  {pin?.sensor_type}{zone ? ` · ${zone.name}` : ''} · Last 24 hours
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : !pin?.zone_id ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Assign this sensor to a zone to see historical data.
              </div>
            ) : readings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No readings in the last 24 hours for this zone.
              </div>
            ) : (
              <>
                {/* Stat summary cards */}
                <div className="grid grid-cols-3 gap-3">
                  {stats.map(s => {
                    const TrendIcon = s.trend === 'up' ? TrendingUp : s.trend === 'down' ? TrendingDown : Minus;
                    const trendColor = s.trend === 'up' ? 'text-red-400' : s.trend === 'down' ? 'text-cyan-400' : 'text-muted-foreground';
                    return s.avg == null ? null : (
                      <div key={s.key} className="bg-secondary/40 rounded-xl p-3 border border-border">
                        <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                        <div className="flex items-end gap-1.5">
                          <span className="text-xl font-bold text-foreground font-mono">{s.avg}</span>
                          <span className="text-xs text-muted-foreground mb-0.5">{s.unit}</span>
                          <TrendIcon className={cn('w-3.5 h-3.5 mb-1 ml-auto', trendColor)} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="text-cyan-400">{s.min}</span> – <span className="text-red-400">{s.max}</span>{s.unit}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Charts */}
                {metrics.map(m => {
                  const hasData = readings.some(r => r[m.key] != null);
                  if (!hasData) return null;
                  return (
                    <div key={m.key}>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {m.label} {m.unit && `(${m.unit.trim()})`}
                      </div>
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              type="monotone"
                              dataKey={m.key}
                              name={m.label}
                              unit={m.unit}
                              stroke={m.stroke}
                              strokeWidth={2}
                              dot={false}
                              activeDot={{ r: 4, fill: m.stroke }}
                              connectNulls
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}

                <div className="text-xs text-muted-foreground text-right">
                  {readings.length} readings · {new Date(readings[0]?.timestamp).toLocaleString()} – {new Date(readings[readings.length - 1]?.timestamp).toLocaleString()}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}