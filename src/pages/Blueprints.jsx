import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileImage, Loader2, Building2, Trash2, Download, Eye, Plus, X, Search, Filter, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/shared/PageHeader';
import { cn } from '@/lib/utils';

export default function Blueprints() {
  const [blueprints, setBlueprints] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [previewBp, setPreviewBp] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Blueprint.list('-created_date'),
      base44.entities.Building.list(),
    ]).then(([bps, blds]) => {
      setBlueprints(bps);
      setBuildings(blds);
      setLoading(false);
    });
  }, []);

  const handleSaved = (bp) => {
    setBlueprints(prev => [bp, ...prev]);
    setShowUpload(false);
  };

  const handleDelete = async (bp) => {
    await base44.entities.Blueprint.delete(bp.id);
    setBlueprints(prev => prev.filter(b => b.id !== bp.id));
  };

  const filtered = blueprints.filter(bp => {
    const matchSearch = !search || bp.name.toLowerCase().includes(search.toLowerCase());
    const matchBuilding = buildingFilter === 'all' || bp.building_id === buildingFilter;
    return matchSearch && matchBuilding;
  });

  const getBuildingName = (id) => buildings.find(b => b.id === id)?.name || 'Unknown Building';
  const isImage = (url) => url && /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Blueprint Library"
        subtitle="Store and manage floor plans and blueprints for all buildings"
        actions={
          <Button onClick={() => setShowUpload(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-1.5" /> Upload Blueprint
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search blueprints…" className="pl-9 bg-card border-border" />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger className="w-52 bg-card border-border">
            <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
            <SelectValue placeholder="All Buildings" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="all">All Buildings</SelectItem>
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <FolderOpen className="w-14 h-14 opacity-20" />
          <p className="text-sm">{search || buildingFilter !== 'all' ? 'No blueprints match your filters' : 'No blueprints saved yet'}</p>
          <Button size="sm" onClick={() => setShowUpload(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> Upload First Blueprint
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(bp => (
            <BlueprintCard
              key={bp.id}
              bp={bp}
              buildingName={getBuildingName(bp.building_id)}
              isImage={isImage(bp.file_url)}
              onPreview={() => setPreviewBp(bp)}
              onDelete={() => handleDelete(bp)}
            />
          ))}
        </div>
      )}

      {/* Upload modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="bg-popover border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Upload Blueprint</DialogTitle>
          </DialogHeader>
          <UploadForm buildings={buildings} onSaved={handleSaved} onCancel={() => setShowUpload(false)} />
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={!!previewBp} onOpenChange={() => setPreviewBp(null)}>
        <DialogContent className="bg-popover border-border max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-foreground">{previewBp?.name}</DialogTitle>
          </DialogHeader>
          {previewBp && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                {getBuildingName(previewBp.building_id)}
                {previewBp.floor != null && <span>· Floor {previewBp.floor}</span>}
              </div>
              {isImage(previewBp.file_url) ? (
                <img src={previewBp.file_url} alt={previewBp.name} className="w-full max-h-[65vh] object-contain rounded-lg border border-border" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                  <FileImage className="w-10 h-10 opacity-30" />
                  <p className="text-sm">PDF preview not available</p>
                  <a href={previewBp.file_url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-primary text-primary-foreground"><Download className="w-4 h-4 mr-1.5" /> Download PDF</Button>
                  </a>
                </div>
              )}
              {previewBp.description && <p className="text-sm text-muted-foreground">{previewBp.description}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BlueprintCard({ bp, buildingName, isImage, onPreview, onDelete }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden group hover:border-primary/30 transition-all">
      {/* Thumbnail */}
      <div className="relative h-40 bg-muted/30 flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={bp.file_url} alt={bp.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <FileImage className="w-10 h-10 opacity-40" />
            <span className="text-xs">PDF</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
          <button onClick={onPreview} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all" title="Preview">
            <Eye className="w-4 h-4" />
          </button>
          <a href={bp.file_url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all" title="Download">
            <Download className="w-4 h-4" />
          </a>
          <button onClick={onDelete} className="w-8 h-8 rounded-full bg-red-500/40 hover:bg-red-500/60 flex items-center justify-center text-white transition-all" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {/* Info */}
      <div className="p-3">
        <p className="text-sm font-medium text-foreground truncate">{bp.name}</p>
        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{buildingName}</span>
          {bp.floor != null && <span className="flex-shrink-0">· Fl {bp.floor}</span>}
        </div>
        {bp.description && <p className="text-xs text-muted-foreground mt-1 truncate">{bp.description}</p>}
      </div>
    </div>
  );
}

function UploadForm({ buildings, onSaved, onCancel }) {
  const [form, setForm] = useState({ name: '', building_id: '', floor: 1, description: '' });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileName, setFileName] = useState(null);
  const fileRef = useRef(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setFileUrl(file_url);
    setFileName(file.name);
    if (!form.name) set('name', file.name.replace(/\.[^.]+$/, ''));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!fileUrl || !form.name || !form.building_id) return;
    setSaving(true);
    const isImage = /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(fileUrl);
    const bp = await base44.entities.Blueprint.create({
      name: form.name,
      building_id: form.building_id,
      floor: form.floor || null,
      description: form.description || '',
      file_url: fileUrl,
      file_type: isImage ? 'image' : 'pdf',
    });
    setSaving(false);
    onSaved(bp);
  };

  return (
    <div className="space-y-4">
      {/* File upload area */}
      <label className={cn(
        "flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all",
        fileUrl ? 'border-primary/40 bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-primary/5'
      )}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
      >
        <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf" onChange={e => handleFile(e.target.files[0])} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-muted-foreground">Uploading…</p>
          </div>
        ) : fileUrl ? (
          <div className="flex flex-col items-center gap-2">
            <FileImage className="w-8 h-8 text-primary" />
            <p className="text-xs text-primary font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground">Click to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-4">
            <Upload className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Drop a file here or click to browse</p>
            <p className="text-xs text-muted-foreground">PNG, JPG, WebP, PDF supported</p>
          </div>
        )}
      </label>

      <div>
        <Label className="text-xs text-muted-foreground">Name *</Label>
        <Input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 bg-input border-border" placeholder="e.g. Floor 2 Plan" />
      </div>

      <div>
        <Label className="text-xs text-muted-foreground">Building *</Label>
        <Select value={form.building_id} onValueChange={v => set('building_id', v)}>
          <SelectTrigger className="mt-1 bg-input border-border"><SelectValue placeholder="Select building…" /></SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Floor</Label>
          <Input type="number" value={form.floor} onChange={e => set('floor', Number(e.target.value))} className="mt-1 bg-input border-border" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Input value={form.description} onChange={e => set('description', e.target.value)} className="mt-1 bg-input border-border" placeholder="Optional…" />
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button variant="outline" onClick={onCancel} className="border-border text-muted-foreground">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={!fileUrl || !form.name || !form.building_id || saving}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Upload className="w-4 h-4 mr-1.5" />}
          Save Blueprint
        </Button>
      </div>
    </div>
  );
}