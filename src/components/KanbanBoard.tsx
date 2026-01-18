import { useMemo, useState } from 'react';
import { Application, ApplicationStatus } from '@/types/application';
import { ApplicationCard } from './ApplicationCard';
import { cn } from '@/lib/utils';
import { Bookmark, Send, Users, Trophy, XCircle } from 'lucide-react';

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { CSS } from '@dnd-kit/utilities';


interface KanbanBoardProps {
  applications: Application[];
  onCardClick: (app: Application) => void;
  onMoveApplication: (id: string, status: ApplicationStatus) => void;
}

const columns: { status: ApplicationStatus; label: string; icon: typeof Send }[] = [
  { status: 'saved', label: 'Saved', icon: Bookmark },
  { status: 'applied', label: 'Applied', icon: Send },
  { status: 'interview', label: 'Interview', icon: Users },
  { status: 'offer', label: 'Offer', icon: Trophy },
  { status: 'rejected', label: 'Rejected', icon: XCircle }
];

const columnStyles: Record<ApplicationStatus, string> = {
  saved: 'border-t-saved',
  applied: 'border-t-primary',
  interview: 'border-t-interview',
  offer: 'border-t-success',
  rejected: 'border-t-destructive'
};

function DroppableColumn({
  status,
  children
}: {
  status: ApplicationStatus;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'space-y-3 min-h-[120px] rounded-lg p-1 transition',
        isOver && 'bg-primary/5'
      )}
    >
      {children}
    </div>
  );
}

function DraggableApplicationCard({
  app,
  onCardClick
}: {
  app: Application;
  onCardClick: (app: Application) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'select-none touch-none',         // stop text selection + gestures
        isDragging && 'opacity-60'
      )}
      onClick={(e) => {
        // prevents opening details after a drag
        if (isDragging) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onCardClick(app);
      }}
    >
      {/* Card's internal onClick should not fire (we handle click here) */}
      <ApplicationCard application={app} onClick={() => {}} />
    </div>
  );
}

export function KanbanBoard({ applications, onCardClick, onMoveApplication }: KanbanBoardProps) {
  const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 1 } })
  );

  const [activeId, setActiveId] = useState<string | null>(null);

  const activeApp = useMemo(
    () => (activeId ? applications.find(a => a.id === activeId) : null),
    [activeId, applications]
  );

  const statusOf = (id: string) => applications.find(a => a.id === id)?.status ?? null;

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));

  const onDragEnd = (e: DragEndEvent) => {
  const { active, over } = e;
  setActiveId(null);
  if (!over) return;

  const appId = String(active.id);
  const to = String(over.id) as ApplicationStatus;

  const from = applications.find(a => a.id === appId)?.status ?? null;
  if (!from || !to) return;
  if (from === to) return;

  onMoveApplication(appId, to);
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {columns.map(column => {
          const columnApps = applications.filter(app => app.status === column.status);
          const Icon = column.icon;

          return (
            <div
              key={column.status}
              className={cn(
                'flex-shrink-0 w-72 md:flex-1 md:min-w-[240px]',
                'bg-muted/30 rounded-xl p-3 border-t-4',
                columnStyles[column.status]
              )}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-medium text-foreground">{column.label}</h3>
                </div>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background text-muted-foreground">
                  {columnApps.length}
                </span>
              </div>

              <DroppableColumn status={column.status}>
                {columnApps.map(app => (
                  <DraggableApplicationCard key={app.id} app={app} onCardClick={onCardClick} />
                ))}

                {columnApps.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground text-sm">No applications</div>
                )}
              </DroppableColumn>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeApp ? (
          <div className="w-72">
            <ApplicationCard application={activeApp} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
