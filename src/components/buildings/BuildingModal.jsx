import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

const empty = { name: '', address: '', city: '', state: '', zip: '', floors: '', total_sqft: '', status: 'Active', notes: '' };

export default function BuildingModal({ open, onClose, building, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(building ? { ...building } : empty);
  }, [building, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, floors: Number(form.floors) || undefined, total_sqft: Number(form.total_sqft) || undefined };
    if (building?.id) {
      await base44.entities.Building.update(building.id, data);
    } else {
      await base44.entities.Building.create(data);
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">{building ? 'Edit Building' : 'Add Building'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Building Name *</Label>
            <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-input border-border text-foreground" placeholder="e.g. HQ Tower A" />
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Address</Label>
            <Input value={form.address} onChange={e => set('address', e.target.value)} className="mt-1 bg-input border-border text-foreground" placeholder="123 Main St" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">City</Label>
            <Input value={form.city} onChange={e => set('city', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">State</Label>
            <Input value={form.state} onChange={e => set('state', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">ZIP</Label>
            <Input value={form.zip} onChange={e => set('zip', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
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
          <div>
            <Label className="text-muted-foreground text-xs">Floors</Label>
            <Input type="number" value={form.floors} onChange={e => set('floors', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Total Sq Ft</Label>
            <Input type="number" value={form.total_sqft} onChange={e => set('total_sqft', e.target.value)} className="mt-1 bg-input border-border text-foreground" />
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} className="mt-1 bg-input border-border text-foreground resize-none" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground hover:text-foreground">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.name} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Saving…' : 'Save Building'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}