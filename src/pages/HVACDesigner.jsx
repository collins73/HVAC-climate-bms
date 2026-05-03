import { useState } from 'react';
import { Cpu, Building2, Home, Zap, TrendingDown, ChevronRight, BarChart3, Wrench } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/shared/PageHeader';
import EquipmentSelectorPanel from '@/components/hvac/EquipmentSelectorPanel';
import EnergyPredictorPanel from '@/components/hvac/EnergyPredictorPanel';
import CommercialDesignPanel from '@/components/hvac/CommercialDesignPanel';
import ResidentialDesignPanel from '@/components/hvac/ResidentialDesignPanel';
import LoadCalcPanel from '@/components/hvac/LoadCalcPanel';

const MODULES = [
  {
    id: 'equipment',
    icon: Wrench,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
    title: 'Equipment Selector',
    subtitle: 'AI-assisted sizing for commercial & residential systems',
  },
  {
    id: 'predict',
    icon: TrendingDown,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    title: 'Energy Predictor',
    subtitle: 'ML-driven forecasts and cost optimization recommendations',
  },
  {
    id: 'commercial',
    icon: Building2,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'Commercial Design',
    subtitle: 'RTU, chiller, VRF, and AHU design guidance',
  },
  {
    id: 'residential',
    icon: Home,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    title: 'Residential Design',
    subtitle: 'Split systems, heat pumps, mini-split sizing',
  },
];

export default function HVACDesigner() {
  const [activePanel, setActivePanel] = useState(null);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <PageHeader
        title="HVAC Design Assistant"
        subtitle="AI-powered equipment selection, load-based sizing, and ML energy predictions for commercial & residential buildings"
      />

      {/* Hero banner — clicking opens Load Calc panel */}
      <button
        onClick={() => setActivePanel('load_calc')}
        className="w-full text-left relative bg-gradient-to-br from-primary/10 via-card to-violet-500/10 border border-primary/20 rounded-2xl p-8 overflow-hidden hover:border-primary/40 transition-all group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-foreground mb-1">AI + ML Design Engine</h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Input building parameters and get instant equipment recommendations sized to ASHRAE standards.
              Our ML model analyzes real sensor data patterns to predict energy behavior, flag inefficiencies,
              and recommend setpoint strategies that minimize operating costs.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-medium flex-shrink-0">
            Run Load Calc <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>

      {/* Module cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODULES.map(m => {
          const Icon = m.icon;
          return (
            <button key={m.id} onClick={() => setActivePanel(m.id)}
              className={`group bg-card border ${m.border} rounded-xl p-6 hover:bg-card/80 hover:border-opacity-60 transition-all text-left`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl ${m.bg} border ${m.border} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${m.color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">{m.title}</h3>
                  <p className="text-xs text-muted-foreground">{m.subtitle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors mt-1 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'ASHRAE Standards', value: 'ASHRAE 90.1 / 62.1', color: 'text-cyan-400' },
          { icon: BarChart3, label: 'ML Model', value: 'Pattern-based prediction', color: 'text-violet-400' },
          { icon: TrendingDown, label: 'Typical Savings', value: '15–35% energy cost', color: 'text-emerald-400' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-center">
              <Icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className={`text-sm font-semibold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Panels */}
      <AnimatePresence>
        {activePanel === 'equipment' && <EquipmentSelectorPanel key="equipment" onClose={() => setActivePanel(null)} />}
        {activePanel === 'predict' && <EnergyPredictorPanel key="predict" onClose={() => setActivePanel(null)} />}
        {activePanel === 'commercial' && <CommercialDesignPanel key="commercial" onClose={() => setActivePanel(null)} />}
        {activePanel === 'residential' && <ResidentialDesignPanel key="residential" onClose={() => setActivePanel(null)} />}
        {activePanel === 'load_calc' && <LoadCalcPanel key="load_calc" onClose={() => setActivePanel(null)} />}
      </AnimatePresence>
    </div>
  );
}