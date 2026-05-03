import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Mail, Phone, Building2, MapPin, Calendar, Send, Loader2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const STAGES = ['New', 'Contacted', 'Demo Scheduled', 'Trial Active', 'Converted', 'Churned'];

const emailStatusColors = {
  Sent: 'text-slate-400',
  Opened: 'text-blue-400',
  Clicked: 'text-cyan-400',
  Replied: 'text-emerald-400',
  Bounced: 'text-red-400',
};

export default function LeadDetailPanel({ lead, onClose, onUpdated }) {
  const [notes, setNotes] = useState(lead?.notes || '');
  const [stage, setStage] = useState(lead?.stage || 'New');
  const [emails, setEmails] = useState([]);
  const [savingNotes, setSavingNotes] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [manualSubject, setManualSubject] = useState('');

  useEffect(() => {
    setNotes(lead?.notes || '');
    setStage(lead?.stage || 'New');
    base44.entities.EmailSequence.filter({ lead_id: lead.id }).then(setEmails);
  }, [lead?.id]);

  const saveNotes = async () => {
    setSavingNotes(true);
    await base44.entities.Lead.update(lead.id, { notes, stage });
    setSavingNotes(false);
    onUpdated();
  };

  const handleStageChange = async (val) => {
    setStage(val);
    await base44.entities.Lead.update(lead.id, { stage: val });
    onUpdated();
  };

  const sendManualEmail = async () => {
    if (!manualSubject.trim()) return;
    setSendingEmail(true);
    const now = new Date().toISOString();
    const email = await base44.entities.EmailSequence.create({
      lead_id: lead.id,
      subject: manualSubject,
      body: '',
      sent_at: now,
      status: 'Sent',
      type: 'Manual',
    });
    await base44.entities.Lead.update(lead.id, { last_contacted_date: now.split('T')[0] });
    setEmails(prev => [email, ...prev]);
    setManualSubject('');
    setSendingEmail(false);
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-base font-bold text-foreground">{lead.first_name} {lead.last_name}</h2>
            <div className="text-xs text-muted-foreground mt-0.5">{lead.company || '—'}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          {/* Contact info */}
          <div className="space-y-2">
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${lead.email}`} className="text-primary hover:underline truncate">{lead.email}</a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {lead.phone}
              </div>
            )}
            {lead.company_type && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Building2 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {lead.company_type}
              </div>
            )}
            {(lead.city || lead.state) && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                {[lead.city, lead.state].filter(Boolean).join(', ')}
              </div>
            )}
            {lead.trial_start_date && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                Trial: {lead.trial_start_date} → {lead.trial_end_date}
              </div>
            )}
          </div>

          {/* Stage */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Stage</Label>
            <Select value={stage} onValueChange={handleStageChange}>
              <SelectTrigger className="bg-input border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Notes</Label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={4}
              className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="Add notes about this lead…"
            />
            <Button onClick={saveNotes} disabled={savingNotes} size="sm" className="mt-2 bg-primary text-primary-foreground hover:bg-primary/90">
              {savingNotes ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Save Notes
            </Button>
          </div>

          {/* Send manual email */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Send Manual Email</Label>
            <div className="flex gap-2">
              <input
                value={manualSubject}
                onChange={e => setManualSubject(e.target.value)}
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Email subject…"
              />
              <Button onClick={sendManualEmail} disabled={!manualSubject.trim() || sendingEmail} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 flex-shrink-0">
                {sendingEmail ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              </Button>
            </div>
          </div>

          {/* Email timeline */}
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Email Timeline</Label>
            {emails.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-4">No emails sent yet</div>
            ) : (
              <div className="space-y-2">
                {emails.sort((a, b) => (b.sent_at || '').localeCompare(a.sent_at || '')).map(e => (
                  <div key={e.id} className="flex items-start gap-2.5 p-2.5 bg-muted/30 border border-border rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-foreground truncate">{e.subject}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn('text-xs font-medium', emailStatusColors[e.status] || 'text-muted-foreground')}>{e.status}</span>
                        <span className="text-xs text-muted-foreground">{e.type}</span>
                        {e.sent_at && <span className="text-xs text-muted-foreground">{new Date(e.sent_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}