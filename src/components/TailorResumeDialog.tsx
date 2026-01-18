// src/components/TailorResumeDialog.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  X, Sparkles, Copy, Check, Download, AlertCircle,
  FileText, Loader2, ArrowRight, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { tailorResumeWithAI } from '@/services/resumeTailor.service';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface TailorResumeDialogProps {
  masterResume: string;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  onClose: () => void;
  onApplyTailored: (tailoredResume: string) => void;
}

export function TailorResumeDialog({
  masterResume,
  jobTitle,
  company,
  jobDescription = '',
  onClose,
  onApplyTailored,
}: TailorResumeDialogProps) {
  const [jobDesc, setJobDesc] = useState(jobDescription);
  const [tailoredResume, setTailoredResume] = useState('');
  const [changes, setChanges] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const handleTailor = async () => {
    if (!jobDesc.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (!masterResume.trim()) {
      toast.error('Please upload your master resume first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await tailorResumeWithAI({
        masterResume,
        jobDescription: jobDesc,
        jobTitle,
        company,
      });

      setTailoredResume(result.tailoredResume);
      setChanges(result.changes);
      toast.success('Resume tailored successfully!');
    } catch (err: any) {
      console.error('Tailoring error:', err);
      setError(err.message || 'Failed to tailor resume. Please try again.');
      toast.error('Failed to tailor resume');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(tailoredResume);
    setCopied(true);
    toast.success('Tailored resume copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      const checkNewPage = () => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
        }
      };

      const lines = tailoredResume.split('\n');

      lines.forEach((line) => {
        if (line.trim() === '') {
          yPosition += 3;
          return;
        }

        checkNewPage();

        if (line.startsWith('# ')) {
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(2).trim();
          const wrapped = doc.splitTextToSize(text, maxWidth);
          doc.text(wrapped, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += wrapped.length * 8 + 5;
        } else if (line.startsWith('## ')) {
          yPosition += 5;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(3).trim();
          const wrapped = doc.splitTextToSize(text, maxWidth);
          doc.text(wrapped, margin, yPosition);
          yPosition += wrapped.length * 7 + 3;
        } else if (line.startsWith('### ')) {
          yPosition += 3;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(4).trim();
          const wrapped = doc.splitTextToSize(text, maxWidth);
          doc.text(wrapped, margin, yPosition);
          yPosition += wrapped.length * 6 + 2;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          checkNewPage();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const text = line.substring(2).trim();
          doc.text('\u2022', margin + 3, yPosition);
          const wrapped = doc.splitTextToSize(text, maxWidth - 10);
          doc.text(wrapped, margin + 8, yPosition);
          yPosition += wrapped.length * 5;
        } else {
          checkNewPage();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          if (/@|linkedin|github|\(\d{3}\)/.test(line)) {
            const wrapped = doc.splitTextToSize(line, maxWidth);
            doc.text(wrapped, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += wrapped.length * 5 + 3;
          } else {
            const wrapped = doc.splitTextToSize(line, maxWidth);
            doc.text(wrapped, margin, yPosition);
            yPosition += wrapped.length * 5;
          }
        }
      });

      const fileName = `${company}_${jobTitle}_resume_${format(new Date(), 'yyyy-MM-dd')}.pdf`.replace(/\s+/g, '_');
      doc.save(fileName);
      toast.success('Resume downloaded as PDF');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleApply = () => {
    onApplyTailored(tailoredResume);
    toast.success('Tailored resume applied to this application');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <Card className="w-full max-w-7xl h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">AI Resume Tailor</h2>
              <p className="text-xs text-muted-foreground">
                {jobTitle} at {company}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
          {/* Job Description Input */}
          {!tailoredResume && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Job Description
              </label>
              <Textarea
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the full job description here..."
                className="h-32 resize-none font-mono text-sm"
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Card className="p-3 bg-destructive/10 border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-destructive font-medium">Error</p>
                  <p className="text-sm text-destructive/80">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Side-by-Side Comparison */}
          {tailoredResume && (
            <div className={`flex-1 grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4 overflow-hidden`}>
              {/* Original Resume */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Original Resume</h3>
                  <Badge variant="outline">Master</Badge>
                </div>
                <ScrollArea className="flex-1 border rounded-lg">
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                      {masterResume}
                    </pre>
                  </div>
                </ScrollArea>
              </div>

              {/* Tailored Resume */}
              <div className="flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-foreground">Tailored Resume</h3>
                  <Badge className="bg-primary">AI-Optimized</Badge>
                </div>
                <ScrollArea className="flex-1 border rounded-lg bg-primary/5">
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">
                      {tailoredResume}
                    </pre>
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Changes Summary */}
          {changes.length > 0 && (
            <Card className="p-3 bg-muted/50">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                Key Changes
              </h4>
              <ul className="space-y-1">
                {changes.map((change, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <ArrowRight className="h-3 w-3 mt-0.5 shrink-0 text-primary" />
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          {!tailoredResume ? (
            <>
              <p className="text-sm text-muted-foreground">
                AI will optimize your resume for this specific job
              </p>
              <Button
                onClick={handleTailor}
                disabled={isLoading || !jobDesc.trim()}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tailoring...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Tailor Resume
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
              <Button onClick={handleApply} className="gap-2">
                <FileText className="h-4 w-4" />
                Apply to Application
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
