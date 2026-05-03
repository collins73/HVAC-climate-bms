import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Activity, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COMPANY_TYPES = [
  'Mechanical Contractor', 'Building Owner', 'Property Manager',
  'Engineering Firm', 'Energy Services', 'Government', 'Healthcare', 'Education', 'Other'
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
];

export default function TrialSignup() {
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', company: '',
    company_type: '', phone: '', city: '', state: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const today = new Date();
    const trialEnd = new Date(today);
    trialEnd.setDate(trialEnd.getDate() + 14);
    await base44.entities.Lead.create({
      ...form,
      stage: 'New',
      source: 'Website',
      interest_level: 'Warm',
      trial_start_date: today.toISOString().split('T')[0],
      trial_end_date: trialEnd.toISOString().split('T')[0],
      last_contacted_date: today.toISOString().split('T')[0],
    });
    setLoading(false);
    setSubmitted(true);
  };

  const isValid = form.first_name && form.last_name && form.email && form.company;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Activity className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="text-sm font-bold text-cyan-400 tracking-tight uppercase">EMS AI Technologies</div>
          <div className="text-xs text-slate-400 font-medium">Omni Climate Flow</div>
        </div>
      </div>

      {submitted ? (
        <div className="max-w-md w-full text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">You're in!</h2>
          <p className="text-slate-400">Check your email for next steps. Your 14-day free trial starts today.</p>
          <div className="mt-6 flex items-center gap-3 justify-center">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">EMS AI Technologies</span>
          </div>
        </div>
      ) : (
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-4">
              Free 14-Day Trial
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-3">
              Start Your Free Trial —<br />HVAC Intelligence for<br />Modern Engineers
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              AI-powered monitoring, load calculations, and BMS integration. Free 14-day trial, no credit card required.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">First Name *</Label>
                <Input value={form.first_name} onChange={e => set('first_name', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="Jane" required />
              </div>
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">Last Name *</Label>
                <Input value={form.last_name} onChange={e => set('last_name', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="Smith" required />
              </div>
            </div>

            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Work Email *</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="jane@company.com" required />
            </div>

            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Company Name *</Label>
              <Input value={form.company} onChange={e => set('company', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="Acme Engineering" required />
            </div>

            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Company Type</Label>
              <Select value={form.company_type} onValueChange={v => set('company_type', v)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Select type…" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {COMPANY_TYPES.map(t => <SelectItem key={t} value={t} className="text-white">{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-slate-400 mb-1 block">Phone</Label>
              <Input value={form.phone} onChange={e => set('phone', e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                placeholder="+1 (555) 000-0000" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">City</Label>
                <Input value={form.city} onChange={e => set('city', e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  placeholder="New York" />
              </div>
              <div>
                <Label className="text-xs text-slate-400 mb-1 block">State</Label>
                <Select value={form.state} onValueChange={v => set('state', v)}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="State…" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                    {US_STATES.map(s => <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={!isValid || loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold h-11 text-sm mt-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Starting your trial…' : 'Start Free Trial →'}
            </Button>

            <p className="text-center text-xs text-slate-500">No credit card required · Cancel anytime</p>
          </form>
        </div>
      )}
    </div>
  );
}