import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ZoneMiniChart({ readings }) {
  const data = useMemo(() => {
    return [...readings]
      .sort((a, b) => (a.timestamp || '').localeCompare(b.timestamp || ''))
      .slice(-20)
      .map(r => ({
        time: r.timestamp ? new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        temp: r.temperature ?? null,
        co2: r.co2_ppm ?? null,
      }));
  }, [readings]);

  if (data.length === 0) return (
    <div className="text-xs text-muted-foreground text-center py-4">No readings to chart</div>
  );

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 12, left: -10, bottom: 0 }}>
        <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} interval="preserveStartEnd" />
        <YAxis yAxisId="temp" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={['auto', 'auto']} width={30} />
        <YAxis yAxisId="co2" orientation="right" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={['auto', 'auto']} width={36} />
        <Tooltip
          contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        <Line yAxisId="temp" type="monotone" dataKey="temp" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} name="Temp °F" />
        <Line yAxisId="co2" type="monotone" dataKey="co2" stroke="#a78bfa" strokeWidth={1.5} dot={false} name="CO₂ ppm" />
      </LineChart>
    </ResponsiveContainer>
  );
}