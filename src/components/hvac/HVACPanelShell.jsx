import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function exportText(title, content) {
  const blob = new Blob([`${title}\n${'='.repeat(title.length)}\n\n${content}`], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HVACPanelShell({ title, icon: Icon, accentColor = 'cyan', onClose, children }) {
  const accents = {
    cyan: 'border-cyan-500/30 text-cyan-400',
    violet: 'border-violet-500/30 text-violet-400',
    amber: 'border-amber-500/30 text-amber-400',
    emerald: 'border-emerald-500/30 text-emerald-400',
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={cn('w-9 h-9 rounded-lg bg-current/10 border flex items-center justify-center', accents[accentColor])}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h2 className="text-base font-bold text-white">{title}</h2>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </motion.div>,
    document.body
  );
}

export function ResultSection({ title, children, className }) {
  return (
    <div className={cn('bg-slate-900 border border-slate-800 rounded-xl p-5', className)}>
      {title && <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{title}</h3>}
      {children}
    </div>
  );
}

export function FormField({ label, children }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1.5 block font-medium">{label}</label>
      {children}
    </div>
  );
}

export const inputCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500";
export const selectCls = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500";