import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Building2, Thermometer, AlertTriangle, Layers, Wifi, Shield, Smartphone, ChevronRight, ChevronLeft, CheckCircle2, Zap, BarChart3, Clock, Globe, Play, Pause, LayoutDashboard, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  { icon: Building2, title: 'Multi-Building Management', desc: 'Monitor and control unlimited facilities from a single dashboard — offices, warehouses, data centers, and more.' },
  { icon: Thermometer, title: 'Real-Time Climate Control', desc: 'Set cooling and heating setpoints remotely. Full thermostat control with scheduling and override support.' },
  { icon: AlertTriangle, title: 'Intelligent Alerting', desc: 'Instant notifications for high temps, CO₂ spikes, equipment faults, and offline sensors with severity triage.' },
  { icon: Smartphone, title: 'Mobile-First Remote Access', desc: 'Access every facility from your phone. Optimized for field technicians and facility managers on the go.' },
  { icon: BarChart3, title: 'Environmental Analytics', desc: 'Track temperature, humidity, CO₂, air quality, and pressure trends across all zones over time.' },
  { icon: Clock, title: 'Automated Scheduling', desc: 'Create zone schedules by day-of-week with custom setpoints. Save energy automatically after hours.' },
];

const steps = [
  { num: '01', title: 'Add Your Buildings', desc: 'Register each facility with address, floors, and square footage.' },
  { num: '02', title: 'Create Zones', desc: 'Define HVAC zones per floor — offices, server rooms, lobbies, and more.' },
  { num: '03', title: 'Connect & Monitor', desc: 'Sensor readings flow in. View live temperature, humidity, and CO₂ levels.' },
  { num: '04', title: 'Control Remotely', desc: 'Adjust thermostats, resolve alerts, and manage schedules from anywhere.' },
];

const demoSteps = [
  {
    id: 1, title: 'Dashboard Overview', icon: LayoutDashboard, tag: 'Step 1',
    desc: 'Your command center. At a glance, see all active buildings, average temperature and humidity across zones, and any open alerts.',
    highlights: ['KPI cards for instant status at the top', 'Critical alert banners in red', 'Building list with zone counts and alert badges', 'Live zone snapshot grid with per-zone readings'],
    visual: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[['3','Active Buildings','text-cyan-400'],['72°F','Avg Temp','text-amber-400'],['49%','Avg Humidity','text-blue-400'],['3','Open Alerts','text-red-400']].map(([v,l,c],i) => (
            <motion.div key={l} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}} className="bg-muted/60 border border-border rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold font-mono ${c}`}>{v}</div>
              <div className="text-xs text-muted-foreground mt-1">{l}</div>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.35}} className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 animate-pulse" />
          <div className="text-xs text-red-400 font-medium">1 Critical Alert · High Temperature Detected</div>
        </motion.div>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.45}} className="bg-card border border-border rounded-xl overflow-hidden">
          {[['HQ Tower A','4 zones','2 alerts','Active'],['Warehouse B','2 zones','1 alert','Active'],['Research C','2 zones','0 alerts','Maintenance']].map(([n,z,a,s],i) => (
            <motion.div key={n} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.5+i*0.1}} className="flex items-center justify-between px-3 py-2.5 border-b border-border last:border-0">
              <div><div className="text-sm font-medium text-foreground">{n}</div><div className="text-xs text-muted-foreground">{z}</div></div>
              <div className="flex items-center gap-2">
                {a !== '0 alerts' && <span className="text-xs text-red-400 bg-red-500/10 rounded px-1.5 py-0.5">{a}</span>}
                <span className={`text-xs rounded-full px-2 py-0.5 border ${s==='Active'?'text-emerald-400 border-emerald-500/30 bg-emerald-500/10':'text-amber-400 border-amber-500/30 bg-amber-500/10'}`}>{s}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),
  },
  {
    id: 2, title: 'Managing Buildings', icon: Building2, tag: 'Step 2',
    desc: 'Add and manage all your facilities. Each building card shows floor count, zone count, and open alerts. Tap a building to drill into its floor-by-floor zone layout.',
    highlights: ['Search buildings by name, city, or address', 'Add/edit buildings with address and status', 'Click "View Detail" to see zones by floor', 'Delete buildings when no longer needed'],
    visual: (
      <div className="space-y-3">
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2">
          <span className="text-sm">🔍</span><span className="text-sm text-muted-foreground">Search buildings…</span>
        </motion.div>
        {[{name:'HQ Tower A',addr:'Austin, TX',floors:12,zones:4,alerts:2},{name:'Warehouse B',addr:'Austin, TX',floors:2,zones:2,alerts:1}].map((b,i) => (
          <motion.div key={b.name} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.15+i*0.15}} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-primary" /></div>
              <div><div className="font-semibold text-foreground text-sm">{b.name}</div><div className="text-xs text-muted-foreground">{b.addr}</div></div>
              <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">Active</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className="font-bold font-mono text-foreground">{b.floors}</div><div className="text-xs text-muted-foreground">Floors</div></div>
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className="font-bold font-mono text-cyan-400">{b.zones}</div><div className="text-xs text-muted-foreground">Zones</div></div>
              <div className="bg-muted/50 rounded-lg p-2 border border-border"><div className="font-bold font-mono text-red-400">{b.alerts}</div><div className="text-xs text-muted-foreground">Alerts</div></div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 3, title: 'Zone Control Panel', icon: Thermometer, tag: 'Step 3',
    desc: 'For each zone, control the HVAC mode, set cooling and heating targets, configure the fan, and view live sensor readings — all from your phone.',
    highlights: ['Select mode: Cool, Heat, Auto, Fan Only, or Off', 'Drag sliders to set cooling & heating setpoints', 'View live temp, humidity, and CO₂ readouts', 'Enable scheduling per zone for automatic control'],
    visual: (
      <div className="space-y-3">
        <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{delay:0.1}} className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Current Conditions</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[['74°','Temp (°F)','text-cyan-400'],['52%','Humidity','text-blue-400'],['890','CO₂ ppm','text-purple-400']].map(([v,l,c],i) => (
              <motion.div key={l} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2+i*0.1}} className="bg-muted/50 border border-border rounded-lg p-3">
                <div className={`text-xl font-bold font-mono ${c}`}>{v}</div>
                <div className="text-xs text-muted-foreground">{l}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="bg-card border border-border rounded-xl p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">HVAC Mode</div>
          <div className="flex gap-1.5">
            {[['Cool',false],['Heat',false],['Auto',true],['Fan',false],['Off',false]].map(([m,active],i) => (
              <motion.div key={m} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.45+i*0.07}}
                className={cn("flex-1 py-2 text-center text-xs rounded-lg border font-medium", active?'border-cyan-500/40 bg-cyan-500/10 text-cyan-400':'border-border text-muted-foreground')}>{m}</motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.65}} className="bg-card border border-border rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-blue-400 font-medium">Cooling Setpoint</span>
            <span className="text-lg font-bold font-mono text-blue-400">74°F</span>
          </div>
          <div className="h-2 bg-muted rounded-full relative overflow-hidden">
            <motion.div initial={{width:0}} animate={{width:'66%'}} transition={{delay:0.75,duration:0.6,ease:'easeOut'}} className="absolute left-0 top-0 h-2 bg-blue-500/60 rounded-full" />
          </div>
        </motion.div>
      </div>
    ),
  },
  {
    id: 4, title: 'Alert Management', icon: AlertTriangle, tag: 'Step 4',
    desc: 'All alerts in one place. Acknowledge to claim ownership, resolve when fixed. Drill directly into the affected zone from any alert.',
    highlights: ['Tab between Open, Acknowledged, and Resolved', 'Filter by severity: Critical, High, Medium, Low', 'Inline Acknowledge and Resolve buttons', 'Click zone link to jump straight to control panel'],
    visual: (
      <div className="space-y-3">
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="flex gap-1 bg-card border border-border rounded-xl p-1">
          {[['Open','3',true],['Acknowledged','1',false],['Resolved','1',false]].map(([s,n,active]) => (
            <div key={s} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium", active?'bg-primary/15 text-primary border border-primary/20':'text-muted-foreground')}>
              {s} <span className={cn("text-xs w-4 h-4 rounded-full flex items-center justify-center", active?'bg-primary/20 text-primary':'bg-muted')}>{n}</span>
            </div>
          ))}
        </motion.div>
        {[
          {type:'High Temp',sev:'Critical',msg:'Zone temperature threshold exceeded',color:'border-red-500/30',dot:'bg-red-400 animate-pulse',sevCls:'text-red-400'},
          {type:'High CO2',sev:'High',msg:'Conference Center CO₂ at 1100 ppm',color:'border-orange-500/20',dot:'bg-orange-400',sevCls:'text-orange-400'},
        ].map((a,i) => (
          <motion.div key={a.type} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.15}} className={`bg-card border ${a.color} rounded-xl p-3 flex gap-3`}>
            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.dot}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5"><span className="font-semibold text-foreground text-xs">{a.type}</span><span className={`text-xs font-medium ${a.sevCls}`}>{a.sev}</span></div>
              <div className="text-xs text-muted-foreground">{a.msg}</div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-center">Ack</div>
              <div className="text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center">Fix</div>
            </div>
          </motion.div>
        ))}
      </div>
    ),
  },
  {
    id: 5, title: 'Scheduling Zones', icon: Sliders, tag: 'Step 5',
    desc: 'Set weekly schedules per zone. Business hours, after-hours setbacks, weekend modes — fully automated HVAC management that saves energy without manual intervention.',
    highlights: ['Select days of the week (Sun–Sat)', 'Set start and end times per schedule', 'Choose HVAC mode and setpoints per schedule', 'Toggle schedules on/off without deleting them'],
    visual: (
      <div className="space-y-3">
        <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}} transition={{delay:0.1}} className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <span className="text-sm font-semibold text-foreground">Schedules</span>
            <span className="text-xs text-primary">+ Add</span>
          </div>
          {[
            {name:'Business Hours',time:'08:00 – 18:00',mode:'Auto',days:[1,2,3,4,5],active:true},
            {name:'Weekend Setback',time:'09:00 – 15:00',mode:'Fan Only',days:[0,6],active:true},
            {name:'After Hours',time:'18:00 – 08:00',mode:'Off',days:[1,2,3,4,5],active:false},
          ].map((s,i) => (
            <motion.div key={s.name} initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.12}} className="p-3 border-b border-border last:border-0">
              <div className="flex justify-between items-start mb-1.5">
                <div><div className="text-sm font-medium text-foreground">{s.name}</div><div className="text-xs text-muted-foreground">{s.time} · {s.mode}</div></div>
                <div className={cn("w-8 h-5 rounded-full border flex items-center px-0.5", s.active?'bg-primary/20 border-primary/40':'bg-muted border-border')}>
                  <div className={cn("w-3.5 h-3.5 rounded-full", s.active?'bg-primary ml-auto':'bg-muted-foreground')} />
                </div>
              </div>
              <div className="flex gap-0.5">
                {['S','M','T','W','T','F','S'].map((d,idx) => (
                  <span key={idx} className={cn("text-xs w-5 h-5 rounded flex items-center justify-center", s.days.includes(idx)?'bg-primary/20 text-primary':'text-muted-foreground/30')}>{d}</span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    ),
  },
];

const DEMO_INTERVAL = 4000;

export default function Landing() {
  const [demoActive, setDemoActive] = useState(0);
  const [demoDirection, setDemoDirection] = useState(1);
  const [demoPlaying, setDemoPlaying] = useState(true);
  const intervalRef = useRef(null);
  const demoStep = demoSteps[demoActive];
  const DemoIcon = demoStep.icon;

  const navigateDemo = (next) => {
    setDemoDirection(next > demoActive ? 1 : -1);
    setDemoActive(next);
  };

  // Auto-advance: runs whenever demoPlaying changes
  useEffect(() => {
    if (!demoPlaying) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setDemoDirection(1);
      setDemoActive(prev => (prev + 1) % demoSteps.length);
    }, DEMO_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [demoPlaying]);

  // Manual navigation: restart interval from the new step
  const handleNavigate = (next) => {
    navigateDemo(next);
    if (demoPlaying) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setDemoDirection(1);
        setDemoActive(prev => (prev + 1) % demoSteps.length);
      }, DEMO_INTERVAL);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-foreground tracking-tight">HVAC Control</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Live Demo
            </a>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Open App <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-6">
            <Wifi className="w-3 h-3" /> Remote HVAC · Real-Time · Any Facility
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-tight mb-6">
            Professional Building
            <br />
            <span className="text-primary">Climate Management</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
            Monitor temperature, humidity, and air quality across all your facilities in real time.
            Control every thermostat remotely from your phone or desktop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-base font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Activity className="w-4 h-4" /> Launch Dashboard
            </Link>
            <a href="#demo" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl text-base font-medium hover:bg-muted/50 transition-all">
              View Demo <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Feature highlights */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { label: 'Multi-Building', icon: '🏢', color: 'text-cyan-400' },
              { label: 'Zone Control', icon: '🌡️', color: 'text-blue-400' },
              { label: 'Live Monitoring', icon: '📡', color: 'text-amber-400' },
              { label: 'Smart Alerts', icon: '🔔', color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`text-2xl mb-1`}>{s.icon}</div>
                <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile highlight */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-card border border-primary/20 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="p-8 sm:p-10 flex flex-col justify-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                Connect to Any Facility,<br />From Anywhere
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Whether you're on-site, at home, or traveling — your entire HVAC portfolio is accessible from one app. Fully optimized for mobile phones with a responsive interface built for field use.
              </p>
              <ul className="space-y-3">
                {[
                  'Real-time sensor readings on your phone',
                  'Remote thermostat adjustments in seconds',
                  'Push alert notifications for critical issues',
                  'Works on iOS, Android, and any browser',
                ].map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors w-fit">
                <Smartphone className="w-4 h-4" /> Try It Now
              </Link>
            </div>
            <div className="bg-muted/30 border-l border-border p-8 flex items-center justify-center">
              {/* Simulated phone mockup */}
              <div className="w-56 bg-background border-2 border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                <div className="h-6 bg-muted flex items-center justify-center">
                  <div className="w-16 h-1.5 bg-border rounded-full" />
                </div>
                <div className="p-3 space-y-2">
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-3">
                    <div className="text-xs text-primary font-semibold mb-1">⚠ HVAC ALERT</div>
                    <div className="text-xs text-foreground">Zone temperature threshold exceeded</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-2">Your Building · Floor 3</div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-cyan-400">--°</div>
                        <div className="text-xs text-muted-foreground">Temp</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-blue-400">--%</div>
                        <div className="text-xs text-muted-foreground">Humid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-purple-400">---</div>
                        <div className="text-xs text-muted-foreground">CO₂</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Zone Control · Mode</div>
                    <div className="flex gap-1">
                      {['Cool','Heat','Auto'].map((m, i) => (
                        <div key={m} className={`flex-1 py-1 text-xs text-center rounded-lg border ${i === 2 ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' : 'border-border text-muted-foreground'}`}>{m}</div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {['Dashboard','Zones','Alerts'].map(n => (
                      <div key={n} className="bg-muted border border-border rounded-lg py-2 text-center text-xs text-muted-foreground">{n}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Everything You Need</h2>
          <p className="text-muted-foreground">A complete building management system in one platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
              <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Get Started in Minutes</h2>
          <p className="text-muted-foreground">Four simple steps to full remote control of your facilities.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map(({ num, title, desc }) => (
            <div key={num} className="bg-card border border-border rounded-xl p-5 relative">
              <div className="text-4xl font-bold text-primary/20 font-mono mb-3">{num}</div>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs text-primary font-medium mb-4">
            <Play className="w-3 h-3" /> Interactive Demo
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">See It in Action</h2>
          <p className="text-muted-foreground">Walk through the 5 core features of the platform.</p>
          {/* Progress bar */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setDemoPlaying(p => !p)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors border border-border rounded-full px-3 py-1"
            >
              {demoPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Play</>}
            </button>
            <div className="flex gap-1.5 items-center">
              {demoSteps.map((_, i) => (
                <button key={i} onClick={() => handleNavigate(i)}
                  className={cn("h-1.5 rounded-full transition-all duration-300", i === demoActive ? 'bg-primary w-8' : 'w-3 bg-border hover:bg-muted-foreground')} />
              ))}
            </div>
          </div>
        </div>

        {/* Step Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          {demoSteps.map((s, i) => {
            const StepIcon = s.icon;
            return (
              <motion.button
                key={s.id}
                onClick={() => handleNavigate(i)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
                  demoActive === i
                    ? 'bg-primary/15 border-primary/30 text-primary'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground'
                )}
              >
                <StepIcon className="w-3.5 h-3.5" />
                {s.title}
              </motion.button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: Explanation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`left-${demoActive}`}
              initial={{ opacity: 0, x: demoDirection * 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: demoDirection * -30 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="bg-card border border-border rounded-2xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <DemoIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-primary font-medium">{demoStep.tag}</div>
                  <h3 className="text-xl font-bold text-foreground">{demoStep.title}</h3>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6 text-sm">{demoStep.desc}</p>
              <ul className="space-y-3">
                {demoStep.highlights.map((h, i) => (
                  <motion.li key={h} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.08 }} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{h}</span>
                  </motion.li>
                ))}
              </ul>
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <button onClick={() => handleNavigate((demoActive - 1 + demoSteps.length) % demoSteps.length)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <span className="text-xs text-muted-foreground">{demoActive + 1} / {demoSteps.length}</span>
                <button onClick={() => handleNavigate((demoActive + 1) % demoSteps.length)} className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

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
            <AnimatePresence mode="wait">
              <motion.div
                key={`visual-${demoActive}`}
                initial={{ opacity: 0, y: 16 * demoDirection }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 * demoDirection }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
              >
                {demoStep.visual}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 sm:p-12 text-center">
          <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Ready to Take Control?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">Start monitoring your facilities right now. Your dashboard is waiting.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-all">
              <Activity className="w-4 h-4" /> Open Dashboard
            </Link>
            <a href="#demo" className="flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted/50 transition-all">
              Watch Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        HVAC Control Platform · v1.0 · Professional Building Management System
      </footer>
    </div>
  );
}