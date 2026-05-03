import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function AllZonesTrendChart({ readings }) {
  const chartData = useMemo(() => {
    const now = Date.now();
    const cutoff = now - 24 * 60 * 60 * 1000;
    const buckets = {};

    readings
      .filter(r => r.timestamp && new Date(r.timestamp).getTime() >= cutoff)
      .forEach(r => {
        const d = new Date(r.timestamp);
        d.setMinutes(0, 0, 0);
        const key = d.toISOString();
        if (!buckets[key]) buckets[key] = { label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), temps: [], co2s: [] };
        if (r.temperature != null) buckets[key].temps.push(r.temperature);
        if (r.co2_ppm != null) buckets[key].co2s.push(r.co2_ppm);
      });

    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        time: v.label,
        temp: v.temps.length ? +(v.temps.reduce((a, b) => a + b, 0) / v.temps.length).toFixed(1) : null,
        co2: v.co2s.length ? +(v.co2s.reduce((a, b) => a + b, 0) / v.co2s.length).toFixed(0) : null,
      }))
      .filter(d => d.temp != null || d.co2 != null);
  }, [readings]);

  if (chartData.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">Temperature & CO₂ — Last 24 Hours (All Zones)</h2>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
          <YAxis yAxisId="temp" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} domain={['auto', 'auto']} unit="°F" width={42} />
          <YAxis yAxisId="co2" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} domain={['auto', 'auto']} unit=" ppm" width={52} />
          <Tooltip
            contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }} />
          <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Avg Temp °F" />
          <Line yAxisId="co2" type="monotone" dataKey="co2" stroke="#a78bfa" strokeWidth={2} dot={false} name="Avg CO₂ ppm" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}