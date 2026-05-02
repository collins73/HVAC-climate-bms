import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import { Upload, X, FileImage, Loader2, ImagePlus } from 'lucide-react';

const empty = { name: '', address: '', city: '', state: '', zip: '', floors: '', total_sqft: '', status: 'Active', notes: '', blueprints: [], cover_image_url: '' };

export default function BuildingModal({ open, onClose, building, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(building ? { ...building, blueprints: building.blueprints || [] } : empty);
  }, [building, open]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleBlueprintUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const blueprint = {
        name: file.name.replace(/\.[^.]+$/, ''),
        url: file_url,
        floor: null,
        uploaded_at: new Date().toISOString(),
      };
      setForm(f => ({ ...f, blueprints: [...(f.blueprints || []), blueprint] }));
    }
    setUploading(false);
    e.target.value = '';
  };

  const removeBlueprint = (idx) => {
    setForm(f => ({ ...f, blueprints: f.blueprints.filter((_, i) => i !== idx) }));
  };

  const updateBlueprintName = (idx, name) => {
    setForm(f => ({ ...f, blueprints: f.blueprints.map((b, i) => i === idx ? { ...b, name } : b) }));
  };

  const updateBlueprintFloor = (idx, floor) => {
    setForm(f => ({ ...f, blueprints: f.blueprints.map((b, i) => i === idx ? { ...b, floor: floor === '' ? null : Number(floor) } : b) }));
  };

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
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
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

          {/* Cover Image */}
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Facility Cover Image</Label>
            <div className="mt-1 flex items-center gap-3">
              {form.cover_image_url ? (
                <div className="relative w-20 h-14 rounded-lg overflow-hidden border border-border flex-shrink-0">
                  <img src={form.cover_image_url} alt="cover" className="w-full h-full object-cover" />
                  <button onClick={() => set('cover_image_url', '')} className="absolute top-0.5 right-0.5 bg-black/60 rounded p-0.5 text-white hover:bg-black/80">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-14 rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center flex-shrink-0">
                  <ImagePlus className="w-5 h-5 text-muted-foreground/40" />
                </div>
              )}
              <label className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-xs ${uploading ? 'opacity-50 pointer-events-none' : 'border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground'}`}>
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  const { file_url } = await base44.integrations.Core.UploadFile({ file });
                  set('cover_image_url', file_url);
                  setUploading(false);
                  e.target.value = '';
                }} />
                {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Upload Image</>}
              </label>
            </div>
          </div>

          {/* Blueprints */}
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Blueprints / Floor Plans</Label>
            <label className={`mt-1 flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploading ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'}`}>
              <input type="file" className="hidden" multiple accept="image/*,.pdf,.dwg,.dxf,.dwf,.svg" onChange={handleBlueprintUpload} disabled={uploading} />
              {uploading ? (
                <div className="flex items-center gap-2 text-primary text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading…
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Upload className="w-5 h-5" />
                  <span className="text-xs">Click to upload images, PDFs, or CAD files (.dwg, .dxf)</span>
                </div>
              )}
            </label>

            {form.blueprints?.length > 0 && (
              <div className="mt-2 space-y-2">
                {form.blueprints.map((bp, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg p-2">
                    <FileImage className="w-4 h-4 text-primary flex-shrink-0" />
                    <Input
                      value={bp.name}
                      onChange={e => updateBlueprintName(idx, e.target.value)}
                      className="flex-1 h-7 text-xs bg-input border-border text-foreground"
                      placeholder="Blueprint name"
                    />
                    <Input
                      type="number"
                      value={bp.floor ?? ''}
                      onChange={e => updateBlueprintFloor(idx, e.target.value)}
                      className="w-16 h-7 text-xs bg-input border-border text-foreground"
                      placeholder="Floor"
                    />
                    <button onClick={() => removeBlueprint(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border text-muted-foreground hover:text-foreground">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || uploading || !form.name} className="bg-primary text-primary-foreground hover:bg-primary/90">
            {saving ? 'Saving…' : 'Save Building'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}