import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  Building2, Layers, AlertTriangle, Activity,
  ChevronRight, Thermometer, MapPin, TrendingUp, ShieldCheck,
  ArrowRight
} from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';

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

  return (
    <div className="min-h-screen bg-background text-foreground p-6 space-y-8">

      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Welcome back — here's a summary of your facilities.</p>
      </div>

      {/* Critical alerts banner */}
      {!loading && criticalAlerts.length > 0 && (
        <Link to="/alerts" className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-3 hover:bg-red-500/15 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 animate-pulse flex-shrink-0" />
            <span className="text-red-400 font-semibold text-sm">
              {criticalAlerts.length} critical alert{criticalAlerts.length > 1 ? 's' : ''} need attention
            </span>
          </div>
          <span className="text-red-400 text-xs flex items-center gap-1 font-medium">
            View alerts <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Buildings', value: activeBuildings.length, total: buildings.length, icon: Building2, color: 'text-cyan-400', ring: 'border-cyan-500/20 bg-cyan-500/5' },
          { label: 'Total Zones', value: zones.length, icon: Layers, color: 'text-blue-400', ring: 'border-blue-500/20 bg-blue-500/5' },
          { label: 'Open Alerts', value: alerts.length, icon: AlertTriangle, color: alerts.length > 0 ? 'text-amber-400' : 'text-emerald-400', ring: alerts.length > 0 ? 'border-amber-500/20 bg-amber-500/5' : 'border-emerald-500/20 bg-emerald-500/5' },
          { label: 'Critical Issues', value: criticalAlerts.length, icon: ShieldCheck, color: criticalAlerts.length > 0 ? 'text-red-400' : 'text-emerald-400', ring: criticalAlerts.length > 0 ? 'border-red-500/20 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5' },
        ].map(({ label, value, total, icon: Icon, color, ring }) => (
          <div key={label} className={`bg-card border rounded-xl p-5 flex items-center gap-4 ${ring}`}>
            <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <div className={`text-3xl font-bold font-mono leading-none ${color}`}>
                {loading ? '—' : value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{label}</div>
              {total !== undefined && !loading && (
                <div className="text-xs text-muted-foreground/60">{total} total</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Buildings grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground">Your Facilities</h2>
          <Link to="/buildings" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium">
            All buildings <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : buildings.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-12 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-25" />
            <p className="text-sm text-muted-foreground mb-4">No buildings added yet</p>
            <Link to="/buildings" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
              Add Your First Building
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {buildings.map(b => {
              const zoneCount = zones.filter(z => z.building_id === b.id).length;
              const alertCount = alerts.filter(a => a.building_id === b.id).length;
              return (
                <Link
                  key={b.id}
                  to={`/buildings/${b.id}`}
                  className="block bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group"
                >
                  {/* Cover image or placeholder */}
                  <div className="h-32 bg-muted/40 relative overflow-hidden">
                    {b.cover_image_url ? (
                      <img src={b.cover_image_url} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={b.status} />
                    </div>
                    {alertCount > 0 && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-500/20 border border-red-500/30 rounded-md px-1.5 py-0.5">
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                        <span className="text-xs text-red-400 font-medium">{alertCount} alert{alertCount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="font-semibold text-foreground text-sm mb-1">{b.name}</div>
                    {(b.city || b.address) && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        {[b.address, b.city, b.state].filter(Boolean).join(', ')}
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {zoneCount} zone{zoneCount !== 1 ? 's' : ''}
                      </span>
                      {b.floors && (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" /> {b.floors} floor{b.floors !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick nav */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { to: '/dashboard', icon: Activity, label: 'Live Dashboard', desc: 'Real-time environment monitoring', color: 'text-cyan-400' },
            { to: '/zones', icon: Thermometer, label: 'Zone Control', desc: 'Adjust HVAC settings per zone', color: 'text-blue-400' },
            { to: '/alerts', icon: AlertTriangle, label: 'Alert Center', desc: `${alerts.length} open alert${alerts.length !== 1 ? 's' : ''}`, color: alerts.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 hover:bg-muted/20 transition-all group flex items-center gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground text-sm">{label}</div>
                <div className="text-xs text-muted-foreground truncate">{desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}