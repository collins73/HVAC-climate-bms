import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Layers, Thermometer, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import SensorReadout from '@/components/shared/SensorReadout';
import ZoneModal from '@/components/zones/ZoneModal';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [readings, setReadings] = useState([]);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [z, b, a, r] = await Promise.all([
      base44.entities.Zone.list(),
      base44.entities.Building.list(),
      base44.entities.Alert.filter({ status: 'Open' }),
      base44.entities.EnvironmentReading.list('-timestamp', 200),
    ]);
    setZones(z); setBuildings(b); setAlerts(a); setReadings(r);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const latestByZone = {};
  readings.forEach(r => {
    if (!latestByZone[r.zone_id] || r.timestamp > latestByZone[r.zone_id].timestamp) {
      latestByZone[r.zone_id] = r;
    }
  });

  const filtered = zones.filter(z => {
    const matchSearch = z.name?.toLowerCase().includes(search.toLowerCase()) || z.zone_type?.toLowerCase().includes(search.toLowerCase());
    const matchBuilding = buildingFilter === 'all' || z.building_id === buildingFilter;
    return matchSearch && matchBuilding;
  });

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return;
    await base44.entities.Zone.delete(id);
    load();
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Zones"
        subtitle={`${zones.length} zones across ${buildings.length} buildings`}
        actions={
          <Button onClick={() => { setEditing(null); setModal(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Add Zone
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search zones…" className="pl-9 bg-card border-border text-foreground w-60" />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-48 bg-card border-border text-foreground"><SelectValue placeholder="All buildings" /></SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-muted-foreground text-center py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search || buildingFilter !== 'all' ? 'No zones match your filters' : 'No zones added yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(z => {
            const reading = latestByZone[z.id];
            const building = buildings.find(b => b.id === z.building_id);
            const zoneAlerts = alerts.filter(a => a.zone_id === z.id);
            return (
              <div key={z.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{z.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{building?.name || 'Unknown building'} · Floor {z.floor || '?'}</div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                      {zoneAlerts.length > 0 && (
                        <div className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 rounded px-1.5 py-0.5">
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                          <span className="text-xs text-red-400">{zoneAlerts.length}</span>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5">{z.zone_type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <StatusBadge status={z.status} />
                    {z.sqft && <span className="text-xs text-muted-foreground">{z.sqft.toLocaleString()} sq ft</span>}
                  </div>
                  <SensorReadout temperature={reading?.temperature} humidity={reading?.humidity} co2_ppm={reading?.co2_ppm} compact />
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  <Link to={`/zones/${z.id}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                    <Thermometer className="w-3.5 h-3.5" /> Control
                  </Link>
                  <button onClick={() => { setEditing(z); setModal(true); }} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(z.id)} className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/30 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ZoneModal open={modal} onClose={() => setModal(false)} zone={editing} buildings={buildings} onSaved={load} />
    </div>
  );
}