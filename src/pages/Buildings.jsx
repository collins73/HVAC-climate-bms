import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Search, Building2, ChevronRight, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import BuildingModal from '@/components/buildings/BuildingModal';

export default function Buildings() {
  const [buildings, setBuildings] = useState([]);
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [b, z, a] = await Promise.all([
      base44.entities.Building.list(),
      base44.entities.Zone.list(),
      base44.entities.Alert.filter({ status: 'Open' }),
    ]);
    setBuildings(b); setZones(z); setAlerts(a);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = buildings.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.city?.toLowerCase().includes(search.toLowerCase()) ||
    b.address?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this building?')) return;
    await base44.entities.Building.delete(id);
    load();
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Buildings"
        subtitle={`${buildings.length} buildings managed`}
        actions={
          <Button onClick={() => { setEditing(null); setModal(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Add Building
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search buildings…" className="pl-9 bg-card border-border text-foreground" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-muted-foreground text-center py-16">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? 'No buildings match your search' : 'No buildings added yet'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => {
            const zoneCount = zones.filter(z => z.building_id === b.id).length;
            const alertCount = alerts.filter(a => a.building_id === b.id).length;
            return (
              <div key={b.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all group">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{b.name}</h3>
                        <StatusBadge status={b.status} />
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditing(b); setModal(true); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {(b.address || b.city) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />
                      {[b.address, b.city, b.state].filter(Boolean).join(', ')}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-muted/50 rounded-lg p-2 text-center border border-border">
                      <div className="text-lg font-bold text-foreground font-mono">{b.floors || '--'}</div>
                      <div className="text-xs text-muted-foreground">Floors</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center border border-border">
                      <div className="text-lg font-bold text-cyan-400 font-mono">{zoneCount}</div>
                      <div className="text-xs text-muted-foreground">Zones</div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-2 text-center border border-border">
                      <div className={`text-lg font-bold font-mono ${alertCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{alertCount}</div>
                      <div className="text-xs text-muted-foreground">Alerts</div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-4">
                  <Link to={`/buildings/${b.id}`} className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                    View Detail <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <BuildingModal open={modal} onClose={() => setModal(false)} building={editing} onSaved={load} />
    </div>
  );
}