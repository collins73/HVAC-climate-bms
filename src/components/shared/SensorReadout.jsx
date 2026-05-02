import { Thermometer, Droplets, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

function getTempColor(temp) {
  if (!temp) return 'text-muted-foreground';
  if (temp > 80) return 'text-red-400';
  if (temp > 76) return 'text-orange-400';
  if (temp < 65) return 'text-blue-400';
  return 'text-cyan-400';
}

function getHumidityColor(h) {
  if (!h) return 'text-muted-foreground';
  if (h > 70 || h < 30) return 'text-orange-400';
  return 'text-blue-400';
}

export default function SensorReadout({ temperature, humidity, co2_ppm, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className={cn("flex items-center gap-1 font-mono font-medium", getTempColor(temperature))}>
          <Thermometer className="w-3.5 h-3.5" />
          {temperature != null ? `${temperature}°F` : '--'}
        </span>
        <span className={cn("flex items-center gap-1 font-mono", getHumidityColor(humidity))}>
          <Droplets className="w-3.5 h-3.5" />
          {humidity != null ? `${humidity}%` : '--'}
        </span>
        {co2_ppm != null && (
          <span className="flex items-center gap-1 font-mono text-muted-foreground">
            <Wind className="w-3.5 h-3.5" />
            {co2_ppm} ppm
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
        <Thermometer className={cn("w-4 h-4 mx-auto mb-1", getTempColor(temperature))} />
        <div className={cn("text-xl font-bold font-mono", getTempColor(temperature))}>
          {temperature != null ? `${temperature}°` : '--'}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">Temp (°F)</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
        <Droplets className={cn("w-4 h-4 mx-auto mb-1", getHumidityColor(humidity))} />
        <div className={cn("text-xl font-bold font-mono", getHumidityColor(humidity))}>
          {humidity != null ? `${humidity}%` : '--'}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">Humidity</div>
      </div>
      <div className="bg-muted/50 rounded-lg p-3 text-center border border-border">
        <Wind className="w-4 h-4 mx-auto mb-1 text-purple-400" />
        <div className="text-xl font-bold font-mono text-purple-400">
          {co2_ppm != null ? co2_ppm : '--'}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">CO₂ (ppm)</div>
      </div>
    </div>
  );
}