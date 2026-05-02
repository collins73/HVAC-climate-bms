import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { ChevronRight, Thermometer, Wind } from 'lucide-react';
import { format } from 'date-fns';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <div className="text-muted-foreground mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="font-mono font-semibold">{p.value != null ? p.value : '--'}</span>
          <span>{p.name}</span>
        </div>
      ))}
    </div>
  );
};

export default function ZoneTrendChart({ zone, readings }) {
  const chartData = useMemo(() => {
    const zoneReadings = readings
      .filter(r => r.zone_id === zone.id && r.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(-20); // last 20 readings

    return zoneReadings.map(r => ({
      time: format(new Date(r.timestamp), 'HH:mm'),
      Temperature: r.temperature ?? null,
      CO2: r.co2_ppm ?? null,
    }));
  }, [zone.id, readings]);

  const latest = chartData[chartData.length - 1];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-foreground">{zone.name}</div>
          <div className="text-xs text-muted-foreground">{zone.zone_type}</div>
        </div>
        <div className="flex items-center gap-3">
          {latest?.Temperature != null && (
            <div className="flex items-center gap-1 text-xs font-mono text-cyan-400">
              <Thermometer className="w-3 h-3" /> {latest.Temperature}°F
            </div>
          )}
          {latest?.CO2 != null && (
            <div className="flex items-center gap-1 text-xs font-mono text-purple-400">
              <Wind className="w-3 h-3" /> {latest.CO2} ppm
            </div>
          )}
          <Link to={`/zones/${zone.id}`} className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5">
            Control <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pt-3 pb-1">
        {chartData.length < 2 ? (
          <div className="h-28 flex items-center justify-center text-xs text-muted-foreground">
            Not enough data — add readings to see trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="temp"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="co2"
                orientation="right"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                yAxisId="temp"
                type="monotone"
                dataKey="Temperature"
                stroke="hsl(186 90% 55%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: 'hsl(186 90% 55%)' }}
                connectNulls
              />
              <Line
                yAxisId="co2"
                type="monotone"
                dataKey="CO2"
                stroke="hsl(280 65% 60%)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, fill: 'hsl(280 65% 60%)' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 pb-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-0.5 rounded bg-cyan-400" /> Temp (°F)
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-0.5 rounded bg-purple-400" /> CO₂ (ppm)
        </div>
        <div className="ml-auto text-xs text-muted-foreground">{chartData.length} readings</div>
      </div>
    </div>
  );
}