import { cn } from '@/lib/utils';

const configs = {
  Active:       { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  Inactive:     { cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30',       dot: 'bg-slate-400' },
  Maintenance:  { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400' },
  Open:         { cls: 'bg-red-500/15 text-red-400 border-red-500/30',             dot: 'bg-red-400' },
  Acknowledged: { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400' },
  Resolved:     { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  Critical:     { cls: 'bg-red-500/20 text-red-400 border-red-500/40',             dot: 'bg-red-400 animate-pulse' },
  High:         { cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30',    dot: 'bg-orange-400' },
  Medium:       { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30',       dot: 'bg-amber-400' },
  Low:          { cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30',          dot: 'bg-blue-400' },
};

export default function StatusBadge({ status, showDot = true, size = 'sm' }) {
  const config = configs[status] || { cls: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 font-medium border rounded-full",
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
      config.cls
    )}>
      {showDot && <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />}
      {status}
    </span>
  );
}