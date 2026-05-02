import { useState } from 'react';
import { FileDown, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

export default function ExportReportButton({ buildings }) {
  const now = new Date();
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));
  const [buildingId, setBuildingId] = useState('all');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const years = [now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(String);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('exportReport', {
        month: parseInt(month),
        year: parseInt(year),
        building_id: buildingId === 'all' ? undefined : buildingId,
      });

      // response.data is arraybuffer-like; handle as blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hvac-report-${year}-${String(month).padStart(2, '0')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="border-border text-muted-foreground hover:text-foreground gap-2">
          <FileDown className="w-4 h-4" />
          Export Report
          <ChevronDown className="w-3 h-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-popover border-border p-4 space-y-4" align="end">
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Export Monthly Report</p>
          <p className="text-xs text-muted-foreground">Energy consumption & sensor readings PDF</p>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="bg-input border-border text-foreground h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {MONTHS.map((m, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)} className="text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="bg-input border-border text-foreground h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {years.map(y => (
                  <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Building</Label>
            <Select value={buildingId} onValueChange={setBuildingId}>
              <SelectTrigger className="bg-input border-border text-foreground h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all" className="text-xs">All Buildings</SelectItem>
                {buildings.map(b => (
                  <SelectItem key={b.id} value={b.id} className="text-xs">{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-8 text-xs"
        >
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating…</> : <><FileDown className="w-3.5 h-3.5" /> Download PDF</>}
        </Button>
      </PopoverContent>
    </Popover>
  );
}