import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { RefreshCw, Activity, AlertCircle, CheckCircle2, Clock, Building2, Wifi, WifiOff, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import FacilityMap from '@/components/monitor/FacilityMap';

export default function FacilitiesMonitor() {
  const [credentials, setCredentials] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadData = async () => {
    try {
      setLoading(true);
      const creds = await base44.entities.APICredential.list('-created_date', 100);
      setCredentials(creds);

      // Fetch all buildings to show on map
      const buildings = await base44.entities.Building.list('-updated_date', 100);
      const facilitiesWithStatus = buildings.map(b => {
        const cred = creds.find(c => c.facilities && c.facilities.includes(b.id));
        return {
          ...b,
          credential: cred,
          isActive: cred && cred.enabled && (!cred.expires_at || new Date(cred.expires_at) >= new Date()),
          lastSync: cred?.last_used || null,
        };
      });
      setFacilities(facilitiesWithStatus);
      setLastRefresh(new Date());
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const getStatusColor = (credential) => {
    if (!credential.enabled) return 'text-muted-foreground bg-muted/30 border-muted';
    if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
    if (!credential.last_used) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  };

  const getStatusLabel = (credential) => {
    if (!credential.enabled) return 'Disabled';
    if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
      return 'Expired';
    }
    if (!credential.last_used) return 'Connected · Inactive';
    return 'Connected · Active';
  };

  const getStatusIcon = (credential) => {
    if (!credential.enabled) return <WifiOff className="w-4 h-4" />;
    if (credential.expires_at && new Date(credential.expires_at) < new Date()) {
      return <AlertCircle className="w-4 h-4" />;
    }
    if (!credential.last_used) return <Activity className="w-4 h-4" />;
    return <CheckCircle2 className="w-4 h-4" />;
  };

  const getFacilityCount = (credential) => {
    // If no facilities specified, they have access to all
    if (!credential.facilities || credential.facilities.length === 0) {
      return 'All Facilities';
    }
    return `${credential.facilities.length} Facilit${credential.facilities.length === 1 ? 'y' : 'ies'}`;
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <PageHeader
        title="Facilities Monitor"
        subtitle="View connection status and sync activity for all API-connected facilities"
        actions={
          <Button
            onClick={loadData}
            disabled={loading}
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />

      {/* Map view */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Facility Locations</h3>
        </div>
        <FacilityMap facilities={facilities} />
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Keys</p>
              <p className="text-2xl font-bold text-foreground mt-1">{credentials.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-primary/30" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active Connections</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {credentials.filter(c => c.enabled && (!c.expires_at || new Date(c.expires_at) >= new Date())).length}
              </p>
            </div>
            <Wifi className="w-8 h-8 text-emerald-400/30" />
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Last Refresh</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {formatDistanceToNow(lastRefresh, { addSuffix: true })}
              </p>
            </div>
            <Clock className="w-8 h-8 text-primary/30" />
          </div>
        </div>
      </div>

      {/* Connections list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">API Credentials & Connection Status</h3>
        </div>

        {credentials.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-muted-foreground opacity-30" />
            <p className="text-sm text-muted-foreground">No API credentials configured yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create an API key to start monitoring facility connections</p>
            <Button
              onClick={() => window.location.href = '/api'}
              className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create API Key
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {credentials.map(cred => {
              const statusColor = getStatusColor(cred);
              const isActive = cred.last_used && cred.enabled && (!cred.expires_at || new Date(cred.expires_at) >= new Date());
              
              return (
                <div key={cred.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{cred.name}</p>
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                          {getStatusIcon(cred)}
                          {getStatusLabel(cred)}
                        </div>
                      </div>
                      {cred.description && (
                        <p className="text-xs text-muted-foreground">{cred.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono text-cyan-400 truncate max-w-xs">
                        {cred.api_key.substring(0, 10)}...
                      </p>
                      {cred.expires_at && (
                        <p className={`text-xs mt-1 ${new Date(cred.expires_at) < new Date() ? 'text-red-400' : 'text-muted-foreground'}`}>
                          {new Date(cred.expires_at) < new Date()
                            ? `Expired ${formatDistanceToNow(new Date(cred.expires_at), { addSuffix: true })}`
                            : `Expires ${formatDistanceToNow(new Date(cred.expires_at), { addSuffix: true })}`
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Details row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-muted/30 rounded px-3 py-2">
                      <p className="text-muted-foreground mb-0.5">Access</p>
                      <p className="font-medium text-foreground">{getFacilityCount(cred)}</p>
                    </div>
                    <div className="bg-muted/30 rounded px-3 py-2">
                      <p className="text-muted-foreground mb-0.5">Scopes</p>
                      <p className="font-medium text-foreground">{cred.scopes.length} scope{cred.scopes.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="bg-muted/30 rounded px-3 py-2">
                      <p className="text-muted-foreground mb-0.5">Created</p>
                      <p className="font-medium text-foreground">
                        {formatDistanceToNow(new Date(cred.created_date), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="bg-muted/30 rounded px-3 py-2">
                      <p className="text-muted-foreground mb-0.5">Last Sync</p>
                      <p className="font-medium text-foreground">
                        {cred.last_used
                          ? formatDistanceToNow(new Date(cred.last_used), { addSuffix: true })
                          : 'Never'}
                      </p>
                    </div>
                  </div>

                  {/* Scopes */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {cred.scopes.map((scope, idx) => (
                      <span key={idx} className="text-xs bg-primary/10 border border-primary/20 text-primary rounded px-2 py-1">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connection Status Legend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Connection Status Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-muted-foreground">Connected & Active (recent sync)</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <span className="text-muted-foreground">Connected but Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-muted-foreground">Expired or Disabled</span>
          </div>
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Disabled Key</span>
          </div>
        </div>
      </div>
    </div>
  );
}