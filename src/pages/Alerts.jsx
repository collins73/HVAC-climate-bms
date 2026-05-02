import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Plus, Search, Check, CheckCheck, ExternalLink, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import AlertModal from '@/components/alerts/AlertModal';
import { cn } from '@/lib/utils';

const SEVERITY_COLORS = {
  Critical: 'text-red-400',
  High: 'text-orange-400',
  Medium: 'text-amber-400',
  Low: 'text-blue-400',
};

const STATUS_TABS = ['Open', 'Acknowledged', 'Resolved'];

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [zones, setZones] = useState([]);
  const [statusTab, setStatusTab] = useState('Open');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [a, b, z] = await Promise.all([
      base44.entities.Alert.list('-created_date'),
      base44.entities.Building.list(),
      base44.entities.Zone.list(),
    ]);
    setAlerts(a); setBuildings(b); setZones(z);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const counts = STATUS_TABS.reduce((acc, s) => {
    acc[s] = alerts.filter(a => a.status === s).length;
    return acc;
  }, {});

  const filtered = alerts.filter(a => {
    if (a.status !== statusTab) return false;
    if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const building = buildings.find(b => b.id === a.building_id);
      const zone = zones.find(z => z.id === a.zone_id);
      return (
        a.alert_type?.toLowerCase().includes(q) ||
        a.message?.toLowerCase().includes(q) ||
        building?.name?.toLowerCase().includes(q) ||
        zone?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const acknowledgeAlert = async (alert) => {
    const user = await base44.auth.me();
    await base44.entities.Alert.update(alert.id, { status: 'Acknowledged', acknowledged_by: user?.email });
    load();
  };

  const resolveAlert = async (alert) => {
    await base44.entities.Alert.update(alert.id, { status: 'Resolved', resolved_at: new Date().toISOString() });
    load();
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Alerts"
        subtitle="Monitor and manage system alerts"
        actions={
          <Button onClick={() => setModal(true)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2">
            <Plus className="w-4 h-4" /> Log Alert
          </Button>
        }
      />

      {/* Status Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatusTab(s)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              statusTab === s
                ? 'bg-primary/15 text-primary border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {s}
            <span className={cn(
              "text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold",
              statusTab === s ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
            )}>
              {counts[s]}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search alerts…" className="pl-9 bg-card border-border text-foreground w-60" />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40 bg-card border-border text-foreground">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Severities</SelectItem>
            {['Critical','High','Medium','Low'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Alert List */}
      {loading ? (
        <div className="text-muted-foreground text-center py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No {statusTab.toLowerCase()} alerts</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const building = buildings.find(b => b.id === a.building_id);
            const zone = zones.find(z => z.id === a.zone_id);
            return (
              <div key={a.id} className={cn(
                "bg-card border rounded-xl p-4 flex items-start gap-4 transition-all",
                a.severity === 'Critical' ? 'border-red-500/30' : a.severity === 'High' ? 'border-orange-500/20' : 'border-border'
              )}>
                <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", {
                  'bg-red-400 animate-pulse': a.severity === 'Critical',
                  'bg-orange-400': a.severity === 'High',
                  'bg-amber-400': a.severity === 'Medium',
                  'bg-blue-400': a.severity === 'Low',
                })} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start flex-wrap gap-2 mb-1">
                    <span className="font-semibold text-foreground text-sm">{a.alert_type}</span>
                    <StatusBadge status={a.severity} />
                    <StatusBadge status={a.status} />
                  </div>
                  {a.message && <p className="text-sm text-muted-foreground mb-2">{a.message}</p>}
                  <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                    {building && (
                      <span className="flex items-center gap-1">
                        <span className="text-muted-foreground/50">Building:</span> {building.name}
                      </span>
                    )}
                    {zone && (
                      <Link to={`/zones/${zone.id}`} className="flex items-center gap-1 text-primary hover:text-primary/80">
                        <ExternalLink className="w-3 h-3" /> {zone.name}
                      </Link>
                    )}
                    <span>{a.created_date ? new Date(a.created_date).toLocaleString() : ''}</span>
                    {a.acknowledged_by && <span>Acked by {a.acknowledged_by}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status === 'Open' && (
                    <button
                      onClick={() => acknowledgeAlert(a)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-colors"
                    >
                      <Check className="w-3 h-3" /> Acknowledge
                    </button>
                  )}
                  {a.status !== 'Resolved' && (
                    <button
                      onClick={() => resolveAlert(a)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <CheckCheck className="w-3 h-3" /> Resolve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AlertModal open={modal} onClose={() => setModal(false)} buildings={buildings} zones={zones} onSaved={load} />
    </div>
  );
}