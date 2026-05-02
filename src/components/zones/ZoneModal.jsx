import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const ZONE_TYPES = ['Office','Lobby','Server Room','Conference Room','Warehouse','Retail','Residential','Other'];
const empty = { name: '', building_id: '', floor: '', zone_type: 'Office', sqft: '', status: 'Active', notes: '' };

export default function ZoneModal({ open, onClose, zone, buildings, defaultBuildingId, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (zone) {
      setForm({ ...zone });
    } else {
      setForm({ ...empty, building_id: defaultBuildingId || '' });
    }
  }, [zone, open, defaultBuildingId]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, floor: Number(form.floor) || undefined, sqft: Number(form.sqft) || undefined };
    if (zone?.id) {
      await base44.entities.Zone.update(zone.id, data);
    } else {
      await base44.entities.Zone.create(data);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{zone ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Zone Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-input border-border text-foreground" placeholder="e.g. Floor 3 East Wing" />
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Building *</Label>
            <Select value={form.building_id} onValueChange={v => set('building_id', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue placeholder="Select building" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {buildings?.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Floor</Label>
            <Input type="number" value={form.floor} onChange={e => set('floor', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Zone Type</Label>
            <Select value={form.zone_type} onValueChange={v => set('zone_type', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {ZONE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Sq Ft</Label>
            <Input type="number" value={form.sqft} onChange={e => set('sqft', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => set('status', v)}>
              <SelectTrigger className="mt-1 bg-input border-border text-foreground"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {['Active','Inactive','Maintenance'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="mt-1 bg-input border-border text-foreground resize-none" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name || !form.building_id} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Saving…' : 'Save Zone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}