import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Building2, Layers, Thermometer, AlertTriangle, ChevronRight, ChevronLeft, CheckCircle2, Play, LayoutDashboard, Wifi, Bell, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  {
    id: 1,
    title: 'Dashboard Overview',
    icon: LayoutDashboard,
    tag: 'Step 1',
    desc: 'Your command center. At a glance, see all active buildings, average temperature and humidity across zones, and any open alerts that need attention.',
    highlights: [
      'KPI cards for instant status at the top',
      'Critical alert banners in red — never miss urgent issues',
      'Building list with zone counts and alert badges',
      'Live zone snapshot grid with per-zone readings',
    ],
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[['3', 'Active Buildings', 'text-cyan-400'], ['72°F', 'Avg Temp', 'text-amber-400'], ['49%', 'Avg Humidity', 'text-blue-400'], ['3', 'Open Alerts', 'text-red-400']].map(([v, l, c]) => (
            <div key={l} className="bg-muted/60 border border-border rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold font-mono ${c}`}>{v}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="text-xs text-red-400 font-medium">1 Critical Alert · Warehouse North: 83°F</div>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {[['HQ Tower A', '4 zones', '2 alerts', 'Active'], ['Warehouse B', '2 zones', '1 alert', 'Active'], ['Research C', '2 zones', '0 alerts', 'Maintenance']].map(([n, z, a, s]) => (
            <div key={n} className="flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium text-foreground">{n}</div>
                <div className="text-xs text-muted-foreground">{z}</div>
              </div>
              <div className="flex items-center gap-2">
                {a !== '0 alerts' && <span className="text-xs text-red-400 bg-red-500/10 rounded px-1.5 py-0.5">{a}</span>}
                <span className={`text-xs rounded-full px-2 py-0.5 border ${s === 'Active' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>{s}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: 'Managing Buildings',
    icon: Building2,
    tag: 'Step 2',
    desc: 'Add and manage all your facilities. Each building card shows floor count, zone count, and open alerts. Tap a building to drill into its floor-by-floor zone layout.',
    highlights: [
      'Search buildings by name, city, or address',
      'Add/edit buildings with address and status',
      'Click "View Detail" to see zones by floor',
      'Delete buildings when no longer needed',
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <div className="w-4 h-4 text-muted-foreground">🔍</div>
          <span className="text-sm text-muted-foreground">Search buildings…</span>
        </div>
        {[
          { name: 'HQ Tower A', addr: 'Austin, TX', floors: 12, zones: 4, alerts: 2, status: 'Active' },
          { name: 'Warehouse B', addr: 'Austin, TX', floors: 2, zones: 2, alerts: 1, status: 'Active' },
        ].map(b => (
          <div key={b.name} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{b.name}</div>
                <div className="text-xs text-muted-foreground">{b.addr}</div>
              </div>
              <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">{b.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className="font-bold font-mono text-foreground">{b.floors}</div><div className="text-xs text-muted-foreground">Floors</div></div>
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className="font-bold font-mono text-cyan-400">{b.zones}</div><div className="text-xs text-muted-foreground">Zones</div></div>
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className={`font-bold font-mono ${b.alerts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{b.alerts}</div><div className="text-xs text-muted-foreground">Alerts</div></div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 3,
    title: 'Zone Control Panel',
    icon: Thermometer,
    tag: 'Step 3',
    desc: 'The heart of the app. For each zone, control the HVAC mode, set cooling and heating targets, configure the fan, and view live sensor readings — all from your phone.',
    highlights: [
      'Select mode: Cool, Heat, Auto, Fan Only, or Off',
      'Drag sliders to set cooling & heating setpoints',
      'View live temp, humidity, and CO₂ readouts',
      'Enable scheduling per zone for automatic control',
    ],
    visual: (
      <div className="space-y-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Current Conditions</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 border border-border rounded-lg p-3"><div className="text-xl font-bold font-mono text-cyan-400">74°</div><div className="text-xs text-muted-foreground">Temp (°F)</div></div>
            <div className="bg-muted/50 border border-border rounded-lg p-3"><div className="text-xl font-bold font-mono text-blue-400">52%</div><div className="text-xs text-muted-foreground">Humidity</div></div>
            <div className="bg-muted/50 border border-border rounded-lg p-3"><div className="text-xl font-bold font-mono text-purple-400">890</div><div className="text-xs text-muted-foreground">CO₂ ppm</div></div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">HVAC Mode</div>
          <div className="flex gap-1.5">
            {[['Cool','blue'], ['Heat','orange'], ['Auto','cyan'], ['Fan','purple'], ['Off','muted']].map(([m, c]) => (
              <div key={m} className={cn("flex-1 py-2 text-center text-xs rounded-lg border font-medium",
                m === 'Auto' ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-border text-muted-foreground'
              )}>{m}</div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-blue-400 font-medium">Cooling Setpoint</span>
            <span className="text-lg font-bold font-mono text-blue-400">74°F</span>
          </div>
          <div className="h-2 bg-muted rounded-full relative">
            <div className="absolute left-0 top-0 h-2 w-2/3 bg-blue-500/60 rounded-full" />
            <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-400 border-2 border-background shadow" style={{ left: '63%' }} />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: 'Alert Management',
    icon: AlertTriangle,
    tag: 'Step 4',
    desc: 'All alerts in one place, organized by status. Acknowledge to claim ownership, resolve when fixed. Drill directly into the affected zone from any alert.',
    highlights: [
      'Tab between Open, Acknowledged, and Resolved',
      'Filter by severity: Critical, High, Medium, Low',
      'Inline Acknowledge and Resolve buttons',
      'Click zone link to jump straight to control panel',
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {[['Open', '3', true], ['Acknowledged', '1', false], ['Resolved', '1', false]].map(([s, n, active]) => (
            <div key={s} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all",
              active ? 'bg-primary/15 text-primary border border-primary/20' : 'text-muted-foreground'
            )}>
              {s} <span className={cn("text-xs w-4 h-4 rounded-full flex items-center justify-center", active ? 'bg-primary/20 text-primary' : 'bg-muted')}>{n}</span>
            </div>
          ))}
        </div>
        {[
          { type: 'High Temp', sev: 'Critical', msg: 'Warehouse North: 83°F — Immediate action', color: 'border-red-500/30', dot: 'bg-red-400 animate-pulse', sevCls: 'text-red-400' },
          { type: 'High CO2', sev: 'High', msg: 'Conference Center CO₂ at 1100 ppm', color: 'border-orange-500/20', dot: 'bg-orange-400', sevCls: 'text-orange-400' },
        ].map(a => (
          <div key={a.type} className={`bg-card border ${a.color} rounded-xl p-3 flex gap-3`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold text-foreground text-xs">{a.type}</span>
                <span className={`text-xs font-medium ${a.sevCls}`}>{a.sev}</span>
              </div>
              <div className="text-xs text-muted-foreground">{a.msg}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center">Ack</div>
              <div className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">Fix</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    title: 'Scheduling Zones',
    icon: Sliders,
    tag: 'Step 5',
    desc: 'Set weekly schedules per zone. Business hours, after-hours setbacks, weekend modes — fully automated HVAC management that saves energy without manual intervention.',
    highlights: [
      'Select days of the week (Sun–Sat)',
      'Set start and end times per schedule',
      'Choose HVAC mode and setpoints per schedule',
      'Toggle schedules on/off without deleting them',
    ],
    visual: (
      <div className="space-y-3">
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Schedules</span>
            <span className="text-xs text-primary">+ Add</span>
          </div>
          {[
            { name: 'Business Hours', time: '08:00 – 18:00', mode: 'Auto', days: [1,2,3,4,5], active: true },
            { name: 'Weekend Setback', time: '09:00 – 15:00', mode: 'Fan Only', days: [0,6], active: true },
            { name: 'After Hours', time: '18:00 – 08:00', mode: 'Off', days: [1,2,3,4,5], active: false },
          ].map(s => (
            <div key={s.name} className="p-3 border-b border-border last:border-0">
              <div className="flex justify-between items-start mb-1.5">
                <div>
                  <div className="text-sm font-medium text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.time} · {s.mode}</div>
                </div>
                <div className={cn("w-8 h-5 rounded-full border flex items-center px-0.5 transition-all", s.active ? 'bg-primary/20 border-primary/40' : 'bg-muted border-border')}>
                  <div className={cn("w-3.5 h-3.5 rounded-full transition-all", s.active ? 'bg-primary ml-auto' : 'bg-muted-foreground')} />
                </div>
              </div>
              <div className="flex gap-0.5">
                {['S','M','T','W','T','F','S'].map((d, i) => (
                  <span key={i} className={cn("text-xs w-5 h-5 rounded flex items-center justify-center", s.days.includes(i) ? 'bg-primary/20 text-primary' : 'text-muted-foreground/30')}>{d}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Demo() {
  const [active, setActive] = useState(0);
  const step = steps[active];
  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground tracking-tight">HVAC Control</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            Open App <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-4">
            <Play className="w-3 h-3" /> Interactive Demo
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">How It Works</h1>
          <p className="text-muted-foreground">Walk through the 5 core features of the HVAC Control platform.</p>
        </div>

        {/* Step Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {steps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActive(i)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                  active === i
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/60'
                )}
              >
                <StepIcon className="w-3.5 h-3.5" />
                {s.title}
              </button>
            );
          })}
        </div>

        {/* Main Demo Area */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Explanation */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-xs text-primary font-medium">{step.tag}</div>
                <h2 className="text-xl font-bold text-foreground">{step.title}</h2>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{step.desc}</p>
            <ul className="space-y-3">
              {step.highlights.map(h => (
                <li key={h} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{h}</span>
                </li>
              ))}
            </ul>

            {/* Nav */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <button
                onClick={() => setActive(i => Math.max(0, i - 1))}
                disabled={active === 0}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <button key={i} onClick={() => setActive(i)} className={cn("w-2 h-2 rounded-full transition-all", i === active ? 'bg-primary w-5' : 'bg-border hover:bg-muted-foreground')} />
                ))}
              </div>
              {active < steps.length - 1 ? (
                <button onClick={() => setActive(i => i + 1)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link to="/dashboard" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium">
                  Launch App <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Right: Visual */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/60" />
                <div className="w-2 h-2 rounded-full bg-amber-500/60" />
                <div className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>
              Live Preview
            </div>
            {step.visual}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground mb-4">Ready to manage your facilities?</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            <Activity className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}