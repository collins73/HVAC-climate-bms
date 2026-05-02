import { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

// Fetch occupancy history for the past 24 hours (from Zone update timestamps + occupancy_count)
// We derive density from zone occupancy_count at their pin positions

function gaussianBlob(ctx, x, y, radius, intensity) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0,   `rgba(255,255,255,${intensity})`);
  gradient.addColorStop(0.4, `rgba(255,255,255,${intensity * 0.6})`);
  gradient.addColorStop(1,   'rgba(255,255,255,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

// Map grayscale intensity (0-255) to heat color: blue → cyan → green → yellow → red
function intensityToColor(v) {
  // v: 0–255
  if (v < 64)  return [0,   0,   Math.round(128 + v * 2)]; // dark blue → blue
  if (v < 128) return [0,   Math.round((v - 64) * 4), 255]; // blue → cyan
  if (v < 192) return [Math.round((v - 128) * 4), 255, Math.round(255 - (v - 128) * 4)]; // cyan → yellow
  return [255, Math.round(255 - (v - 192) * 4), 0]; // yellow → red
}

export default function HeatmapOverlay({ zones, pins, imgRef }) {
  const canvasRef = useRef(null);
  const [hourFilter, setHourFilter] = useState(null); // null = current / all
  const [hourlyData, setHourlyData] = useState({}); // hour -> { zoneId -> count }
  const [loading, setLoading] = useState(true);

  // Build hourly occupancy from Zone occupancy_count + occupancy_last_updated
  useEffect(() => {
    // We use current zone data + simulate past 24-hour pattern based on zone type
    // Real sensors would populate this from a time-series entity
    const data = {};
    for (let h = 0; h < 24; h++) {
      data[h] = {};
      zones.forEach(z => {
        const baseCount = z.occupancy_count || 0;
        // Weight by hour (simulate typical office occupancy pattern)
        const pattern = typicalOccupancyFactor(z.zone_type, h);
        data[h][z.id] = Math.round(baseCount > 0 ? baseCount * pattern : (z.occupancy_status === 'Occupied' ? 5 * pattern : 0));
      });
    }
    setHourlyData(data);
    setLoading(false);
  }, [zones]);

  useEffect(() => {
    renderHeatmap();
  }, [hourlyData, hourFilter, pins, zones, imgRef]);

  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    const img = imgRef?.current;
    if (!canvas || !img) return;

    const w = img.offsetWidth;
    const h = img.offsetHeight;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    // Determine which hours to use
    const hours = hourFilter !== null ? [hourFilter] : Object.keys(hourlyData).map(Number);
    if (hours.length === 0 || Object.keys(hourlyData).length === 0) return;

    // Collect zone positions (centroid of pins per zone)
    const zonePositions = {};
    pins.forEach(pin => {
      if (!pin.zone_id) return;
      if (!zonePositions[pin.zone_id]) zonePositions[pin.zone_id] = { xs: [], ys: [] };
      zonePositions[pin.zone_id].xs.push(pin.x_pct);
      zonePositions[pin.zone_id].ys.push(pin.y_pct);
    });

    // Find max count for normalization
    let maxCount = 1;
    hours.forEach(hr => {
      Object.values(hourlyData[hr] || {}).forEach(c => { if (c > maxCount) maxCount = c; });
    });

    // Draw alpha (intensity) layer on offscreen canvas
    const offscreen = document.createElement('canvas');
    offscreen.width  = w;
    offscreen.height = h;
    const offCtx = offscreen.getContext('2d');
    offCtx.clearRect(0, 0, w, h);

    zones.forEach(zone => {
      const pos = zonePositions[zone.id];
      if (!pos) return;
      const cx = (pos.xs.reduce((a, b) => a + b, 0) / pos.xs.length / 100) * w;
      const cy = (pos.ys.reduce((a, b) => a + b, 0) / pos.ys.length / 100) * h;

      // Average count across selected hours
      const avg = hours.reduce((sum, hr) => sum + (hourlyData[hr]?.[zone.id] || 0), 0) / hours.length;
      const intensity = Math.min(avg / maxCount, 1.0) * 0.85 + (avg > 0 ? 0.05 : 0);

      // Radius proportional to sqft if available, otherwise fixed
      const sqft = zone.sqft || 500;
      const radius = Math.min(Math.max(Math.sqrt(sqft) * (w / 1000) * 6, 40), w * 0.25);

      gaussianBlob(offCtx, cx, cy, radius, intensity);
    });

    // Colorize using pixel manipulation
    const imageData = offCtx.getImageData(0, 0, w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i]; // red channel holds grayscale intensity
      if (alpha < 5) { data[i + 3] = 0; continue; }
      const [r, g, b] = intensityToColor(alpha);
      data[i]     = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.round(alpha * 0.75); // semi-transparent
    }
    offCtx.putImageData(imageData, 0, 0);

    ctx.drawImage(offscreen, 0, 0);

    // Draw zone labels on main canvas
    zones.forEach(zone => {
      const pos = zonePositions[zone.id];
      if (!pos) return;
      const cx = (pos.xs.reduce((a, b) => a + b, 0) / pos.xs.length / 100) * w;
      const cy = (pos.ys.reduce((a, b) => a + b, 0) / pos.ys.length / 100) * h;
      const avg = hours.reduce((sum, hr) => sum + (hourlyData[hr]?.[zone.id] || 0), 0) / hours.length;

      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.beginPath();
      ctx.roundRect(cx - 40, cy - 12, 80, 22, 6);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `bold 11px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${zone.name} (${Math.round(avg)})`, cx, cy);
      ctx.restore();
    });
  };

  const HOURS = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (h) => {
    if (h === 0) return '12am';
    if (h < 12) return `${h}am`;
    if (h === 12) return '12pm';
    return `${h - 12}pm`;
  };

  if (loading) return null;

  return (
    <>
      {/* Canvas overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Hour scrubber */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute bottom-3 left-3 right-3 z-20 bg-background/85 backdrop-blur-sm border border-border rounded-xl p-3"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground">Hour Filter</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-primary font-mono">{hourFilter !== null ? formatHour(hourFilter) : 'All Day Avg'}</span>
            {hourFilter !== null && (
              <button onClick={() => setHourFilter(null)} className="text-xs text-muted-foreground hover:text-foreground px-2 py-0.5 rounded border border-border">Reset</button>
            )}
          </div>
        </div>
        <div className="flex gap-0.5 overflow-x-auto">
          {HOURS.map(h => {
            // Intensity indicator below each hour
            const avgCount = zones.reduce((s, z) => s + (hourlyData[h]?.[z.id] || 0), 0);
            const maxTotal = Math.max(1, ...HOURS.map(hh => zones.reduce((s, z) => s + (hourlyData[hh]?.[z.id] || 0), 0)));
            const barH = Math.round((avgCount / maxTotal) * 16);
            return (
              <button
                key={h}
                onClick={() => setHourFilter(hourFilter === h ? null : h)}
                className={cn_simple(
                  "flex flex-col items-center flex-shrink-0 px-1 py-1 rounded transition-all",
                  hourFilter === h ? 'bg-primary/20' : 'hover:bg-muted/40'
                )}
                title={formatHour(h)}
              >
                <div className="w-4 flex flex-col items-center justify-end" style={{ height: 16 }}>
                  <div style={{ height: barH, width: 10 }}
                    className={`rounded-sm ${hourFilter === h ? 'bg-primary' : 'bg-primary/40'}`}
                  />
                </div>
                <span className="text-[9px] text-muted-foreground mt-0.5 leading-none">{h % 6 === 0 ? formatHour(h) : ''}</span>
              </button>
            );
          })}
        </div>

        {/* Color scale legend */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground">Low</span>
          <div className="flex-1 h-2 rounded-full" style={{
            background: 'linear-gradient(to right, #0000aa, #00ffff, #ffff00, #ff0000)'
          }} />
          <span className="text-xs text-muted-foreground">High</span>
        </div>
      </motion.div>
    </>
  );
}

// Typical occupancy pattern multiplier by zone type and hour
function typicalOccupancyFactor(zoneType, hour) {
  const type = zoneType || 'Office';
  const patterns = {
    Office:           [0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.3,0.8,0.9,0.9,0.85,0.7,0.85,0.9,0.9,0.8,0.5,0.2,0.1,0.05,0.0,0.0,0.0],
    Lobby:            [0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.5,0.9,0.7,0.5,0.6,0.8,0.6,0.5,0.7,0.9,0.7,0.3,0.1,0.0,0.0,0.0,0.0],
    'Conference Room':[0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.5,0.8,0.9,0.7,0.4,0.7,0.9,0.8,0.5,0.2,0.0,0.0,0.0,0.0,0.0,0.0],
    Warehouse:        [0.0,0.0,0.0,0.0,0.0,0.1,0.3,0.7,0.9,0.9,0.9,0.8,0.7,0.8,0.9,0.8,0.6,0.3,0.1,0.0,0.0,0.0,0.0,0.0],
    'Server Room':    [1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0,1.0],
    Retail:           [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.3,0.6,0.8,0.9,0.9,0.8,0.8,0.9,0.9,0.7,0.4,0.2,0.1,0.0,0.0,0.0],
    Residential:      [0.5,0.6,0.7,0.7,0.6,0.5,0.4,0.3,0.2,0.2,0.2,0.2,0.2,0.2,0.2,0.3,0.4,0.6,0.7,0.8,0.8,0.7,0.6,0.5],
    Other:            [0.0,0.0,0.0,0.0,0.0,0.0,0.1,0.3,0.7,0.8,0.8,0.7,0.6,0.7,0.8,0.7,0.5,0.2,0.1,0.0,0.0,0.0,0.0,0.0],
  };
  return (patterns[type] || patterns.Other)[hour] ?? 0;
}

function cn_simple(...classes) {
  return classes.filter(Boolean).join(' ');
}