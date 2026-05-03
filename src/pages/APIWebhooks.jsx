import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Copy, Check, AlertCircle, Webhook, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

const WEBHOOK_EVENTS = [
  { id: 'reading.created', label: 'Sensor Reading Created', desc: 'Triggered when a new environmental reading is recorded' },
  { id: 'alert.created', label: 'Alert Created', desc: 'Triggered when a new alert is raised' },
  { id: 'alert.resolved', label: 'Alert Resolved', desc: 'Triggered when an alert is marked as resolved' },
  { id: 'zone.updated', label: 'Zone Updated', desc: 'Triggered when zone settings change' },
  { id: 'thermostat.changed', label: 'Thermostat Changed', desc: 'Triggered when thermostat setpoints are modified' },
];

export default function APIWebhooks() {
  const [webhooks, setWebhooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ url: '', event: '', secret: '' });
  const [copied, setCopied] = useState(null);
  const [showSecret, setShowSecret] = useState({});

  const loadWebhooks = async () => {
    const data = await base44.functions.invoke('webhookManager', {});
    setWebhooks(data.data.webhooks || []);
  };

  useEffect(() => { loadWebhooks(); }, []);

  const handleCreate = async () => {
    if (!form.url.trim() || !form.event) {
      toast.error('URL and event type are required');
      return;
    }
    const secret = form.secret || Math.random().toString(36).substring(7);
    const res = await base44.functions.invoke('createWebhook', {
      url: form.url,
      event: form.event,
      secret,
    });
    setWebhooks(w => [...w, res.data.webhook]);
    setForm({ url: '', event: '', secret: '' });
    setShowForm(false);
    toast.success('Webhook created');
  };

  const handleDelete = async (id) => {
    await base44.functions.invoke('deleteWebhook', { id });
    setWebhooks(w => w.filter(wh => wh.id !== id));
    toast.success('Webhook deleted');
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Webhooks"
        subtitle="Configure outgoing webhooks to receive real-time events from your facilities"
        actions={
          <Button onClick={() => setShowForm(!showForm)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Add Webhook
          </Button>
        }
      />

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-4 space-y-4">
          <div>
            <Label className="text-sm">Webhook URL</Label>
            <Input
              value={form.url}
              onChange={e => setForm({ ...form, url: e.target.value })}
              placeholder="https://your-server.com/webhooks/hvac"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Events will be POST'd to this URL as JSON</p>
          </div>
          <div>
            <Label className="text-sm">Event Type</Label>
            <Select value={form.event} onValueChange={v => setForm({ ...form, event: v })}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select event…" /></SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {WEBHOOK_EVENTS.map(e => (
                  <SelectItem key={e.id} value={e.id} className="text-sm">{e.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Signing Secret (optional)</Label>
            <Input
              value={form.secret}
              onChange={e => setForm({ ...form, secret: e.target.value })}
              placeholder="Leave blank to auto-generate"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Used to verify webhook authenticity via HMAC-SHA256 signature header</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreate} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Create Webhook
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" className="border-border">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Event types reference */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Available Events</h3>
        <div className="space-y-2">
          {WEBHOOK_EVENTS.map(e => (
            <div key={e.id} className="flex items-start gap-3 py-2">
              <div className="text-xs font-mono text-cyan-400 flex-shrink-0 mt-0.5">{e.id}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{e.label}</div>
                <div className="text-xs text-muted-foreground">{e.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Active Webhooks ({webhooks.length})</h3>
        </div>
        {webhooks.length === 0 ? (
          <div className="p-8 text-center">
            <Webhook className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No webhooks configured yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {webhooks.map(wh => (
              <div key={wh.id} className="p-4 hover:bg-muted/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <p className="font-mono text-sm text-cyan-400 truncate">{wh.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Event: <span className="text-foreground font-medium">{WEBHOOK_EVENTS.find(e => e.id === wh.event)?.label}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(wh.id)}
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="bg-muted/30 rounded-lg p-3 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Signing Secret</span>
                    <button
                      onClick={() => setShowSecret(s => ({ ...s, [wh.id]: !s[wh.id] }))}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {showSecret[wh.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono text-cyan-400 flex-1 truncate">
                      {showSecret[wh.id] ? wh.secret : '••••••••••••••••'}
                    </code>
                    <button
                      onClick={() => copyToClipboard(wh.secret, wh.id)}
                      className="text-muted-foreground hover:text-primary"
                    >
                      {copied === wh.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Created: {new Date(wh.created_date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documentation */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Webhook Payload Format</h3>
        <div className="bg-muted/30 rounded-lg p-3 font-mono text-xs text-muted-foreground overflow-x-auto">
          <pre>{`{
  "event": "reading.created",
  "timestamp": "2026-05-03T14:30:00Z",
  "data": {
    "zone_id": "zone_123",
    "building_id": "bldg_456",
    "temperature": 72.5,
    "humidity": 45,
    "co2_ppm": 850
  }
}`}</pre>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          All payloads include an <code className="bg-muted px-1 py-0.5 rounded">X-Webhook-Signature</code> header containing HMAC-SHA256(payload, secret) for verification.
        </p>
      </div>
    </div>
  );
}