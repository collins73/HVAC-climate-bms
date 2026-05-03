import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { GitBranch, FileText, Tag, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import { toast } from 'sonner';

export default function GitHubSync() {
  const [pushLoading, setPushLoading] = useState(false);
  const [releaseLoading, setReleaseLoading] = useState(false);
  const [version, setVersion] = useState('2.1.0');
  const [previousTag, setPreviousTag] = useState('');
  const [results, setResults] = useState(null);

  const handlePushReadme = async () => {
    setPushLoading(true);
    try {
      const res = await base44.functions.invoke('pushReadmeToGithub', {});
      setResults({ type: 'readme', data: res.data });
      toast.success('README pushed to GitHub successfully!');
      window.open(res.data.commit ? `https://github.com/collins73/HVAC-climate-bms/commit/${res.data.commit}` : 'https://github.com/collins73/HVAC-climate-bms');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setPushLoading(false);
    }
  };

  const handleGenerateRelease = async () => {
    if (!version.trim()) {
      toast.error('Version is required');
      return;
    }
    setReleaseLoading(true);
    try {
      const res = await base44.functions.invoke('generateReleaseNotes', {
        version,
        previousTag: previousTag || null
      });
      setResults({ type: 'release', data: res.data });
      toast.success('Release created on GitHub!');
      window.open(res.data.releaseUrl);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setReleaseLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="GitHub Sync"
        subtitle="Manage documentation and releases from your app"
      />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Push README */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Push README to GitHub</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Deploy the comprehensive README documentation to your GitHub repository.
          </p>
          <Button 
            onClick={handlePushReadme}
            disabled={pushLoading}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          >
            {pushLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Pushing...
              </>
            ) : (
              <>
                <GitBranch className="w-4 h-4" />
                Push README
              </>
            )}
          </Button>
          {results?.type === 'readme' && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-400">Successfully pushed to GitHub</div>
            </div>
          )}
        </div>

        {/* Generate Release */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Generate Release Notes</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Create a GitHub release with auto-generated notes from recent commits.
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Version</Label>
              <Input
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="2.1.0"
                className="mt-1 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs">Previous Tag (optional)</Label>
              <Input
                value={previousTag}
                onChange={e => setPreviousTag(e.target.value)}
                placeholder="v2.0.0"
                className="mt-1 text-sm"
              />
            </div>
            <Button 
              onClick={handleGenerateRelease}
              disabled={releaseLoading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {releaseLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  Create Release
                </>
              )}
            </Button>
            {results?.type === 'release' && (
              <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <div className="text-xs text-emerald-400 font-medium">Release created successfully</div>
                </div>
                <div className="text-xs text-muted-foreground space-y-1 ml-6">
                  <div>📝 {results.data.stats.features} features</div>
                  <div>🐛 {results.data.stats.fixes} fixes</div>
                  <div>📈 {results.data.stats.improvements} improvements</div>
                  <div>🔒 {results.data.stats.security} security updates</div>
                  <div>📚 {results.data.stats.docs} docs</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Release Notes Preview */}
      {results?.type === 'release' && results.data.releaseNotes && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-4">Generated Release Notes</h3>
          <div className="bg-muted/30 rounded-lg p-4 font-mono text-xs text-muted-foreground overflow-auto max-h-96">
            <pre>{results.data.releaseNotes}</pre>
          </div>
        </div>
      )}
    </div>
  );
}