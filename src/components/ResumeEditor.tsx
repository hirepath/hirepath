import { useState, useRef } from 'react';
import { MasterResume } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Save, Copy, Check, X, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface ResumeEditorProps {
  resume: MasterResume;
  onSave: (content: string) => void;
  onClose: () => void;
}

export function ResumeEditor({ resume, onSave, onClose }: ResumeEditorProps) {
  const [content, setContent] = useState(resume.content);
  const [copied, setCopied] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    try {
      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        // Handle plain text files
        const text = await file.text();
        setContent(text);
        toast.success('Resume uploaded successfully');
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        // For PDF files - use pdf.js or similar library
        toast.info('PDF upload detected. Please install pdf-parse library or copy/paste content.');
        // You'll need to add: npm install pdfjs-dist
        // Then implement PDF text extraction
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        // For DOCX files - use mammoth library
        toast.info('DOCX upload detected. Please install mammoth library or copy/paste content.');
        // You'll need to add: npm install mammoth
        // Then implement DOCX text extraction
      } else {
        toast.error('Please upload a TXT, PDF, or DOCX file');
      }
    } catch (error) {
      console.error('Error reading file:', error);
      toast.error('Error reading file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      let yPosition = margin;

      // Split content into lines
      const lines = content.split('\n');

      doc.setFont('helvetica');

      lines.forEach((line, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Handle markdown-style headers
        if (line.startsWith('# ')) {
          // Main heading (H1)
          doc.setFontSize(20);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(2).trim();
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 8 + 3;
        } else if (line.startsWith('## ')) {
          // Section heading (H2)
          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(3).trim();
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 7 + 2;
        } else if (line.startsWith('### ')) {
          // Subsection heading (H3)
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(4).trim();
          const splitText = doc.splitTextToSize(text, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 6 + 1;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Bullet points
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const text = '• ' + line.substring(2).trim();
          const splitText = doc.splitTextToSize(text, maxWidth - 5);
          doc.text(splitText, margin + 5, yPosition);
          yPosition += splitText.length * 5;
        } else if (line.trim() === '') {
          // Empty line - add small spacing
          yPosition += 3;
        } else {
          // Regular text
          doc.setFontSize(11);
          doc.setFont('helvetica', 'normal');
          const splitText = doc.splitTextToSize(line, maxWidth);
          doc.text(splitText, margin, yPosition);
          yPosition += splitText.length * 5;
        }
      });

      // Save the PDF
      const fileName = `resume_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
      doc.save(fileName);
      toast.success('Resume downloaded as PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating PDF. Please try again.');
    }
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
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="gap-1.5"
            >
              <Upload className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="gap-1.5">
              <Download className="h-4 w-4" />
              PDF
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
            placeholder="Upload your resume or paste your master resume here..."
          />
        </div>

        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Tip: Upload your resume, edit it here, then download as PDF or tailor for each application.
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
