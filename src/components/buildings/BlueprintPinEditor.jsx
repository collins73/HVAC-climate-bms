import { useState, useRef, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Plus, Thermometer, Droplets, Wind, Gauge, Zap, HelpCircle, Trash2, ChevronLeft, ChevronRight, Download, MapPin, Users, Flame, Activity, BarChart2 } from 'lucide-react';
import OccupancyOverlay from './OccupancyOverlay';
import HeatmapOverlay from './HeatmapOverlay';
import SensorHealthOverlay from './SensorHealthOverlay';
import SensorHistoryDrawer from './SensorHistoryDrawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const SENSOR_ICONS = {
  Temperature: { Icon: Thermometer, color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/40' },
  Humidity:    { Icon: Droplets,    color: 'text-blue-400',  bg: 'bg-blue-500/20 border-blue-500/40' },
  CO2:         { Icon: Wind,        color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/40' },
  Thermostat:  { Icon: Gauge,       color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' },
  'Air Quality':{ Icon: Zap,        color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' },
  Other:       { Icon: HelpCircle,  color: 'text-muted-foreground', bg: 'bg-muted border-border' },
};

function PinDot({ pin, selected, onClick, latestReading }) {
  const cfg = SENSOR_ICONS[pin.sensor_type] || SENSOR_ICONS.Other;
  const { Icon } = cfg;
  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      whileHover={{ scale: 1.2 }}
      onClick={onClick}
      style={{ left: `${pin.x_pct}%`, top: `${pin.y_pct}%` }}
      className={cn(
        "absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shadow-lg transition-all",
        cfg.bg,
        selected ? 'ring-2 ring-white/60 scale-125' : ''
      )}
      title={pin.label}
    >
      <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
      {/* pulse ring for selected */}
      {selected && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-40 bg-white/20" />
      )}
    </motion.button>
  );
}

function PinPopover({ pin, zones, onClose, onDelete, onSave }) {
  const [form, setForm] = useState({ ...pin });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 8 }}
      className="absolute z-20 bg-popover border border-border rounded-xl shadow-xl p-4 w-60"
      style={{ left: `${pin.x_pct}%`, top: `${pin.y_pct}%`, transform: 'translate(-50%, 8px)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-foreground">Edit Sensor Pin</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
      </div>
      <div className="space-y-2">
        <div>
          <Label className="text-xs text-muted-foreground">Label</Label>
          <Input value={form.label} onChange={e => set('label', e.target.value)} className="mt-0.5 h-7 text-xs bg-input border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Sensor Type</Label>
          <Select value={form.sensor_type} onValueChange={v => set('sensor_type', v)}>
            <SelectTrigger className="mt-0.5 h-7 text-xs bg-input border-border"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {Object.keys(SENSOR_ICONS).map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Zone</Label>
          <Select value={form.zone_id || ''} onValueChange={v => set('zone_id', v)}>
            <SelectTrigger className="mt-0.5 h-7 text-xs bg-input border-border"><SelectValue placeholder="Assign zone…" /></SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {zones.map(z => <SelectItem key={z.id} value={z.id} className="text-xs">{z.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Input value={form.notes || ''} onChange={e => set('notes', e.target.value)} className="mt-0.5 h-7 text-xs bg-input border-border" placeholder="Optional…" />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" className="flex-1 h-7 text-xs bg-primary text-primary-foreground" onClick={() => onSave(form)}>Save</Button>
        <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={onDelete}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

export default function BlueprintPinEditor({ building, zones, blueprints }) {
  const [bpIndex, setBpIndex] = useState(0);
  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [addingPin, setAddingPin] = useState(false);
  const [occupancyMode, setOccupancyMode] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState(false);
  const [sensorHealthMode, setSensorHealthMode] = useState(false);
  const [latestReadingsByZone, setLatestReadingsByZone] = useState({});
  const [historyPin, setHistoryPin] = useState(null);
  const [selectedSensors, setSelectedSensors] = useState(new Set());
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [legendScroll, setLegendScroll] = useState(0);
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const legendRef = useRef(null);

  const blueprint = blueprints?.[bpIndex];
  const isImage = (url) => url && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);

  const loadPins = useCallback(async () => {
    if (!building?.id) return;
    const all = await base44.entities.SensorPin.filter({ building_id: building.id });
    setPins(all.filter(p => (p.blueprint_index ?? 0) === bpIndex));
  }, [building?.id, bpIndex]);

  const loadReadings = useCallback(async () => {
    if (!building?.id) return;
    // Fetch recent readings — filter by building_id if available, otherwise get all and filter client-side
    const readings = await base44.entities.EnvironmentReading.list('-timestamp', 200);
    const byZone = {};
    readings
      .filter(r => r.zone_id && (!r.building_id || r.building_id === building.id))
      .forEach(r => {
        if (!byZone[r.zone_id] || r.timestamp > byZone[r.zone_id].timestamp) {
          byZone[r.zone_id] = r;
        }
      });
    setLatestReadingsByZone(byZone);
  }, [building?.id]);

  useEffect(() => { loadPins(); setSelectedPin(null); }, [loadPins]);
  useEffect(() => { loadReadings(); }, [loadReadings]);
  useEffect(() => { if (sensorHealthMode) loadReadings(); }, [sensorHealthMode]);

  const handleImageClick = async (e) => {
    if (!addingPin) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x_pct = ((e.clientX - rect.left) / rect.width) * 100;
    const y_pct = ((e.clientY - rect.top) / rect.height) * 100;
    const newPin = await base44.entities.SensorPin.create({
      building_id: building.id,
      blueprint_index: bpIndex,
      label: 'New Sensor',
      sensor_type: 'Temperature',
      x_pct: parseFloat(x_pct.toFixed(2)),
      y_pct: parseFloat(y_pct.toFixed(2)),
    });
    setPins(p => [...p, newPin]);
    setSelectedPin(newPin.id);
    setAddingPin(false);
  };

  const handleMouseDown = (e) => {
    if (addingPin || occupancyMode || heatmapMode || sensorHealthMode) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e) => {
    if (addingPin || occupancyMode || heatmapMode || sensorHealthMode) return;
    e.preventDefault();
    const newZoom = Math.max(0.5, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleSavePin = async (form) => {
    await base44.entities.SensorPin.update(form.id, form);
    setPins(p => p.map(pin => pin.id === form.id ? form : pin));
    setSelectedPin(null);
  };

  const handleDeletePin = async (pinId) => {
    await base44.entities.SensorPin.delete(pinId);
    setPins(p => p.filter(pin => pin.id !== pinId));
    setSelectedPin(null);
  };

  const toggleSensorSelection = (pinId) => {
    setSelectedSensors(prev => {
      const next = new Set(prev);
      next.has(pinId) ? next.delete(pinId) : next.add(pinId);
      return next;
    });
  };

  const scrollLegend = (direction) => {
    if (!legendRef.current) return;
    const scrollAmount = 300;
    const newScroll = Math.max(0, legendScroll + (direction === 'left' ? -scrollAmount : scrollAmount));
    setLegendScroll(newScroll);
    legendRef.current.scrollTo({ left: newScroll, behavior: 'smooth' });
  };

  const handleBulkDelete = async () => {
    await Promise.all(Array.from(selectedSensors).map(id => base44.entities.SensorPin.delete(id)));
    setPins(p => p.filter(pin => !selectedSensors.has(pin.id)));
    setSelectedSensors(new Set());
  };

  if (!blueprints?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <MapPin className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-sm text-muted-foreground">No blueprints uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1">Edit the building to upload floor plans</p>
      </div>
    );
  }

  return (
    <>
    <div className="space-y-4">
      {/* Blueprint selector tabs */}
      {blueprints.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {blueprints.map((bp, i) => (
            <button
              key={i}
              onClick={() => { setBpIndex(i); setSelectedPin(null); }}
              className={cn(
                "flex-shrink-0 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all",
                bpIndex === i
                  ? 'bg-primary/15 border-primary/30 text-primary'
                  : 'bg-card border-border text-muted-foreground hover:text-foreground'
              )}
            >
              {bp.name}{bp.floor != null ? ` · Floor ${bp.floor}` : ''}
            </button>
          ))}
        </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>{pins.length} sensor{pins.length !== 1 ? 's' : ''} pinned</span>
        </div>
        <div className="flex items-center gap-2">
          {blueprint && (
            <a href={blueprint.file_url || blueprint.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg px-2.5 py-1.5 transition-colors">
              <Download className="w-3 h-3" /> Download
            </a>
          )}
          <Button
            size="sm"
            onClick={() => { setHeatmapMode(v => !v); setOccupancyMode(false); setSensorHealthMode(false); setAddingPin(false); setSelectedPin(null); }}
            className={cn("gap-1.5 h-7 text-xs transition-all", heatmapMode
              ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Flame className="w-3 h-3" /> {heatmapMode ? 'Heat Map ON' : 'Heat Map'}
          </Button>
          <Button
            size="sm"
            onClick={() => { setOccupancyMode(v => !v); setHeatmapMode(false); setSensorHealthMode(false); setAddingPin(false); setSelectedPin(null); }}
            className={cn("gap-1.5 h-7 text-xs transition-all", occupancyMode
              ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-3 h-3" /> {occupancyMode ? 'Occupancy ON' : 'Occupancy'}
          </Button>
          <Button
            size="sm"
            onClick={() => { setSensorHealthMode(v => !v); setOccupancyMode(false); setHeatmapMode(false); setAddingPin(false); setSelectedPin(null); }}
            className={cn("gap-1.5 h-7 text-xs transition-all", sensorHealthMode
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
              : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            )}
          >
            <Activity className="w-3 h-3" /> {sensorHealthMode ? 'Sensor Health ON' : 'Sensor Health'}
          </Button>
          {!occupancyMode && !heatmapMode && !sensorHealthMode && (
            <Button
              size="sm"
              onClick={() => { setAddingPin(v => !v); setSelectedPin(null); }}
              className={cn("gap-1.5 h-7 text-xs transition-all", addingPin
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {addingPin ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Sensor Pin</>}
            </Button>
          )}
        </div>
      </div>

      {addingPin && (
        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-amber-400">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          Click anywhere on the blueprint to place a sensor pin
        </motion.div>
      )}

      {/* Blueprint canvas */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div
          ref={containerRef}
          className={cn("relative overflow-hidden bg-black/5", 
            addingPin || occupancyMode || heatmapMode || sensorHealthMode ? '' : 'cursor-grab active:cursor-grabbing'
          )}
          style={{ height: '600px' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0',
              transition: isPanning ? 'none' : 'transform 0.1s',
            }}
          >
        {isImage(blueprint?.url) ? (
          <div
            ref={imgRef}
            className={cn("relative select-none", !occupancyMode && !sensorHealthMode && addingPin ? 'cursor-crosshair' : 'cursor-default')}
            onClick={!occupancyMode && !sensorHealthMode ? handleImageClick : undefined}
          >
            <img src={blueprint.file_url || blueprint.url} alt={blueprint.name} className="w-full h-auto block" draggable={false} />

            {/* Sensor pins — hidden in overlay modes */}
            {!occupancyMode && !sensorHealthMode && (
              <>
                <AnimatePresence>
                  {pins.map(pin => (
                    <PinDot
                      key={pin.id}
                      pin={pin}
                      selected={selectedPin === pin.id}
                      onClick={e => { e.stopPropagation(); setSelectedPin(selectedPin === pin.id ? null : pin.id); setAddingPin(false); }}
                    />
                  ))}
                </AnimatePresence>
                <AnimatePresence>
                  {selectedPin && (() => {
                    const pin = pins.find(p => p.id === selectedPin);
                    if (!pin) return null;
                    return (
                      <PinPopover
                        key={pin.id}
                        pin={pin}
                        zones={zones}
                        onClose={() => setSelectedPin(null)}
                        onSave={handleSavePin}
                        onDelete={() => handleDeletePin(pin.id)}
                      />
                    );
                  })()}
                </AnimatePresence>
              </>
            )}

            {/* Occupancy overlay */}
            {occupancyMode && (
              <AnimatePresence>
                <OccupancyOverlay zones={zones} pins={pins} />
              </AnimatePresence>
            )}

            {/* Heatmap overlay */}
            {heatmapMode && (
              <HeatmapOverlay zones={zones} pins={pins} imgRef={imgRef} />
            )}

            {/* Sensor health overlay */}
            {sensorHealthMode && (
              <SensorHealthOverlay pins={pins} zones={zones} latestReadingsByZone={latestReadingsByZone} />
            )}
          </div>
        ) : (
           <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
             <MapPin className="w-10 h-10 opacity-30" />
             <p className="text-sm">PDF blueprints cannot be pinned — use image files (PNG, JPG)</p>
             {blueprint && (
               <a href={blueprint.file_url || blueprint.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                 <Download className="w-4 h-4" /> Open PDF
               </a>
             )}
           </div>
         )}
          </div>
        </div>
      </div>

      {/* Pin legend */}
      {pins.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sensor Legend</div>
            {selectedSensors.size > 0 && (
              <Button
                size="sm"
                onClick={handleBulkDelete}
                className="h-6 text-xs bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
              >
                Delete {selectedSensors.size}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => scrollLegend('left')}
              className="h-8 w-8 flex-shrink-0 border-border"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <div
              ref={legendRef}
              className="flex-1 overflow-x-hidden"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="flex gap-2">
            {pins.map(pin => {
              const cfg = SENSOR_ICONS[pin.sensor_type] || SENSOR_ICONS.Other;
              const { Icon } = cfg;
              const zone = zones.find(z => z.id === pin.zone_id);
              const isSelected = selectedSensors.has(pin.id);
              return (
                <div
                  key={pin.id}
                  className={cn(
                    "flex items-center gap-2.5 p-2 rounded-lg border transition-all",
                    isSelected ? 'bg-red-500/10 border-red-500/30' : 'border-border hover:border-primary/20'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSensorSelection(pin.id)}
                    className="w-4 h-4 rounded cursor-pointer flex-shrink-0"
                  />
                  <button
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                    onClick={() => setSelectedPin(selectedPin === pin.id ? null : pin.id)}
                  >
                    <div className={cn("w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0", cfg.bg)}>
                      <Icon className={cn("w-3 h-3", cfg.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{pin.label}</div>
                      <div className="text-xs text-muted-foreground">{pin.sensor_type}{zone ? ` · ${zone.name}` : ''}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setHistoryPin(pin)}
                    className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                    title="View 24h history"
                  >
                    <BarChart2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeletePin(pin.id)}
                    className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete sensor"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
              </div>
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => scrollLegend('right')}
              className="h-8 w-8 flex-shrink-0 border-border"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>

      {/* Sensor history drawer */}
      {historyPin && (
        <SensorHistoryDrawer
          pin={historyPin}
          zone={zones.find(z => z.id === historyPin.zone_id)}
          onClose={() => setHistoryPin(null)}
        />
      )}
    </>
  );
}