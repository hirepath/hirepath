import { Application } from '@/types/application';
import { Card } from '@/components/ui/card';
import { Briefcase, Send, Users, Trophy, XCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  applications: Application[];
}

export function StatsCards({ applications }: StatsCardsProps) {
  const total = applications.length;
  const applied = applications.filter(a => a.status === 'applied').length;
  const interviews = applications.filter(a => a.status === 'interview').length;
  const offers = applications.filter(a => a.status === 'offer').length;
  const rejected = applications.filter(a => a.status === 'rejected').length;
  
  const responseRate = total > 0 ? Math.round(((interviews + offers) / total) * 100) : 0;

  const stats = [
    { label: 'Total', value: total, icon: Briefcase, color: 'text-foreground', bg: 'bg-secondary' },
    { label: 'Applied', value: applied, icon: Send, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Interviews', value: interviews, icon: Users, color: 'text-interview', bg: 'bg-interview/10' },
    { label: 'Offers', value: offers, icon: Trophy, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Response Rate', value: `${responseRate}%`, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.label}
            className={cn(
              'p-4 bg-card border-border/50 animate-slide-up',
              'hover:border-primary/20 transition-colors'
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', stat.bg)}>
                <Icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
