import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Slack, AlertTriangle, CheckCircle2, Plus, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

const INTEGRATIONS = [
  {
    id: 'slack',
    name: 'Slack',
    desc: 'Get instant alerts in your Slack workspace when equipment faults or threshold violations occur',
    icon: Slack,
    features: ['Critical alerts', 'Daily summaries', 'Custom channels', 'Thread replies'],
    configured: false,
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [connecting, setConnecting] = useState(null);
  const [settings, setSettings] = useState({});

  const loadSettings = async () => {
    const res = await base44.functions.invoke('getIntegrationSettings', {});
    setSettings(res.data || {});
    setIntegrations(prev => prev.map(i => ({
      ...i,
      configured: !!res.data?.[i.id]?.enabled,
    })));
  };

  useEffect(() => { loadSettings(); }, []);

  const handleConnect = async (integrationId) => {
    if (integrationId === 'slack') {
      // OAuth flow for Slack
      const res = await base44.functions.invoke('getSlackOAuthUrl', {});
      window.location.href = res.data.oauth_url;
    }
  };

  const handleDisconnect = async (integrationId) => {
    await base44.functions.invoke('disconnectIntegration', { integration: integrationId });
    setIntegrations(prev => prev.map(i => ({
      ...i,
      configured: i.id === integrationId ? false : i.configured,
    })));
    toast.success(`${integrationId} disconnected`);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Integrations"
        subtitle="Connect third-party services to automate notifications and workflows"
      />

      <div className="space-y-4">
        {integrations.map(int => {
          const Icon = int.icon;
          return (
            <div key={int.id} className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{int.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{int.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {int.configured && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {!int.configured && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {int.features.map(f => (
                  <span key={f} className="text-xs bg-muted border border-border rounded-full px-2.5 py-1 text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                {int.configured ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {}}
                      className="border-border text-muted-foreground hover:text-foreground gap-2"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDisconnect(int.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" /> Disconnect
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleConnect(int.id)}
                    disabled={connecting === int.id}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <Plus className="w-4 h-4" /> Connect {int.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming soon */}
      <div className="bg-card border border-dashed border-border rounded-xl p-6 text-center">
        <h3 className="text-sm font-semibold text-foreground mb-2">More Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          Microsoft Teams, Google Chat, PagerDuty, and more integrations coming in the next release.
        </p>
      </div>
    </div>
  );
}