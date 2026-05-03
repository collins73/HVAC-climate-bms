import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Copy, Eye, EyeOff, Trash2, Plus, CheckCircle2, Lock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

export default function APIManagement() {
  const [credentials, setCredentials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', scopes: ['buildings:read', 'zones:read', 'readings:read'] });
  const [copied, setCopied] = useState(false);

  const loadCredentials = async () => {
    const creds = await base44.entities.APICredential.list('-created_date', 100);
    setCredentials(creds);
  };

  useEffect(() => { loadCredentials(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Name is required');
      return;
    }

    const res = await base44.functions.invoke('generateAPIKey', {
      name: form.name,
      description: form.description,
      scopes: form.scopes,
    });

    setNewKey(res.data.credential.api_key);
    setForm({ name: '', description: '', scopes: ['buildings:read', 'zones:read', 'readings:read'] });
    setShowForm(false);
    await loadCredentials();
    toast.success('API key created');
  };

  const handleDelete = async (id) => {
    await base44.entities.APICredential.delete(id);
    setCredentials(creds => creds.filter(c => c.id !== id));
    toast.success('API key deleted');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '—';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="API Management"
        subtitle="Create and manage API keys for external facility integrations"
        actions={
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Generate Key
          </Button>
        }
      />

      {/* New key display */}
      {newKey && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-emerald-400">Key Created Successfully</p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">Save this key securely — it will not be shown again.</p>
              <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3 border border-emerald-500/20">
                <code className="text-xs text-foreground flex-1 font-mono break-all">{showKey ? newKey : '••••••••••••••••'}</code>
                <button onClick={() => setShowKey(!showKey)} className="text-emerald-400 hover:text-emerald-300">
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={copyToClipboard} className="text-emerald-400 hover:text-emerald-300">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-400 mt-2">Copied!</p>}
            </div>
            <button onClick={() => setNewKey(null)} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div>
            <Label className="text-sm">Name</Label>
            <Input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Building API - Third Party Integrator"
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-sm">Description (optional)</Label>
            <Input
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What this key is used for"
              className="mt-1"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Key
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Credentials list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Active Keys ({credentials.length})</h3>
        </div>
        {credentials.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Lock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No API keys yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {credentials.map(cred => (
              <div key={cred.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{cred.name}</p>
                    {cred.description && <p className="text-xs text-muted-foreground mt-1">{cred.description}</p>}
                  </div>
                  <button
                    onClick={() => handleDelete(cred.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {cred.scopes.join(', ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Created: {formatDate(cred.created_date)}
                  </span>
                  {cred.last_used && <span>Last used: {formatDate(cred.last_used)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Documentation */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-foreground">API Endpoints</h3>
        <div className="space-y-3 text-sm">
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <p className="font-mono text-xs text-cyan-400">GET /api/v1/facilities?api_key=YOUR_KEY</p>
            <p className="text-muted-foreground mt-1 text-xs">List all facilities (buildings) accessible to this key</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <p className="font-mono text-xs text-cyan-400">GET /api/v1/facilities/{'{'}facility_id{'}'}</p>
            <p className="text-muted-foreground mt-1 text-xs">Get facility details with zones</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <p className="font-mono text-xs text-cyan-400">GET /api/v1/zones/{'{'}zone_id{'}'}/readings</p>
            <p className="text-muted-foreground mt-1 text-xs">Get environmental readings for a zone (limit=100)</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border">
            <p className="font-mono text-xs text-cyan-400">GET /api/v1/health?api_key=YOUR_KEY</p>
            <p className="text-muted-foreground mt-1 text-xs">Health check endpoint</p>
          </div>
        </div>
      </div>
    </div>
  );
}