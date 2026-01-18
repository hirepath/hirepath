// src/components/ApplicationDetail.tsx

import { useState } from 'react';
import { Application, Communication } from '@/types/application';
import { StatusBadge } from './StatusBadge';
import { TailorResumeDialog } from './TailorResumeDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import {
  Building2, MapPin, Calendar, DollarSign, ExternalLink, Bell,
  X, Edit2, Trash2, MessageSquare, Phone, Mail, FileText, Plus, Sparkles
} from 'lucide-react';
import { format } from 'date-fns';

interface ApplicationDetailProps {
  application: Application;
  masterResume: string; // Add master resume
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddCommunication: (comm: Omit<Communication, 'id'>) => void;
  onUpdateResumeVersion: (resumeContent: string) => void; // Add handler for tailored resume
}

const commTypes = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: MessageSquare },
  { value: 'note', label: 'Note', icon: FileText }
];

export function ApplicationDetail({
  application,
  masterResume,
  onClose,
  onEdit,
  onDelete,
  onAddCommunication,
  onUpdateResumeVersion,
}: ApplicationDetailProps) {
  const [showCommForm, setShowCommForm] = useState(false);
  const [commType, setCommType] = useState<'email' | 'call' | 'meeting' | 'note'>('note');
  const [commContent, setCommContent] = useState('');
  const [showTailorDialog, setShowTailorDialog] = useState(false);

  const handleAddComm = () => {
    if (!commContent.trim()) return;
    onAddCommunication({
      type: commType,
      content: commContent,
      date: new Date().toISOString()
    });
    setCommContent('');
    setShowCommForm(false);
  };

  const getCommIcon = (type: string) => {
    const found = commTypes.find(c => c.value === type);
    return found?.icon || FileText;
  };

  const handleApplyTailoredResume = (tailoredResume: string) => {
    onUpdateResumeVersion(tailoredResume);
  };

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
        <div className="bg-card rounded-xl shadow-elevated w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <StatusBadge status={application.status} />
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-70px)]">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-1">{application.position}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="text-lg">{application.company}</span>
              </div>
            </div>

            {/* AI Tailor Resume CTA */}
            <Card className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    AI Resume Tailor
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get an AI-optimized resume tailored specifically for this job
                  </p>
                  {application.resumeVersion && (
                    <p className="text-xs text-primary font-medium">
                      ✓ Custom resume applied
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => setShowTailorDialog(true)}
                  variant="default"
                  size="sm"
                  className="gap-2 shrink-0"
                >
                  <Sparkles className="h-4 w-4" />
                  Tailor Resume
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {application.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{application.location}</span>
                </div>
              )}
              {application.salary && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>{application.salary}</span>
                </div>
              )}
              {application.dateApplied && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Applied {format(new Date(application.dateApplied), 'MMM d, yyyy')}</span>
                </div>
              )}
              {application.followUpDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bell className="h-4 w-4 shrink-0" />
                  <span>Follow up {format(new Date(application.followUpDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {application.jobUrl && (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline col-span-2"
                >
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span className="truncate">{application.jobUrl}</span>
                </a>
              )}
            </div>

            {application.resumeVersion && (
              <div className="mb-6 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Resume version:</span> Tailored (
                  {application.resumeVersion.substring(0, 50)}...)
                </p>
              </div>
            )}

            {application.notes && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Notes</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{application.notes}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Communication Log</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowCommForm(true)}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </div>

              {showCommForm && (
                <Card className="p-4 mb-4 border-primary/30 animate-scale-in">
                  <div className="flex gap-3 mb-3">
                    <Select value={commType} onValueChange={(v: any) => setCommType(v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {commTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={commContent}
                      onChange={e => setCommContent(e.target.value)}
                      placeholder="What happened?"
                      className="flex-1"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={() => setShowCommForm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleAddComm}>
                      Add
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {application.communications.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4 text-center">
                    No communications logged yet
                  </p>
                ) : (
                  application.communications.map(comm => {
                    const Icon = getCommIcon(comm.type);
                    return (
                      <div
                        key={comm.id}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="p-1.5 bg-background rounded">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{comm.content}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tailor Resume Dialog */}
      {showTailorDialog && (
        <TailorResumeDialog
          masterResume={masterResume}
          jobTitle={application.position}
          company={application.company}
          jobDescription={application.notes} // Use notes as job description initially
          onClose={() => setShowTailorDialog(false)}
          onApplyTailored={handleApplyTailoredResume}
        />
      )}
    </>
  );
}