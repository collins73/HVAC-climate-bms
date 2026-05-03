import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Cpu, Mail, CheckCircle2, Sparkles, Ruler, Wind, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FEATURES = [
  { icon: Ruler, label: 'Load Calculations', desc: 'Manual J/S/D compliant heating & cooling load analysis' },
  { icon: Wind, label: 'Duct Sizing', desc: 'Automated duct layout and sizing per ASHRAE guidelines' },
  { icon: Cpu, label: 'Equipment Selection', desc: 'AI-matched equipment recommendations from top manufacturers' },
  { icon: Zap, label: 'Energy Optimization', desc: 'ML-driven setpoint and schedule optimization to cut costs' },
];

export default function AIDesign() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    // Check for duplicate
    const existing = await base44.entities.Waitlist.filter({ email: email.trim() });
    if (existing.length === 0) {
      await base44.entities.Waitlist.create({ email: email.trim(), name: name.trim(), source: 'ai-design' });
    }
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-cyan-900/20 border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" /> Coming Soon
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            AI HVAC Design Assistant
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            Load calculations, duct sizing, and equipment selection — all powered by AI.
            Design commercial and residential HVAC systems in minutes, not days.
          </p>

          {/* Waitlist form */}
          {submitted ? (
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 text-emerald-400">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div className="text-left">
                <div className="font-semibold">You're on the list!</div>
                <div className="text-sm text-emerald-400/80">We'll notify you at <strong>{email}</strong> when AI Design launches.</div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-card border-border text-foreground"
              />
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-card border-border text-foreground flex-1"
              />
              <Button type="submit" disabled={loading || !email.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap">
                <Mail className="w-4 h-4 mr-1.5" />
                {loading ? 'Joining…' : 'Join Waitlist'}
              </Button>
            </form>
          )}
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-3xl mx-auto px-6 py-16 w-full">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-8">What's Coming</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="bg-card border border-border rounded-xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm mb-1">{f.label}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}