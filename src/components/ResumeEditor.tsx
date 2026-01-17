import { useState } from 'react';
import { MasterResume } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Save, Copy, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ResumeEditorProps {
  resume: MasterResume;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function ResumeEditor({ resume, onSave, onClose }: ResumeEditorProps) {
  const [content, setContent] = useState(resume.content);
  const [copied, setCopied] = useState(false);
  const hasChanges = content !== resume.content;

  const handleSave = () => {
    onSave(content);
    toast.success('Resume saved successfully');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success('Resume copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-4xl h-[90vh] flex flex-col animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Master Resume</h2>
              <p className="text-xs text-muted-foreground">
                Last updated: {format(new Date(resume.lastUpdated), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-hidden">
          <Textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="h-full resize-none font-mono text-sm"
            placeholder="Paste your master resume here..."
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Tip: Keep your master resume comprehensive, then tailor it for each application.
          </p>
          <Button onClick={handleSave} disabled={!hasChanges} className="gap-1.5">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </Card>
    </div>
  );
}
