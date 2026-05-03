import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { TrendingDown, Loader2, Sparkles, ChevronLeft, Brain, Zap, DollarSign, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/shared/PageHeader';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ReactMarkdown from 'react-markdown';

export default function EnergyPredictor() {
  const [buildings, setBuildings] = useState([]);
  const [zones, setZones] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [thermostats, setThermostats] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Building.list(),
      base44.entities.Zone.list(),
      base44.entities.EnvironmentReading.list('-timestamp', 300),
      base44.entities.Alert.list('-created_date', 200),
      base44.entities.ThermostatSetting.list(),
    ]).then(([b, z, r, a, t]) => {
      setBuildings(b); setZones(z); setReadings(r); setAlerts(a); setThermostats(t);
      setDataLoading(false);
    });
  }, []);

  // Build trend chart data from readings (last 48 hours, hourly buckets)
  const trendData = (() => {
    const now = Date.now();
    const buckets = {};
    const filteredReadings = readings.filter(r =>
      selectedBuilding === 'all' || r.building_id === selectedBuilding
    );
    filteredReadings.forEach(r => {
      const ts = new Date(r.timestamp).getTime();
      if (now - ts > 48 * 3600 * 1000) return;
      const hour = new Date(r.timestamp);
      hour.setMinutes(0, 0, 0);
      const key = hour.toISOString();
      if (!buckets[key]) buckets[key] = { time: hour.getHours() + ':00', temps: [], co2s: [], humids: [] };
      if (r.temperature != null) buckets[key].temps.push(r.temperature);
      if (r.co2_ppm != null) buckets[key].co2s.push(r.co2_ppm);
      if (r.humidity != null) buckets[key].humids.push(r.humidity);
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => ({
        time: v.time,
        temp: v.temps.length ? +(v.temps.reduce((a, b) => a + b, 0) / v.temps.length).toFixed(1) : null,
        co2: v.co2s.length ? +(v.co2s.reduce((a, b) => a + b, 0) / v.co2s.length).toFixed(0) : null,
        humidity: v.humids.length ? +(v.humids.reduce((a, b) => a + b, 0) / v.humids.length).toFixed(1) : null,
      })).filter(d => d.temp != null);
  })();

  const analyze = async () => {
    setLoading(true);
    setPrediction(null);

    const bldg = buildings.find(b => b.id === selectedBuilding);
    const relevantZones = zones.filter(z => selectedBuilding === 'all' || z.building_id === selectedBuilding);
    const relevantReadings = readings.filter(r => selectedBuilding === 'all' || r.building_id === selectedBuilding);
    const relevantAlerts = alerts.filter(a => selectedBuilding === 'all' || a.building_id === selectedBuilding);
    const relevantThermostats = thermostats.filter(t => selectedBuilding === 'all' || t.building_id === selectedBuilding);

    // Statistical features for ML context
    const temps = relevantReadings.map(r => r.temperature).filter(v => v != null);
    const co2s = relevantReadings.map(r => r.co2_ppm).filter(v => v != null);
    const humids = relevantReadings.map(r => r.humidity).filter(v => v != null);
    const avg = arr => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'N/A';
    const std = arr => {
      if (arr.length < 2) return 'N/A';
      const m = arr.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length).toFixed(2);
    };

    // Zone occupancy patterns
    const energySaveZones = relevantZones.filter(z => z.energy_save_mode).length;
    const avgCooling = relevantThermostats.length
      ? (relevantThermostats.reduce((a, t) => a + (t.setpoint_cooling || 74), 0) / relevantThermostats.length).toFixed(1)
      : 74;
    const avgHeating = relevantThermostats.length
      ? (relevantThermostats.reduce((a, t) => a + (t.setpoint_heating || 68), 0) / relevantThermostats.length).toFixed(1)
      : 68;

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert ML-driven EMS (Energy Management System) analyst. Analyze the following real sensor data from a building management system and provide an intelligent energy behavior prediction and optimization plan.

BUILDING CONTEXT:
${bldg ? `- Building: ${bldg.name} (${bldg.total_sqft || 'Unknown'} sqft, ${bldg.floors || '?'} floors)` : '- Scope: All Buildings'}
- Monitored Zones: ${relevantZones.length}
- Zones with Energy Save Mode: ${energySaveZones}
- Active Alerts (last period): ${relevantAlerts.filter(a => a.status === 'Open').length} open

SENSOR DATA STATISTICS (from ${relevantReadings.length} readings):
Temperature:
  - Average: ${avg(temps)}°F | Std Dev: ${std(temps)}°F
  - Min: ${temps.length ? Math.min(...temps).toFixed(1) : 'N/A'}°F | Max: ${temps.length ? Math.max(...temps).toFixed(1) : 'N/A'}°F

CO₂ Levels:
  - Average: ${avg(co2s)} ppm | Std Dev: ${std(co2s)} ppm
  - Max: ${co2s.length ? Math.max(...co2s).toFixed(0) : 'N/A'} ppm

Humidity:
  - Average: ${avg(humids)}% | Std Dev: ${std(humids)}%

THERMOSTAT CONFIGURATION:
  - Average Cooling Setpoint: ${avgCooling}°F
  - Average Heating Setpoint: ${avgHeating}°F
  - Deadband: ${(parseFloat(avgCooling) - parseFloat(avgHeating)).toFixed(1)}°F

RECENT ALERT TYPES:
${relevantAlerts.slice(0, 10).map(a => `  - ${a.alert_type} (${a.severity})`).join('\n') || '  - No recent alerts'}

Based on this data, provide your ML-driven analysis in this exact structure:

## 🤖 ML Behavior Analysis
Analyze the sensor patterns and identify:
- Temperature drift patterns and what they indicate about system behavior
- CO₂ trends and their impact on ventilation efficiency
- Setpoint deviation frequency and causes
- Whether the system is over-cooling, under-heating, or cycling excessively

## 📈 7-Day Energy Forecast
Provide specific predictions:
- Expected peak load days/times
- Estimated energy consumption trend (increasing/decreasing/stable) with % estimate
- High-risk periods for equipment stress
- Predicted alert types likely to occur

## 💰 Cost Optimization Recommendations
Provide 4-6 specific, actionable recommendations ranked by impact:
For each recommendation:
**Recommendation name**: Description of what to change
- Estimated savings: X% or $X/month
- Implementation: Easy/Medium/Complex
- Priority: High/Medium/Low

## ⚙️ Setpoint Strategy
Optimal setpoint recommendations based on the data patterns:
- Cooling setpoint adjustments
- Heating setpoint adjustments
- Deadband optimization
- Schedule-based setpoint strategies

## 🔮 Predictive Maintenance Flags
Based on sensor data anomalies, flag any equipment likely needing attention in the next 30 days.

## 📊 EMS Behavioral Score
Rate the current EMS performance: X/100
Breakdown: Efficiency score, Comfort score, Reliability score`,
      model: 'claude_sonnet_4_6',
    });

    setPrediction(res);
    setLoading(false);
  };

  const temps24h = trendData.map(d => d.temp).filter(v => v != null);
  const avgTemp = temps24h.length ? (temps24h.reduce((a, b) => a + b, 0) / temps24h.length).toFixed(1) : '--';
  const maxTemp = temps24h.length ? Math.max(...temps24h).toFixed(1) : '--';
  const minTemp = temps24h.length ? Math.min(...temps24h).toFixed(1) : '--';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <Link to="/hvac" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="w-4 h-4" /> HVAC Designer
      </Link>

      <PageHeader
        title="Energy Predictor"
        subtitle="ML-driven energy behavior analysis and cost optimization using your real sensor data"
      />

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={selectedBuilding} onValueChange={v => { setSelectedBuilding(v); setPrediction(null); }}>
          <SelectTrigger className="w-56 bg-card border-border">
            <SelectValue placeholder="Select building…" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={analyze} disabled={loading || dataLoading} className="bg-violet-600 hover:bg-violet-700 text-white">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Brain className="w-4 h-4 mr-2" />}
          {loading ? 'Running ML Analysis…' : 'Run Energy Analysis'}
        </Button>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
          <Info className="w-3.5 h-3.5 text-violet-400" />
          Uses Claude Sonnet (premium credits)
        </div>
      </div>

      {/* Live stats strip */}
      {!dataLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Avg Temp (48h)', value: `${avgTemp}°F`, icon: TrendingDown, color: 'text-cyan-400' },
            { label: 'Peak Temp', value: `${maxTemp}°F`, icon: AlertTriangle, color: 'text-orange-400' },
            { label: 'Min Temp', value: `${minTemp}°F`, icon: CheckCircle2, color: 'text-emerald-400' },
            { label: 'Sensor Readings', value: readings.filter(r => selectedBuilding === 'all' || r.building_id === selectedBuilding).length, icon: Zap, color: 'text-violet-400' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                <Icon className={`w-5 h-5 ${s.color} flex-shrink-0`} />
                <div>
                  <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts */}
      {trendData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Temperature Trend (48h)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="temp" stroke="hsl(var(--primary))" fill="url(#tempGrad)" strokeWidth={2} name="Temp °F" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">CO₂ Trend (48h)</h3>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="co2" stroke="#a78bfa" fill="url(#co2Grad)" strokeWidth={2} name="CO₂ ppm" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {loading && (
        <div className="bg-card border border-violet-500/20 rounded-xl flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
          <Brain className="w-12 h-12 text-violet-400 animate-pulse" />
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">ML Analysis Running</p>
            <p className="text-xs mt-1">Processing sensor patterns and generating predictions…</p>
          </div>
        </div>
      )}

      {prediction && !loading && (
        <div className="bg-card border border-violet-500/20 rounded-xl p-6 prose prose-sm prose-invert max-w-none
          [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-2 [&_h2:first-child]:mt-0
          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-violet-300
          [&_strong]:text-foreground
          [&_ul]:my-1 [&_li]:text-muted-foreground [&_li]:text-sm [&_li]:leading-relaxed
          [&_p]:text-muted-foreground [&_p]:text-sm [&_p]:leading-relaxed">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-foreground">ML Energy Analysis</span>
            <span className="text-xs text-muted-foreground ml-auto">Powered by Claude Sonnet</span>
          </div>
          <ReactMarkdown>{prediction}</ReactMarkdown>
        </div>
      )}

      {!prediction && !loading && trendData.length === 0 && !dataLoading && (
        <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground text-center px-8">
          <Brain className="w-12 h-12 opacity-20" />
          <p className="text-sm">No sensor data found. Add buildings and zones with sensor readings to enable ML predictions.</p>
        </div>
      )}
    </div>
  );
}