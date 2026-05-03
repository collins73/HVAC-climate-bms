import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Database, ChevronDown, Check } from 'lucide-react';

/**
 * BuildingImporter — dropdown to pick a building from the DB and auto-fill form fields.
 *
 * Props:
 *   onImport(building, zones) — called with the selected building record and its zones array
 *   accentColor — 'cyan' | 'violet' | 'amber' | 'emerald'
 */
export default function BuildingImporter({ onImport, accentColor = 'cyan' }) {
  const [buildings, setBuildings] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState(null);

  const accentCls = {
    cyan:    'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10',
    violet:  'border-violet-500/30 text-violet-400 hover:bg-violet-500/10',
    amber:   'border-amber-500/30 text-amber-400 hover:bg-amber-500/10',
    emerald: 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10',
  }[accentColor];

  useEffect(() => {
    base44.entities.Building.list().then(setBuildings);
  }, []);

  const handleSelect = async (building) => {
    setLoading(true);
    setOpen(false);
    const zones = await base44.entities.Zone.filter({ building_id: building.id });
    setImported(building.name);
    onImport(building, zones);
    setLoading(false);
  };

  if (buildings.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-slate-900/60 text-xs font-medium transition-colors ${accentCls}`}
      >
        {imported ? <Check className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
        {loading ? 'Loading…' : imported ? `Loaded: ${imported}` : 'Import from Building'}
        {!imported && <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-10 overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-800">
            <p className="text-xs text-slate-400">Select a building to auto-fill form</p>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-slate-800">
            {buildings.map(b => (
              <button
                key={b.id}
                onClick={() => handleSelect(b)}
                className="w-full text-left px-3 py-2.5 hover:bg-slate-800 transition-colors"
              >
                <div className="text-sm text-white font-medium">{b.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {[b.city, b.state].filter(Boolean).join(', ')} · {b.total_sqft?.toLocaleString() || '?'} sqft · {b.floors || '?'} floors
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}