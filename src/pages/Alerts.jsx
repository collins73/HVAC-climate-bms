import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, Check, CheckCircle2, Search, Plus, RotateCw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const SEVERITY_COLORS = {
  Critical: { bg: 'bg-red-950', border: 'border-red-700', icon: 'text-red-400', hex: '#ef4444' },
  High: { bg: 'bg-orange-950', border: 'border-orange-700', icon: 'text-orange-400', hex: '#f97316' },
  Medium: { bg: 'bg-yellow-950', border: 'border-yellow-700', icon: 'text-yellow-400', hex: '#eab308' },
  Low: { bg: 'bg-slate-800', border: 'border-slate-700', icon: 'text-slate-400', hex: '#64748b' },
};

const STATUS_COLORS = {
  Open: { bg: 'bg-red-800', text: 'text-red-200', dot: 'bg-red-400' },
  Acknowledged: { bg: 'bg-yellow-800', text: 'text-yellow-200', dot: 'bg-yellow-400' },
  Resolved: { bg: 'bg-green-800', text: 'text-green-200', dot: 'bg-green-400' },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [zones, setZones] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [logDialog, setLogDialog] = useState(false);
  const [logForm, setLogForm] = useState({
    building_id: '',
    zone_id: '',
    alert_type: 'Other',
    severity: 'Medium',
    message: '',
  });

  const loadData = async () => {
    try {
      setError(null);
      const [z, b] = await Promise.all([
        base44.entities.Zone.list(),
        base44.entities.Building.list(),
      ]);
      setZones(z);
      setBuildings(b);

      // Paginate alerts with limit 500
      let allAlerts = [];
      let skip = 0;
      let hasMore = true;
      while (hasMore) {
        const batch = await base44.entities.Alert.list('-created_date', 500, skip);
        if (batch.length === 0) {
          hasMore = false;
        } else {
          allAlerts = allAlerts.concat(batch);
          skip += batch.length;
        }
      }
      setAlerts(allAlerts);
    } catch (err) {
      console.error('Failed to load alerts:', err);
      setError(err.message || 'Failed to load alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredAlerts = alerts.filter(a => {
    const matchStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchSeverity = severityFilter === 'All Severities' || a.severity === severityFilter;
    const matchSearch =
      !search ||
      a.message?.toLowerCase().includes(search.toLowerCase()) ||
      a.alert_type?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSeverity && matchSearch;
  });

  const openCount = alerts.filter(a => a.status === 'Open').length;
  const criticalCount = alerts.filter(a => a.severity === 'Critical').length;
  const acknowledgedCount = alerts.filter(a => a.status === 'Acknowledged').length;
  const resolvedCount = alerts.filter(a => a.status === 'Resolved').length;

  const handleAcknowledge = async (id) => {
    const alert = alerts.find(a => a.id === id);
    try {
      await base44.entities.Alert.update(id, {
        ...alert,
        status: 'Acknowledged',
        acknowledged_by: (await base44.auth.me()).email,
      });
      loadData();
    } catch (err) {
      setError('Failed to acknowledge alert');
    }
  };

  const handleResolve = async (id) => {
    const alert = alerts.find(a => a.id === id);
    try {
      await base44.entities.Alert.update(id, {
        ...alert,
        status: 'Resolved',
        resolved_at: new Date().toISOString(),
      });
      loadData();
    } catch (err) {
      setError('Failed to resolve alert');
    }
  };

  const handleResolveAll = async () => {
    if (!confirm('Resolve all open alerts?')) return;
    try {
      const openAlerts = alerts.filter(a => a.status === 'Open');
      await Promise.all(
        openAlerts.map(a =>
          base44.entities.Alert.update(a.id, {
            ...a,
            status: 'Resolved',
            resolved_at: new Date().toISOString(),
          })
        )
      );
      loadData();
    } catch (err) {
      setError('Failed to resolve all alerts');
    }
  };

  const handleLogAlert = async () => {
    if (!logForm.message.trim()) return;
    try {
      await base44.entities.Alert.create(logForm);
      setLogForm({
        building_id: '',
        zone_id: '',
        alert_type: 'Other',
        severity: 'Medium',
        message: '',
      });
      setLogDialog(false);
      loadData();
    } catch (err) {
      setError('Failed to create alert');
    }
  };

  const buildingOptions = logForm.building_id
    ? zones.filter(z => z.building_id === logForm.building_id)
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* NavBar */}
      <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-cyan-500" />
            <span className="font-bold text-slate-100">EMS AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded transition-colors">
              Dashboard
            </Link>
            <Link to="/buildings" className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded transition-colors">
              Buildings
            </Link>
            <Link to="/zones" className="text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded transition-colors">
              Zones
            </Link>
            <Link to="/alerts" className="text-cyan-400 bg-slate-800 px-3 py-2 rounded">
              Alerts
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-100">Alerts</h1>
          <div className="flex items-center gap-3">
            <Button
              onClick={loadData}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <RotateCw className="w-4 h-4" /> Refresh
            </Button>
            {openCount > 0 && (
              <Button
                onClick={handleResolveAll}
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Check className="w-4 h-4" /> Resolve All
              </Button>
            )}
            <Dialog open={logDialog} onOpenChange={setLogDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white gap-2">
                  <Plus className="w-4 h-4" /> Log Alert
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-slate-800">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">Log New Alert</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-slate-400">Building</Label>
                    <Select
                      value={logForm.building_id}
                      onValueChange={v => setLogForm({ ...logForm, building_id: v, zone_id: '' })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue placeholder="Select building…" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {buildings.map(b => (
                          <SelectItem key={b.id} value={b.id} className="text-slate-100">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {logForm.building_id && (
                    <div>
                      <Label className="text-slate-400">Zone</Label>
                      <Select value={logForm.zone_id} onValueChange={v => setLogForm({ ...logForm, zone_id: v })}>
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                          <SelectValue placeholder="Select zone…" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {buildingOptions.map(z => (
                            <SelectItem key={z.id} value={z.id} className="text-slate-100">
                              {z.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label className="text-slate-400">Alert Type</Label>
                    <Select value={logForm.alert_type} onValueChange={v => setLogForm({ ...logForm, alert_type: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {['High Temp', 'Low Temp', 'High Humidity', 'Low Humidity', 'High CO2', 'Equipment Fault', 'Offline Sensor', 'Filter Change Due', 'Other'].map(
                          t => (
                            <SelectItem key={t} value={t} className="text-slate-100">
                              {t}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Severity</Label>
                    <Select value={logForm.severity} onValueChange={v => setLogForm({ ...logForm, severity: v })}>
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {['Low', 'Medium', 'High', 'Critical'].map(s => (
                          <SelectItem key={s} value={s} className="text-slate-100">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-400">Message</Label>
                    <Textarea
                      value={logForm.message}
                      onChange={e => setLogForm({ ...logForm, message: e.target.value })}
                      placeholder="Describe the alert…"
                      className="bg-slate-800 border-slate-700 text-slate-100 h-24"
                    />
                  </div>
                  <Button
                    onClick={handleLogAlert}
                    disabled={!logForm.message.trim()}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50"
                  >
                    Create Alert
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4 text-red-300">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Open', count: openCount, color: '#ef4444' },
            { label: 'Critical', count: criticalCount, color: '#ef4444' },
            { label: 'Acknowledged', count: acknowledgedCount, color: '#f97316' },
            { label: 'Resolved', count: resolvedCount, color: '#10b981' },
          ].map(s => (
            <div
              key={s.label}
              className="bg-slate-900 border border-slate-800 rounded-lg p-4"
              style={{ borderTop: `3px solid ${s.color}` }}
            >
              <div className="text-slate-400 text-sm">{s.label}</div>
              <div className="text-3xl font-bold text-slate-100 mt-2">{s.count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        {!loading && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search alerts…"
                className="pl-9 bg-slate-900 border-slate-800 text-slate-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                {['All', 'Open', 'Acknowledged', 'Resolved'].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      statusFilter === s
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-48 bg-slate-900 border-slate-800 text-slate-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  {['All Severities', 'Low', 'Medium', 'High', 'Critical'].map(s => (
                    <SelectItem key={s} value={s} className="text-slate-100">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="ml-auto text-sm text-slate-400">{filteredAlerts.length} alerts</div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading alerts…</div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
            <p className="text-slate-300 font-medium">
              {search || statusFilter !== 'All' || severityFilter !== 'All Severities'
                ? 'No alerts match your filters'
                : 'All clear — no alerts'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(a => {
              const zone = zones.find(z => z.id === a.zone_id);
              const building = buildings.find(b => b.id === a.building_id);
              const severityConfig = SEVERITY_COLORS[a.severity] || SEVERITY_COLORS.Low;
              const statusConfig = STATUS_COLORS[a.status] || STATUS_COLORS.Open;
              return (
                <div
                  key={a.id}
                  className={`${severityConfig.bg} ${severityConfig.border} border rounded-lg p-4 flex items-start gap-4`}
                >
                  <AlertTriangle className={`w-5 h-5 ${severityConfig.icon} flex-shrink-0 mt-1`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-100">{a.alert_type}</span>
                      <span className={`${statusConfig.bg} ${statusConfig.text} text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5`}>
                        <span className={`${statusConfig.dot} w-1.5 h-1.5 rounded-full`} />
                        {a.status}
                      </span>
                      <span className={`${severityConfig.bg} border ${severityConfig.border} text-xs px-2 py-0.5 rounded-full text-slate-200`}>
                        {a.severity}
                      </span>
                    </div>
                    <p className="text-slate-200 mb-3">{a.message}</p>
                    <div className="text-xs text-slate-400 space-y-0.5">
                      <div>
                        {new Date(a.created_date).toLocaleString()} · {building?.name} {zone && `· ${zone.name}`}
                        {a.acknowledged_by && ` · Acked by ${a.acknowledged_by}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {a.status === 'Open' && (
                      <Button
                        onClick={() => handleAcknowledge(a.id)}
                        size="sm"
                        className="bg-yellow-700 hover:bg-yellow-600 text-yellow-100"
                      >
                        Ack
                      </Button>
                    )}
                    {(a.status === 'Open' || a.status === 'Acknowledged') && (
                      <Button
                        onClick={() => handleResolve(a.id)}
                        size="sm"
                        className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100"
                      >
                        Resolve
                      </Button>
                    )}
                    {zone && (
                      <Link
                        to={`/zones/${zone.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 text-center py-1.5 px-2 rounded hover:bg-slate-800 transition-colors"
                      >
                        View Zone
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}