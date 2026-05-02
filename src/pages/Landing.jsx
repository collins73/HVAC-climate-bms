import { Link } from 'react-router-dom';
import { Activity, Building2, Thermometer, AlertTriangle, Layers, Wifi, Shield, Smartphone, ChevronRight, CheckCircle2, Zap, BarChart3, Clock, Globe } from 'lucide-react';

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

export default function Landing() {
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
            <Link to="/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Live Demo
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
            <Link to="/demo" className="w-full sm:w-auto flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl text-base font-medium hover:bg-muted/50 transition-all">
              View Demo <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Live Stats Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { label: 'Buildings Online', val: '3', color: 'text-cyan-400' },
              { label: 'Zones Monitored', val: '8', color: 'text-blue-400' },
              { label: 'Avg Temperature', val: '72°F', color: 'text-amber-400' },
              { label: 'Open Alerts', val: '3', color: 'text-red-400' },
            ].map(s => (
              <div key={s.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`text-2xl font-bold font-mono ${s.color}`}>{s.val}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
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
                    <div className="text-xs text-primary font-semibold mb-1">⚠ CRITICAL ALERT</div>
                    <div className="text-xs text-foreground">Warehouse North: 83°F</div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-2">HQ Tower A · Floor 3</div>
                    <div className="flex justify-between items-center">
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-cyan-400">74°</div>
                        <div className="text-xs text-muted-foreground">Temp</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-blue-400">52%</div>
                        <div className="text-xs text-muted-foreground">Humid</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold font-mono text-purple-400">890</div>
                        <div className="text-xs text-muted-foreground">CO₂</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3">
                    <div className="text-xs text-muted-foreground mb-1">Server Room · Mode</div>
                    <div className="flex gap-1">
                      {['Cool','Heat','Auto'].map((m, i) => (
                        <div key={m} className={`flex-1 py-1 text-xs text-center rounded-lg border ${i === 0 ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-border text-muted-foreground'}`}>{m}</div>
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
            <Link to="/demo" className="flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium hover:bg-muted/50 transition-all">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        HVAC Control Platform · v1.0 · Professional Building Management System
      </footer>
    </div>
  );
}