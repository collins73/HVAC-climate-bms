import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Building2, Thermometer, Droplets, AlertTriangle, ChevronRight, Activity, Layers, TrendingUp } from 'lucide-react';
import KPICard from '@/components/shared/KPICard';
import StatusBadge from '@/components/shared/StatusBadge';
import SensorReadout from '@/components/shared/SensorReadout';
import PageHeader from '@/components/shared/PageHeader';
import ZoneTrendChart from '@/components/dashboard/ZoneTrendChart';
import EnergyMonitor from '@/components/dashboard/EnergyMonitor';
import ExportReportButton from '@/components/dashboard/ExportReportButton';

export default function Dashboard() {
  const [buildings, setBuildings] = useState([]);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [thermostatSettings, setThermostatSettings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Building.list(),
      base44.entities.Zone.list(),
      base44.entities.Alert.list(),
      base44.entities.EnvironmentReading.list('-timestamp', 200),
      base44.entities.ThermostatSetting.list(),
    ]).then(([b, z, a, r, ts]) => {
      setBuildings(b);
      setZones(z);
      setAlerts(a);
      setReadings(r);
      setThermostatSettings(ts);
      setLoading(false);
    });
  }, []);

  const activeBuildings = buildings.filter(b => b.status === 'Active');
  const openAlerts = alerts.filter(a => a.status === 'Open');
  const criticalAlerts = openAlerts.filter(a => a.severity === 'Critical');

  // Latest reading per zone
  const latestByZone = {};
  readings.forEach(r => {
    if (!latestByZone[r.zone_id] || r.timestamp > latestByZone[r.zone_id].timestamp) {
      latestByZone[r.zone_id] = r;
    }
  });

  const temps = Object.values(latestByZone).map(r => r.temperature).filter(Boolean);
  const humids = Object.values(latestByZone).map(r => r.humidity).filter(Boolean);
  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '--';
  const avgHumid = humids.length ? (humids.reduce((a, b) => a + b, 0) / humids.length).toFixed(1) : '--';

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Environmental Control Overview"
        actions={
          <div className="flex items-center gap-3">
            <ExportReportButton buildings={buildings} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border rounded-lg px-3 py-1.5">
              <Activity className="w-3 h-3 text-primary animate-pulse-slow" />
              Live Monitoring
            </div>
          </div>
        }
      />

      {/* Critical Alert Banner */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <span className="text-red-400 font-semibold text-sm">{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</span>
              <span className="text-red-400/70 text-sm ml-2">{criticalAlerts[0]?.message || criticalAlerts[0]?.alert_type}</span>
            </div>
          </div>
          <Link to="/alerts" className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium">
            View Alerts <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Active Buildings" value={activeBuildings.length} subtitle={`${buildings.length} total`} icon={Building2} color="cyan" />
        <KPICard title="Avg Temperature" value={avgTemp !== '--' ? `${avgTemp}°F` : '--'} subtitle={`${zones.length} zones monitored`} icon={Thermometer} color="amber" />
        <KPICard title="Avg Humidity" value={avgHumid !== '--' ? `${avgHumid}%` : '--'} subtitle="Relative humidity" icon={Droplets} color="blue" />
        <KPICard title="Open Alerts" value={openAlerts.length} subtitle={`${criticalAlerts.length} critical`} icon={AlertTriangle} color={openAlerts.length > 0 ? 'red' : 'emerald'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Building Overview */}
        <div className="lg:col-span-1 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Buildings</h2>
            <Link to="/buildings" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {loading ? (
              <div className="p-5 text-muted-foreground text-sm text-center">Loading...</div>
            ) : buildings.length === 0 ? (
              <div className="p-5 text-muted-foreground text-sm text-center">No buildings yet</div>
            ) : buildings.slice(0, 6).map(b => {
              const zoneCount = zones.filter(z => z.building_id === b.id).length;
              const alertCount = openAlerts.filter(a => a.building_id === b.id).length;
              return (
                <Link key={b.id} to={`/buildings/${b.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{b.name}</div>
                      <div className="text-xs text-muted-foreground">{b.city || b.address || 'No location'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">{zoneCount} zones</span>
                    {alertCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center font-bold">{alertCount}</span>
                    )}
                    <StatusBadge status={b.status} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Zone Snapshot Grid */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Zone Environment Snapshot</h2>
            <Link to="/zones" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="col-span-2 p-4 text-muted-foreground text-sm text-center">Loading...</div>
            ) : zones.length === 0 ? (
              <div className="col-span-2 p-4 text-muted-foreground text-sm text-center">No zones yet</div>
            ) : zones.slice(0, 8).map(z => {
              const reading = latestByZone[z.id];
              const building = buildings.find(b => b.id === z.building_id);
              const zoneAlerts = openAlerts.filter(a => a.zone_id === z.id);
              return (
                <Link key={z.id} to={`/zones/${z.id}`} className="bg-muted/30 border border-border rounded-lg p-3 hover:border-primary/30 hover:bg-muted/50 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-sm font-medium text-foreground">{z.name}</div>
                      <div className="text-xs text-muted-foreground">{building?.name} · Floor {z.floor || '?'}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {zoneAlerts.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center">{zoneAlerts.length}</span>
                      )}
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{z.zone_type}</span>
                    </div>
                  </div>
                  <SensorReadout
                    temperature={reading?.temperature}
                    humidity={reading?.humidity}
                    co2_ppm={reading?.co2_ppm}
                    compact
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      {/* Energy Monitor */}
      <EnergyMonitor
        zones={zones}
        thermostatSettings={thermostatSettings}
        latestByZone={latestByZone}
        loading={loading}
      />

      {/* Zone Trend Charts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h2 className="font-semibold text-foreground text-sm">Temperature & CO₂ Trends by Zone</h2>
          </div>
          <Link to="/zones" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
            Manage zones <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center text-muted-foreground text-sm">Loading…</div>
        ) : zones.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <Layers className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No zones yet — add buildings and zones to see trends</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {zones.map(zone => (
              <ZoneTrendChart key={zone.id} zone={zone} readings={readings} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}