import { useState } from 'react';
import { Users, UserX, HelpCircle, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const OCCUPANCY_CONFIG = {
  Occupied:   { color: 'bg-emerald-500/30 border-emerald-400/60', dot: 'bg-emerald-400', text: 'text-emerald-300', label: 'Occupied',   icon: Users },
  Unoccupied: { color: 'bg-slate-500/25 border-slate-400/40',     dot: 'bg-slate-400',   text: 'text-slate-300',  label: 'Unoccupied', icon: UserX },
  Unknown:    { color: 'bg-amber-500/20 border-amber-400/40',     dot: 'bg-amber-400',   text: 'text-amber-300',  label: 'Unknown',    icon: HelpCircle },
};

// Each zone pin gets a bubble placed at the centroid of all its sensor pins
export default function OccupancyOverlay({ zones, pins }) {
  const [hoveredZone, setHoveredZone] = useState(null);

  // Build a map: zone_id -> average pin position
  const zonePositions = {};
  pins.forEach(pin => {
    if (!pin.zone_id) return;
    if (!zonePositions[pin.zone_id]) zonePositions[pin.zone_id] = { xs: [], ys: [] };
    zonePositions[pin.zone_id].xs.push(pin.x_pct);
    zonePositions[pin.zone_id].ys.push(pin.y_pct);
  });

  const zoneMarkers = zones
    .filter(z => zonePositions[z.id])
    .map(z => {
      const pos = zonePositions[z.id];
      const x = pos.xs.reduce((a, b) => a + b, 0) / pos.xs.length;
      const y = pos.ys.reduce((a, b) => a + b, 0) / pos.ys.length;
      const status = z.occupancy_status || 'Unknown';
      const cfg = OCCUPANCY_CONFIG[status];
      return { zone: z, x, y, status, cfg };
    });

  if (zoneMarkers.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground text-center max-w-xs">
          No zones are pinned on this blueprint yet.<br />Assign sensor pins to zones to see occupancy overlays.
        </div>
      </div>
    );
  }

  return (
    <>
      {zoneMarkers.map(({ zone, x, y, status, cfg }) => {
        const Icon = cfg.icon;
        const isHovered = hoveredZone === zone.id;
        const energySaving = zone.energy_save_mode && status === 'Unoccupied';

        return (
          <motion.div
            key={zone.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: `${x}%`, top: `${y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            onMouseEnter={() => setHoveredZone(zone.id)}
            onMouseLeave={() => setHoveredZone(null)}
          >
            {/* Zone bubble */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={cn(
                "flex items-center gap-1.5 rounded-full border-2 px-3 py-1.5 shadow-lg backdrop-blur-sm cursor-default select-none",
                cfg.color
              )}
            >
              <Icon className={cn("w-3.5 h-3.5 flex-shrink-0", cfg.text)} />
              <span className={cn("text-xs font-semibold whitespace-nowrap", cfg.text)}>{zone.name}</span>
              {energySaving && <Zap className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
            </motion.div>

            {/* Tooltip on hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30 bg-popover border border-border rounded-xl shadow-xl p-3 w-44 pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
                    <span className="text-xs font-semibold text-foreground">{zone.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Status</span>
                      <span className={cfg.text}>{status}</span>
                    </div>
                    {zone.occupancy_count != null && status === 'Occupied' && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Occupants</span>
                        <span className="text-foreground font-mono">{zone.occupancy_count}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground">{zone.zone_type}</span>
                    </div>
                    {energySaving && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-emerald-400 bg-emerald-500/10 rounded px-2 py-1">
                        <Zap className="w-3 h-3" /> Energy saving active
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 flex items-center gap-3">
        {Object.entries(OCCUPANCY_CONFIG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}