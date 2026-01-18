import { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { ChevronDown, X, Search } from 'lucide-react';
import { JobFilters, JobLevel, JobType } from '@/types/job';
import { cn } from '@/lib/utils';

interface JobFiltersProps {
  filters: JobFilters;
  onFiltersChange: (filters: JobFilters) => void;
  isExpanded?: boolean;
}

const remoteOptions = [
  { value: 'on-site', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
];

const jobTypeOptions: { value: JobType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

const levelOptions: { value: JobLevel; label: string }[] = [
  { value: 'entry', label: 'Entry Level' },
  { value: 'mid', label: 'Mid Level' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'executive', label: 'Executive' },
];

export function JobFilters({ filters, onFiltersChange, isExpanded = false }: JobFiltersProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [localSearch, setLocalSearch] = useState(filters.search || '');
  const [localLocation, setLocalLocation] = useState(filters.location || '');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const locationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalSearch(filters.search || '');
  }, [filters.search]);

  useEffect(() => {
    setLocalLocation(filters.location || '');
  }, [filters.location]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location) count++;
    if (filters.remote?.length) count += filters.remote.length;
    if (filters.jobType?.length) count += filters.jobType.length;
    if (filters.level?.length) count += filters.level.length;
    if (filters.salaryMin || filters.salaryMax) count++;
    if (filters.tags?.length) count += filters.tags.length;
    return count;
  }, [filters]);

  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearch(value);
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, search: value });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  const handleLocationChange = useCallback(
    (value: string) => {
      setLocalLocation(value);
      clearTimeout(locationTimeoutRef.current);
      locationTimeoutRef.current = setTimeout(() => {
        onFiltersChange({ ...filters, location: value });
      }, 300);
    },
    [filters, onFiltersChange]
  );

  const toggleRemote = useCallback(
    (remote: 'on-site' | 'hybrid' | 'remote') => {
      const current = filters.remote || [];
      const updated = current.includes(remote)
        ? current.filter((r) => r !== remote)
        : [...current, remote];
      onFiltersChange({ ...filters, remote: updated.length ? updated : undefined });
    },
    [filters, onFiltersChange]
  );

  const toggleJobType = useCallback(
    (type: JobType) => {
      const current = filters.jobType || [];
      const updated = current.includes(type)
        ? current.filter((t) => t !== type)
        : [...current, type];
      onFiltersChange({ ...filters, jobType: updated.length ? updated : undefined });
    },
    [filters, onFiltersChange]
  );

  const toggleLevel = useCallback(
    (level: JobLevel) => {
      const current = filters.level || [];
      const updated = current.includes(level)
        ? current.filter((l) => l !== level)
        : [...current, level];
      onFiltersChange({ ...filters, level: updated.length ? updated : undefined });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = useCallback(() => {
    onFiltersChange({});
  }, [onFiltersChange]);

  return (
    <Card className="bg-card border-border/50 p-4 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by job title, company..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="gap-1.5"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border/30">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
            <Input
              placeholder="e.g., San Francisco, CA"
              value={localLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Work Type</label>
            <div className="flex flex-wrap gap-2">
              {remoteOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.remote?.includes(option.value as any) ? 'default' : 'outline'
                  }
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleRemote(option.value as any)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Job Type</label>
            <div className="flex flex-wrap gap-2">
              {jobTypeOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.jobType?.includes(option.value) ? 'default' : 'outline'
                  }
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleJobType(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Experience Level</label>
            <div className="flex flex-wrap gap-2">
              {levelOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filters.level?.includes(option.value) ? 'default' : 'outline'
                  }
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleLevel(option.value)}
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
