import { Button } from '@/components/ui/button';
import { Plus, FileText, LayoutGrid, List, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  view: 'kanban' | 'list';
  onViewChange: (view: 'kanban' | 'list') => void;
  onAddNew: () => void;
  onOpenResume: () => void;
}

export function Header({ view, onViewChange, onAddNew, onOpenResume }: HeaderProps) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">HirePath</h1>
              <p className="text-xs text-muted-foreground">Job Application Organizer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={view === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('kanban')}
                className="gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                Board
              </Button>
              <Button
                variant={view === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewChange('list')}
                className="gap-1.5"
              >
                <List className="h-4 w-4" />
                List
              </Button>
            </div>

            <Button variant="outline" size="sm" onClick={() => navigate('/jobs/board')} className="gap-1.5">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Browse Jobs</span>
            </Button>

            <Button variant="outline" size="sm" onClick={onOpenResume} className="gap-1.5">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Resume</span>
            </Button>

            <Button size="sm" onClick={onAddNew} className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Application</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
