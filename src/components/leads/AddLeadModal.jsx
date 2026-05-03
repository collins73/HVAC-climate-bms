import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const COMPANY_TYPES = [
  'Mechanical Contractor', 'Building Owner', 'Property Manager',
  'Engineering Firm', 'Energy Services', 'Government', 'Healthcare', 'Education', 'Other'
];
const STAGES = ['New', 'Contacted', 'Demo Scheduled', 'Trial Active', 'Converted', 'Churned'];
const SOURCES = ['Website', 'Referral', 'Event', 'Cold Outreach', 'Demo Request', 'Other'];
const INTEREST = ['Hot', 'Warm', 'Cold'];

const empty = {
  first_name: '', last_name: '', email: '', phone: '', company: '',
  company_type: 'Other', city: '', state: '', stage: 'New',
  interest_level: 'Warm', source: 'Other', notes: ''
};

export default function AddLeadModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.Lead.create(form);
    setSaving(false);
    setForm(empty);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Lead</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">First Name *</Label>
              <Input value={form.first_name} onChange={e => set('first_name', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Last Name *</Label>
              <Input value={form.last_name} onChange={e => set('last_name', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Email *</Label>
            <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Company</Label>
              <Input value={form.company} onChange={e => set('company', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Company Type</Label>
            <Select value={form.company_type} onValueChange={v => set('company_type', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {COMPANY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">City</Label>
              <Input value={form.city} onChange={e => set('city', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">State</Label>
              <Input value={form.state} onChange={e => set('state', e.target.value)} className="mt-1 bg-input border-border text-foreground" maxLength={2} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Stage</Label>
              <Select value={form.stage} onValueChange={v => set('stage', v)}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Interest</Label>
              <Select value={form.interest_level} onValueChange={v => set('interest_level', v)}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {INTEREST.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <Select value={form.source} onValueChange={v => set('source', v)}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Notes</Label>
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              className="mt-1 w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.first_name || !form.last_name || !form.email} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : null}
            Add Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}