import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const TYPES = ['High Temp','Low Temp','High Humidity','Low Humidity','High CO2','Equipment Fault','Offline Sensor','Filter Change Due','Other'];
const empty = { building_id: '', zone_id: '', alert_type: 'Other', severity: 'Medium', message: '', status: 'Open' };

export default function AlertModal({ open, onClose, buildings, zones, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setForm(empty); }, [open]);

  const filteredZones = zones?.filter(z => !form.building_id || z.building_id === form.building_id);

  const handleSave = async () => {
    setSaving(true);
    // Deduplication: skip if an Open alert of the same type already exists for the same zone
    if (form.zone_id) {
      const existing = await base44.entities.Alert.filter({ zone_id: form.zone_id, alert_type: form.alert_type, status: 'Open' });
      if (existing.length > 0) {
        setSaving(false);
        onClose();
        return;
      }
    }
    await base44.entities.Alert.create(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Log Manual Alert</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <Label className="text-muted-foreground text-xs">Building *</Label>
            <Select value={form.building_id} onValueChange={v => set('building_id', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue placeholder="Select building" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {buildings?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Zone</Label>
            <Select value={form.zone_id} onValueChange={v => set('zone_id', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue placeholder="Select zone (optional)" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {filteredZones?.map(z => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-muted-foreground text-xs">Alert Type</Label>
              <Select value={form.alert_type} onValueChange={v => set('alert_type', v)}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Severity</Label>
              <Select value={form.severity} onValueChange={v => set('severity', v)}>
                <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {['Low','Medium','High','Critical'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Message</Label>
            <Textarea value={form.message} onChange={e => set('message', e.target.value)} className="mt-1 bg-input border-border text-foreground resize-none" rows={3} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.building_id} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {saving ? 'Logging…' : 'Log Alert'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}