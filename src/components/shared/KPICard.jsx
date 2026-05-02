import { cn } from '@/lib/utils';

export default function KPICard({ title, value, subtitle, icon: Icon, trend, color = 'cyan', onClick }) {
  const colorMap = {
    cyan:   'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
    emerald:'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    amber:  'text-amber-400 bg-amber-400/10 border-amber-400/20',
    red:    'text-red-400 bg-red-400/10 border-red-400/20',
    blue:   'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-5 flex flex-col gap-4 transition-all duration-200",
        onClick && "cursor-pointer hover:border-primary/40 hover:bg-card/80"
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-1 tracking-tight">{value}</p>
        </div>
        {Icon && (
          <div className={cn("w-10 h-10 rounded-lg border flex items-center justify-center", colorMap[color])}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(subtitle || trend) && (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}