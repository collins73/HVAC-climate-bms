import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Plus, Users, TrendingUp, Zap, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LeadCard from '@/components/leads/LeadCard';
import LeadDetailPanel from '@/components/leads/LeadDetailPanel';
import AddLeadModal from '@/components/leads/AddLeadModal';
import PageHeader from '@/components/shared/PageHeader';

const STAGES = ['New', 'Contacted', 'Demo Scheduled', 'Trial Active', 'Converted', 'Churned'];

const stageColors = {
  'New': 'border-slate-500/30 bg-slate-500/5',
  'Contacted': 'border-blue-500/30 bg-blue-500/5',
  'Demo Scheduled': 'border-purple-500/30 bg-purple-500/5',
  'Trial Active': 'border-cyan-500/30 bg-cyan-500/5',
  'Converted': 'border-emerald-500/30 bg-emerald-500/5',
  'Churned': 'border-red-500/30 bg-red-500/5',
};

const stageHeaderColors = {
  'New': 'text-slate-400',
  'Contacted': 'text-blue-400',
  'Demo Scheduled': 'text-purple-400',
  'Trial Active': 'text-cyan-400',
  'Converted': 'text-emerald-400',
  'Churned': 'text-red-400',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [addModal, setAddModal] = useState(false);

  const load = async () => {
    const data = await base44.entities.Lead.list('-created_date', 200);
    setLeads(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const total = leads.length;
  const converted = leads.filter(l => l.stage === 'Converted').length;
  const trialActive = leads.filter(l => l.stage === 'Trial Active').length;
  const hotLeads = leads.filter(l => l.interest_level === 'Hot').length;
  const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(0) : '0';

  const byStage = {};
  STAGES.forEach(s => { byStage[s] = leads.filter(l => l.stage === s); });

  return (
    <div className="p-6 space-y-5 h-full flex flex-col">
      <PageHeader
        title="Lead Pipeline"
        subtitle="Track and manage your sales pipeline"
        actions={
          <Button onClick={() => setAddModal(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" /> Add Lead
          </Button>
        }
      />

      {/* KPI bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Users className="w-8 h-8 text-primary p-1.5 bg-primary/10 rounded-lg flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-foreground font-mono">{total}</div>
            <div className="text-xs text-muted-foreground">Total Leads</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-400 p-1.5 bg-emerald-500/10 rounded-lg flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-foreground font-mono">{conversionRate}%</div>
            <div className="text-xs text-muted-foreground">Conversion Rate</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <FlaskConical className="w-8 h-8 text-cyan-400 p-1.5 bg-cyan-500/10 rounded-lg flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-foreground font-mono">{trialActive}</div>
            <div className="text-xs text-muted-foreground">Trials Active</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
          <Zap className="w-8 h-8 text-red-400 p-1.5 bg-red-500/10 rounded-lg flex-shrink-0" />
          <div>
            <div className="text-lg font-bold text-foreground font-mono">{hotLeads}</div>
            <div className="text-xs text-muted-foreground">Hot Leads</div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">Loading pipeline…</div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-3 h-full min-w-max pb-4">
            {STAGES.map(stage => (
              <div
                key={stage}
                className={`flex flex-col w-64 rounded-xl border ${stageColors[stage]} flex-shrink-0`}
              >
                {/* Column header */}
                <div className="px-3 py-2.5 border-b border-border/50 flex items-center justify-between">
                  <span className={`text-xs font-semibold uppercase tracking-wider ${stageHeaderColors[stage]}`}>
                    {stage}
                  </span>
                  <span className="text-xs bg-muted text-muted-foreground rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {byStage[stage].length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-32">
                  {byStage[stage].length === 0 ? (
                    <div className="text-xs text-muted-foreground/50 text-center py-6">No leads</div>
                  ) : (
                    byStage[stage].map(lead => (
                      <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdated={() => {
            load();
            // Refresh selected lead data
            base44.entities.Lead.filter({ id: selectedLead.id }).then(r => r[0] && setSelectedLead(r[0]));
          }}
        />
      )}

      <AddLeadModal open={addModal} onClose={() => setAddModal(false)} onSaved={load} />
    </div>
  );
}