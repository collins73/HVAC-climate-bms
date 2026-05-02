import { useState } from 'react';
import { FileImage, Download, X, ChevronLeft, ChevronRight, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BlueprintViewer({ blueprints }) {
  const [lightbox, setLightbox] = useState(null); // index

  if (!blueprints?.length) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <Map className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-30" />
        <p className="text-sm text-muted-foreground">No blueprints uploaded yet</p>
        <p className="text-xs text-muted-foreground mt-1">Edit the building to upload floor plans</p>
      </div>
    );
  }

  const isImage = (url) => /\.(png|jpg|jpeg|gif|webp|svg)(\?|$)/i.test(url);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {blueprints.map((bp, idx) => (
          <div
            key={idx}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 transition-all group cursor-pointer"
            onClick={() => setLightbox(idx)}
          >
            <div className="aspect-video bg-muted/50 flex items-center justify-center relative">
              {isImage(bp.url) ? (
                <img src={bp.url} alt={bp.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <FileImage className="w-8 h-8" />
                  <span className="text-xs">PDF</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">View</span>
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-xs font-medium text-foreground truncate">{bp.name}</div>
              {bp.floor != null && (
                <div className="text-xs text-muted-foreground mt-0.5">Floor {bp.floor}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-semibold text-white">{blueprints[lightbox].name}</div>
                {blueprints[lightbox].floor != null && (
                  <div className="text-xs text-white/60">Floor {blueprints[lightbox].floor}</div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={blueprints[lightbox].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white bg-white/10 px-2 py-1.5 rounded-lg transition-colors"
                  onClick={e => e.stopPropagation()}
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
                <button onClick={() => setLightbox(null)} className="text-white/70 hover:text-white bg-white/10 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Image */}
            <div className="bg-card border border-border rounded-xl overflow-hidden flex items-center justify-center min-h-64">
              {isImage(blueprints[lightbox].url) ? (
                <img src={blueprints[lightbox].url} alt={blueprints[lightbox].name} className="max-w-full max-h-[70vh] object-contain" />
              ) : (
                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                  <FileImage className="w-12 h-12" />
                  <p className="text-sm">PDF file — click Download to open</p>
                  <a href={blueprints[lightbox].url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                    <Download className="w-4 h-4" /> Open PDF
                  </a>
                </div>
              )}
            </div>

            {/* Navigation */}
            {blueprints.length > 1 && (
              <div className="flex items-center justify-center gap-3 mt-3">
                <button
                  onClick={() => setLightbox(i => Math.max(0, i - 1))}
                  disabled={lightbox === 0}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white/60 text-xs">{lightbox + 1} / {blueprints.length}</span>
                <button
                  onClick={() => setLightbox(i => Math.min(blueprints.length - 1, i + 1))}
                  disabled={lightbox === blueprints.length - 1}
                  className="p-2 bg-white/10 hover:bg-white/20 disabled:opacity-30 rounded-lg text-white transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}