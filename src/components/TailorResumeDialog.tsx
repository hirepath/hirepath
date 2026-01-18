// src/components/TailorResumeDialog.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  X, Sparkles, Copy, Check, Download, AlertCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { tailorResumeWithAI } from '@/services/resumeTailor.service';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface TailorResumeDialogProps {
  masterResume: string;
  onClose: () => void;
}

export function TailorResumeDialog({ masterResume, onClose }: TailorResumeDialogProps) {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [tailoredResume, setTailoredResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const isMobile = useIsMobile();

  const handleTailor = async () => {
    if (!jobDesc.trim()) {
      toast.error('Please enter a job description');
      return;
    }

    if (!jobTitle.trim() || !company.trim()) {
      toast.error('Please enter job title and company name');
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
                Optimize your resume for any job posting
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Two Column Layout */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} divide-x divide-border`}>
            
            {/* LEFT: Job Description Input */}
            <div className="flex flex-col p-6 overflow-hidden">
              <h3 className="text-sm font-semibold text-foreground mb-4">Job Details</h3>
              
              <div className="space-y-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Senior React Developer"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input
                    id="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Google"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <Label htmlFor="jobDesc" className="mb-2">
                  Job Description
                </Label>
                <Textarea
                  id="jobDesc"
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="Paste the full job description here...

Example:
We're looking for a Senior React Developer to join our team...

Requirements:
- 5+ years of React experience
- TypeScript proficiency
- ..."
                  className="flex-1 resize-none font-mono text-sm"
                  disabled={isLoading}
                />
              </div>

              {/* Error Display */}
              {error && (
                <Card className="mt-4 p-3 bg-destructive/10 border-destructive/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-destructive font-medium">Error</p>
                      <p className="text-sm text-destructive/80">{error}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Tailor Button */}
              <Button
                onClick={handleTailor}
                disabled={isLoading || !jobDesc.trim() || !jobTitle.trim() || !company.trim()}
                className="mt-4 w-full gap-2"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Tailoring Resume...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Tailor Resume
                  </>
                )}
              </Button>
            </div>

            {/* RIGHT: Tailored Resume Output */}
            <div className="flex flex-col p-6 overflow-hidden bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">
                  {tailoredResume ? 'Tailored Resume' : 'AI-Optimized Resume Will Appear Here'}
                </h3>
                {tailoredResume && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopy}
                      className="gap-1.5"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleDownloadPDF}
                      className="gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1 border rounded-lg bg-background">
                <div className="p-4">
                  {!tailoredResume ? (
                    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                      <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter job details and description
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        AI will optimize your master resume by highlighting relevant skills and experience for this specific role
                      </p>
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs text-foreground">
                      {tailoredResume}
                    </pre>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}