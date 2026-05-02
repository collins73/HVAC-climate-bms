import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Building2, Layers, AlertTriangle, Activity, ChevronRight, Thermometer, MapPin, TrendingUp, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import StatusBadge from '@/components/shared/StatusBadge';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function Home() {
  const [buildings, setBuildings] = useState([]);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Building.list(),
      base44.entities.Zone.list(),
      base44.entities.Alert.filter({ status: 'Open' }),
    ]).then(([b, z, a]) => {
      setBuildings(b);
      setZones(z);
      setAlerts(a);
      setLoading(false);
    });
  }, []);

  const activeBuildings = buildings.filter(b => b.status === 'Active');
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical');

  const stats = [
    { label: 'Active Buildings', value: activeBuildings.length, icon: Building2, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
    { label: 'Total Zones', value: zones.length, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Open Alerts', value: alerts.length, icon: AlertTriangle, color: alerts.length > 0 ? 'text-red-400' : 'text-emerald-400', bg: alerts.length > 0 ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Critical Issues', value: criticalAlerts.length, icon: ShieldCheck, color: criticalAlerts.length > 0 ? 'text-orange-400' : 'text-emerald-400', bg: criticalAlerts.length > 0 ? 'bg-orange-500/10 border-orange-500/20' : 'bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-20">
          <motion.div {...fadeUp(0)} className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="text-xs text-primary font-medium uppercase tracking-wider">HVAC Control Platform</div>
              <div className="text-xs text-muted-foreground">Environmental Management System</div>
            </div>
          </motion.div>
          <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Intelligent Building<br />
            <span className="text-primary">Climate Control</span>
          </motion.h1>
          <motion.p {...fadeUp(0.15)} className="text-muted-foreground text-lg mb-8 max-w-xl">
            Monitor temperature, humidity, and air quality across all your facilities — from a single dashboard.
          </motion.p>
          <motion.div {...fadeUp(0.22)} className="flex flex-wrap gap-3">
            <Link to="/dashboard" className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <Activity className="w-4 h-4" /> Open Dashboard
            </Link>
            <Link to="/buildings" className="flex items-center gap-2 bg-card border border-border text-foreground px-5 py-2.5 rounded-xl font-medium hover:border-primary/40 transition-all">
              <Building2 className="w-4 h-4" /> Manage Buildings
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <motion.div {...fadeUp(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`bg-card border rounded-xl p-4 flex items-center gap-4 ${bg}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold font-mono ${color}`}>{loading ? '—' : value}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Critical alert banner */}
        {criticalAlerts.length > 0 && (
          <motion.div {...fadeUp(0.15)} className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />
              <div>
                <span className="text-red-400 font-semibold text-sm">{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''} require attention</span>
              </div>
            </div>
            <Link to="/alerts" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium">
              View <ChevronRight className="w-3 h-3" />
            </Link>
          </motion.div>
        )}

        {/* Buildings grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Your Facilities</h2>
            <Link to="/buildings" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => <div key={i} className="h-40 bg-card border border-border rounded-xl animate-pulse" />)}
            </div>
          ) : buildings.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
              <p className="text-sm text-muted-foreground mb-4">No buildings added yet</p>
              <Link to="/buildings" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Add Your First Building
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {buildings.map((b, i) => {
                const zoneCount = zones.filter(z => z.building_id === b.id).length;
                const alertCount = alerts.filter(a => a.building_id === b.id).length;
                return (
                  <motion.div key={b.id} {...fadeUp(i * 0.06)}>
                    <Link to={`/buildings/${b.id}`} className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group">
                      {/* Cover image */}
                      <div className="h-36 bg-muted/50 relative overflow-hidden">
                        {b.cover_image_url ? (
                          <img src={b.cover_image_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-muted-foreground opacity-20" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <StatusBadge status={b.status} />
                        </div>
                        {alertCount > 0 && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-lg px-2 py-0.5">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-red-400 font-medium">{alertCount}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="font-semibold text-foreground mb-1">{b.name}</div>
                        {(b.city || b.address) && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <MapPin className="w-3 h-3" /> {b.city || b.address}
                          </div>
                        )}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {zoneCount} zones</span>
                          {b.floors && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {b.floors} floors</span>}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <motion.div {...fadeUp(0.2)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: '/zones', icon: Thermometer, label: 'Zone Control', desc: 'Manage HVAC settings per zone', color: 'text-cyan-400' },
            { to: '/alerts', icon: AlertTriangle, label: 'Alert Center', desc: 'Review and resolve active alerts', color: 'text-red-400' },
            { to: '/dashboard', icon: TrendingUp, label: 'Analytics', desc: 'Temperature & CO₂ trend charts', color: 'text-purple-400' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors">
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="font-semibold text-foreground text-sm">{label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}