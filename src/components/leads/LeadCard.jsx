import { cn } from '@/lib/utils';

const interestDot = {
  Hot: 'bg-red-400',
  Warm: 'bg-yellow-400',
  Cold: 'bg-slate-400',
};

const companyTypeColors = {
  'Mechanical Contractor': 'bg-blue-500/15 text-blue-400',
  'Building Owner': 'bg-purple-500/15 text-purple-400',
  'Property Manager': 'bg-indigo-500/15 text-indigo-400',
  'Engineering Firm': 'bg-cyan-500/15 text-cyan-400',
  'Energy Services': 'bg-emerald-500/15 text-emerald-400',
  'Government': 'bg-amber-500/15 text-amber-400',
  'Healthcare': 'bg-pink-500/15 text-pink-400',
  'Education': 'bg-orange-500/15 text-orange-400',
  'Other': 'bg-slate-500/15 text-slate-400',
};

function daysSince(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function LeadCard({ lead, onClick }) {
  const days = daysSince(lead.last_contacted_date);

  return (
    <div
      onClick={() => onClick(lead)}
      className="bg-card border border-border rounded-xl p-3 cursor-pointer hover:border-primary/30 hover:bg-muted/30 transition-all space-y-2"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">
            {lead.first_name} {lead.last_name}
          </div>
          <div className="text-xs text-muted-foreground truncate">{lead.company || '—'}</div>
        </div>
        <span className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', interestDot[lead.interest_level] || 'bg-slate-400')} title={lead.interest_level} />
      </div>

      {lead.company_type && (
        <span className={cn('inline-block text-xs px-2 py-0.5 rounded-full font-medium', companyTypeColors[lead.company_type] || 'bg-muted text-muted-foreground')}>
          {lead.company_type}
        </span>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{[lead.city, lead.state].filter(Boolean).join(', ') || '—'}</span>
        {days !== null && (
          <span className={cn(days > 7 ? 'text-amber-400' : 'text-muted-foreground')}>
            {days === 0 ? 'Today' : `${days}d ago`}
          </span>
        )}
      </div>
    </div>
  );
}