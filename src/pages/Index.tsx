import { useState } from 'react';
import { Application, ApplicationStatus } from '@/types/application';
import { useApplications } from '@/hooks/useApplications';
import { Header } from '@/components/Header';
import { StatsCards } from '@/components/StatsCards';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ApplicationList } from '@/components/ApplicationList';
import { ApplicationForm } from '@/components/ApplicationForm';
import { ApplicationDetail } from '@/components/ApplicationDetail';
import { ResumeEditor } from '@/components/ResumeEditor';
import { toast } from 'sonner';

const Index = () => {
  const {
    applications,
    resume,
    isLoading,
    addApplication,
    updateApplication,
    deleteApplication,
    addCommunication,
    updateResume
  } = useApplications();

  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [showForm, setShowForm] = useState(false);
  const [showResume, setShowResume] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  const handleMoveApplication = (id: string, status: ApplicationStatus) => {
  updateApplication(id, { status });
};

  const handleAddNew = () => {
    setEditingApp(null);
    setShowForm(true);
  };

  const handleCardClick = (app: Application) => {
    setSelectedApp(app);
  };

  const handleFormSubmit = (data: Partial<Application>) => {
    if (editingApp) {
      updateApplication(editingApp.id, data);
      toast.success('Application updated');
    } else {
      addApplication(data as Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'communications'>);
      toast.success('Application added');
    }
    setShowForm(false);
    setEditingApp(null);
    setSelectedApp(null);
  };

  const handleEdit = () => {
    if (selectedApp) {
      setEditingApp(selectedApp);
      setSelectedApp(null);
      setShowForm(true);
    }
  };

  const handleDelete = () => {
    if (selectedApp) {
      deleteApplication(selectedApp.id);
      toast.success('Application deleted');
      setSelectedApp(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg mx-auto mb-4 animate-pulse">
            <span className="text-primary-foreground font-bold text-xl">A</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        view={view}
        onViewChange={setView}
        onAddNew={handleAddNew}
        onOpenResume={() => setShowResume(true)}
      />

      <main className="container max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <StatsCards applications={applications} />
        </div>

        {view === 'kanban' ? (
          <KanbanBoard
            applications={applications}
            onCardClick={handleCardClick}
            onMoveApplication={handleMoveApplication}
          />
        ) : (
          <ApplicationList applications={applications} onCardClick={handleCardClick} />
        )}
      </main>

      {showForm && (
        <ApplicationForm
          application={editingApp || undefined}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setEditingApp(null);
          }}
        />
      )}

      {selectedApp && (
        <ApplicationDetail
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddCommunication={comm => addCommunication(selectedApp.id, comm)}
        />
      )}

      {showResume && (
        <ResumeEditor
          resume={resume}
          onSave={updateResume}
          onClose={() => setShowResume(false)}
        />
      )}
    </div>
  );
};

export default Index;
