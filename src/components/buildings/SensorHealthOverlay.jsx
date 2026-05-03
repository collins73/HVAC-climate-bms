import { useState } from 'react';
import { Thermometer, Droplets, Wind, Gauge, Zap, HelpCircle, AlertTriangle, CheckCircle2, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const SENSOR_ICONS = {
  Temperature:   { Icon: Thermometer, color: 'text-cyan-400' },
  Humidity:      { Icon: Droplets,    color: 'text-blue-400' },
  CO2:           { Icon: Wind,        color: 'text-purple-400' },
  Thermostat:    { Icon: Gauge,       color: 'text-amber-400' },
  'Air Quality': { Icon: Zap,         color: 'text-emerald-400' },
  Other:         { Icon: HelpCircle,  color: 'text-muted-foreground' },
};

// Thresholds for "healthy" values
const THRESHOLDS = {
  temperature: { low: 60, high: 85 },
  humidity:    { low: 20, high: 70 },
  co2_ppm:     { low: 0,  high: 1000 },
  air_quality_index: { low: 0, high: 100 },
};

function getSensorHealth(pin, latestReading) {
  if (!latestReading) return 'offline';
  const age = Date.now() - new Date(latestReading.timestamp).getTime();
  if (age > 30 * 60 * 1000) return 'stale'; // > 30 min
  const t = latestReading.temperature;
  const h = latestReading.humidity;
  const c = latestReading.co2_ppm;
  if (
    (t != null && (t < THRESHOLDS.temperature.low || t > THRESHOLDS.temperature.high)) ||
    (h != null && (h < THRESHOLDS.humidity.low    || h > THRESHOLDS.humidity.high)) ||
    (c != null && c > THRESHOLDS.co2_ppm.high)
  ) return 'warning';
  return 'healthy';
}

const HEALTH_CONFIG = {
  healthy: { bg: 'bg-emerald-500/25 border-emerald-400/60', dot: 'bg-emerald-400', ring: 'ring-emerald-400/40', Icon: CheckCircle2, text: 'text-emerald-300', label: 'Healthy' },
  warning: { bg: 'bg-amber-500/25 border-amber-400/60',   dot: 'bg-amber-400',   ring: 'ring-amber-400/40',   Icon: AlertTriangle, text: 'text-amber-300',  label: 'Warning' },
  stale:   { bg: 'bg-orange-500/20 border-orange-400/50', dot: 'bg-orange-400',  ring: 'ring-orange-400/40',  Icon: AlertTriangle, text: 'text-orange-300', label: 'Stale Data' },
  offline: { bg: 'bg-slate-500/25 border-slate-400/40',   dot: 'bg-slate-400',   ring: 'ring-slate-400/40',   Icon: WifiOff,       text: 'text-slate-400',  label: 'No Data' },
};

function ReadingRow({ label, value, unit, threshold }) {
  if (value == null) return null;
  const isHigh = threshold && value > threshold.high;
  const isLow  = threshold && value < threshold.low;
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-mono font-medium', isHigh || isLow ? 'text-amber-400' : 'text-foreground')}>
        {value}{unit}
        {(isHigh || isLow) && <AlertTriangle className="inline w-2.5 h-2.5 ml-0.5 mb-0.5 text-amber-400" />}
      </span>
    </div>
  );
}

export default function SensorHealthOverlay({ pins, zones, latestReadingsByZone }) {
  const [hoveredPin, setHoveredPin] = useState(null);

  if (!pins?.length) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-background/80 backdrop-blur-sm border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground text-center max-w-xs">
          No sensor pins on this blueprint yet.<br />Add sensor pins and assign them to zones to see live health overlays.
        </div>
      </div>
    );
  }

  return (
    <>
      {pins.map(pin => {
        const reading = latestReadingsByZone?.[pin.zone_id];
        const health = getSensorHealth(pin, reading);
        const hcfg = HEALTH_CONFIG[health];
        const scfg = SENSOR_ICONS[pin.sensor_type] || SENSOR_ICONS.Other;
        const SIcon = scfg.Icon;
        const HIcon = hcfg.Icon;
        const zone = zones.find(z => z.id === pin.zone_id);
        const isHovered = hoveredPin === pin.id;

        return (
          <motion.div
            key={pin.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            style={{ left: `${pin.x_pct}%`, top: `${pin.y_pct}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
            onMouseEnter={() => setHoveredPin(pin.id)}
            onMouseLeave={() => setHoveredPin(null)}
          >
            {/* Pin bubble */}
            <motion.div
              whileHover={{ scale: 1.15 }}
              className={cn(
                'flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 shadow-lg backdrop-blur-sm cursor-default select-none',
                hcfg.bg
              )}
            >
              <SIcon className={cn('w-3 h-3 flex-shrink-0', scfg.color)} />
              <span className={cn('text-xs font-semibold whitespace-nowrap', hcfg.text)}>
                {pin.sensor_type === 'Temperature' && reading?.temperature != null
                  ? `${reading.temperature}°F`
                  : pin.sensor_type === 'Humidity' && reading?.humidity != null
                  ? `${reading.humidity}%`
                  : pin.sensor_type === 'CO2' && reading?.co2_ppm != null
                  ? `${reading.co2_ppm} ppm`
                  : pin.label}
              </span>
              <HIcon className={cn('w-3 h-3 flex-shrink-0', hcfg.text)} />
            </motion.div>

            {/* Tooltip */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 z-30 bg-popover border border-border rounded-xl shadow-xl p-3 w-48 pointer-events-none"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn('w-2 h-2 rounded-full', hcfg.dot)} />
                    <span className="text-xs font-semibold text-foreground truncate">{pin.label}</span>
                  </div>
                  <div className="space-y-1 mb-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Type</span>
                      <span className="text-foreground">{pin.sensor_type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Health</span>
                      <span className={hcfg.text}>{hcfg.label}</span>
                    </div>
                    {zone && (
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Zone</span>
                        <span className="text-foreground truncate max-w-[80px]">{zone.name}</span>
                      </div>
                    )}
                  </div>
                  {reading ? (
                    <div className="border-t border-border pt-2 space-y-1">
                      <ReadingRow label="Temp" value={reading.temperature} unit="°F" threshold={THRESHOLDS.temperature} />
                      <ReadingRow label="Humidity" value={reading.humidity} unit="%" threshold={THRESHOLDS.humidity} />
                      <ReadingRow label="CO₂" value={reading.co2_ppm} unit=" ppm" threshold={THRESHOLDS.co2_ppm} />
                      {reading.air_quality_index != null && (
                        <ReadingRow label="AQI" value={reading.air_quality_index} unit="" threshold={THRESHOLDS.air_quality_index} />
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-border pt-2 text-xs text-muted-foreground">No readings available</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 flex items-center gap-3 flex-wrap">
        {Object.entries(HEALTH_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}