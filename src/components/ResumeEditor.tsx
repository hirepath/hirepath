import { useState, useRef } from 'react';
import { MasterResume } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { FileText, Save, Copy, Check, X, Upload, Download } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';
import { useIsMobile } from '@/hooks/use-mobile';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
  const isMobile = useIsMobile();

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

  const autoFormatResume = (text: string): string => {
    // Split into lines and clean up
    let lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    let result: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const prevLine = i > 0 ? lines[i - 1] : '';
      const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
      
      // Detect name (first line or contains email/phone at start)
      if ((i === 0 || i === 1) && line.length < 100 && /^[A-Z][a-z]+ [A-Z]/.test(line)) {
        result.push(`# ${line}`);
        result.push('');
        continue;
      }
      
      // Detect email/phone/links line
      if (/@|linkedin|github|\(\d{3}\)/.test(line) && line.length < 150) {
        result.push(line);
        result.push('');
        continue;
      }
      
      // Detect section headers (ALL CAPS words like EDUCATION, WORK EXPERIENCE, etc.)
      const sectionMatch = line.match(/^([A-Z][A-Z\s]+)(?:\s|$)/);
      if (sectionMatch && sectionMatch[1].length > 3 && sectionMatch[1].length < 30) {
        const section = sectionMatch[1].trim();
        const restOfLine = line.substring(sectionMatch[0].length).trim();
        
        result.push('');
        result.push(`## ${section}`);
        result.push('');
        
        if (restOfLine) {
          result.push(restOfLine);
        }
        continue;
      }
      
      // Detect job titles or degree (contains dates or GPA)
      if (/\d{4}|GPA:|Sep \d{4}|Jan \d{4}|May \d{4}|Mar \d{4}|Apr \d{4}|May \d{4}|Jun \d{4}|Jul \d{4}|Aug \d{4}|Sep \d{4}|Oct \d{4}|Nov \d{4}|Dec \d{4}/.test(line)) {
        // This might be a title line
        result.push('');
        result.push(`### ${line}`);
        result.push('');
        continue;
      }
      
      // Detect bullet point indicators
      if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        result.push(`- ${line.substring(1).trim()}`);
        continue;
      }
      
      // If this line starts with a capital and previous was empty or a header, might be a description
      // Make it a bullet point
      if (/^[A-Z]/.test(line) && result.length > 0) {
        const lastNonEmpty = result.filter(l => l.trim().length > 0).slice(-1)[0];
        if (lastNonEmpty && lastNonEmpty.startsWith('###')) {
          result.push(`- ${line}`);
          continue;
        }
      }
      
      // Default: add as regular line
      result.push(line);
    }
    
    return result.join('\n');
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
        // Handle PDF files with better text extraction
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          // Extract text with better spacing handling
          let lastY = -1;
          let pageLines: string[] = [];
          let currentLine = '';
          
          textContent.items.forEach((item: any) => {
            const y = item.transform[5]; // Y position
            const text = item.str;
            
            // New line detected (significant Y position change)
            if (lastY !== -1 && Math.abs(y - lastY) > 3) {
              if (currentLine.trim()) {
                pageLines.push(currentLine.trim());
              }
              currentLine = text;
            } else {
              // Add space between words if needed
              if (currentLine && !currentLine.endsWith(' ') && !text.startsWith(' ')) {
                currentLine += ' ';
              }
              currentLine += text;
            }
            
            lastY = y;
          });
          
          // Add the last line
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          
          fullText += pageLines.join('\n') + '\n\n';
        }
        
        // CLEAN UP WEIRD SPACING
        // Remove spaces between individual letters (like "L a n g u a g e s")
        fullText = fullText.replace(/\b(\w)\s+(\w)\s+(\w)/g, (match) => {
          // If we find a pattern of letters with spaces, remove the spaces
          return match.replace(/\s+/g, '');
        });
        
        // More aggressive cleanup for longer patterns
        fullText = fullText.split('\n').map(line => {
          // If a line has a lot of single-letter-space patterns, clean it up
          const spaceCount = (line.match(/\b\w\s+\w\b/g) || []).length;
          if (spaceCount > 3) {
            // This line has weird spacing, fix it
            return line.replace(/\b(\w)\s+/g, '$1');
          }
          return line;
        }).join('\n');
        
        // Auto-format the extracted text
        const formattedText = autoFormatResume(fullText);
        setContent(formattedText);
        toast.success('PDF uploaded and formatted successfully!');
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
      const maxWidth = pageWidth - (2 * margin);
      let yPosition = margin;
  
      const checkNewPage = () => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = margin;
          return true;
        }
        return false;
      };
  
      // Split content into lines
      const lines = content.split('\n');
  
      lines.forEach((line) => {
        // Skip empty lines but add small spacing
        if (line.trim() === '') {
          yPosition += 3;
          return;
        }
  
        checkNewPage();
  
        // Handle markdown-style headers
        if (line.startsWith('# ')) {
          // Main heading (Name)
          doc.setFontSize(22);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(2).trim();
          const wrappedText = doc.splitTextToSize(text, maxWidth);
          doc.text(wrappedText, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += wrappedText.length * 8 + 5;
        } else if (line.startsWith('## ')) {
          // Section heading
          yPosition += 5;
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(3).trim();
          const wrappedText = doc.splitTextToSize(text, maxWidth);
          doc.text(wrappedText, margin, yPosition);
          yPosition += wrappedText.length * 7 + 3;
        } else if (line.startsWith('### ')) {
          // Subsection heading (Job titles, degrees)
          yPosition += 3;
          doc.setFontSize(11);
          doc.setFont('helvetica', 'bold');
          const text = line.substring(4).trim();
          const wrappedText = doc.splitTextToSize(text, maxWidth);
          doc.text(wrappedText, margin, yPosition);
          yPosition += wrappedText.length * 6 + 2;
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Bullet points
          checkNewPage();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const text = line.substring(2).trim();
          const bulletX = margin + 3;
          const textX = margin + 8;
          
          // Draw bullet using unicode
          doc.text('\u2022', bulletX, yPosition);
          
          // Draw text with proper wrapping
          const wrappedText = doc.splitTextToSize(text, maxWidth - 10);
          doc.text(wrappedText, textX, yPosition);
          yPosition += wrappedText.length * 5;
        } else {
          // Regular text
          checkNewPage();
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          
          // Check if it's contact info (center it)
          if (/@|linkedin|github|\(\d{3}\)/.test(line)) {
            const wrappedText = doc.splitTextToSize(line, maxWidth);
            doc.text(wrappedText, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += wrappedText.length * 5 + 3;
          } else {
            const wrappedText = doc.splitTextToSize(line, maxWidth);
            doc.text(wrappedText, margin, yPosition);
            yPosition += wrappedText.length * 5;
          }
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
          <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'}`}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size={isMobile ? "icon" : "sm"}
              onClick={handleUploadClick}
              disabled={isUploading}
              className={isMobile ? "" : "gap-1.5"}
              title="Upload"
            >
              <Upload className="h-4 w-4" />
              {!isMobile && (isUploading ? 'Uploading...' : 'Upload')}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "icon" : "sm"} 
              onClick={handleCopy} 
              className={isMobile ? "" : "gap-1.5"}
              title="Copy"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {!isMobile && (copied ? 'Copied' : 'Copy')}
            </Button>
            <Button 
              variant="outline" 
              size={isMobile ? "icon" : "sm"} 
              onClick={handleDownloadPDF} 
              className={isMobile ? "" : "gap-1.5"}
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
              {!isMobile && 'PDF'}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} title="Close">
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