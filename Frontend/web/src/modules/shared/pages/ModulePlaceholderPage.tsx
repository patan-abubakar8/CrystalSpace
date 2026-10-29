import React from 'react';
import {
  FolderKanban,
  CircleCheck,
  NotebookPen,
  CalendarDays,
  MessagesSquare,
  Video,
  FileText,
  Ticket,
  Megaphone,
  ListChecks,
  ScrollText,
  Settings,
} from 'lucide-react';
import type { NavigationTab } from '../../../layouts/Sidebar';

interface ModuleMeta {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const MODULES: Partial<Record<NavigationTab, ModuleMeta>> = {
  projects: {
    title: 'Projects',
    subtitle: 'Plan initiatives, track deliverables, and monitor project health.',
    icon: FolderKanban,
  },
  tasks: {
    title: 'Tasks',
    subtitle: 'Assign, prioritize, and follow up on work items across teams.',
    icon: CircleCheck,
  },
  'daily-logs': {
    title: 'Daily Logs',
    subtitle: 'Capture day-to-day work updates and progress notes from your team.',
    icon: NotebookPen,
  },
  calendar: {
    title: 'Company Calendar',
    subtitle: 'Holidays, org-wide events, and team schedules in one view.',
    icon: CalendarDays,
  },
  chats: {
    title: 'Chats',
    subtitle: 'Direct and group conversations for everyday collaboration.',
    icon: MessagesSquare,
  },
  meetings: {
    title: 'Meetings',
    subtitle: 'Schedule sessions, share agendas, and record meeting outcomes.',
    icon: Video,
  },
  documents: {
    title: 'Documents',
    subtitle: 'Store, share, and manage company and employee documents.',
    icon: FileText,
  },
  support: {
    title: 'IT Support Tickets',
    subtitle: 'Raise, triage, and resolve internal IT requests.',
    icon: Ticket,
  },
  announcements: {
    title: 'Announcements',
    subtitle: 'Broadcast company-wide updates and important notices.',
    icon: Megaphone,
  },
  workflows: {
    title: 'Approval Workflows',
    subtitle: 'Configure multi-step approval chains for requests and records.',
    icon: ListChecks,
  },
  'audit-logs': {
    title: 'Audit Logs',
    subtitle: 'Review a chronological trail of administrative actions and changes.',
    icon: ScrollText,
  },
  'org-settings': {
    title: 'Org Settings',
    subtitle: 'Configure organization-wide preferences, policies, and defaults.',
    icon: Settings,
  },
};

interface ModulePlaceholderPageProps {
  tab: NavigationTab;
}

/**
 * Shown for navigation entries whose module is not implemented yet, so the
 * sidebar never routes to a blank content area.
 */
export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({ tab }) => {
  const meta = MODULES[tab];
  const Icon = meta?.icon ?? FileText;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="section-header">
        <div>
          <h1 className="section-title">{meta?.title ?? 'Module'}</h1>
          <p className="section-subtitle">{meta?.subtitle ?? ''}</p>
        </div>
      </div>

      <div className="card" style={{ padding: '3rem 1rem', textAlign: 'center' }}>
        <Icon size={40} color="var(--text-tertiary)" />
        <div style={{ fontWeight: 400, marginTop: '0.75rem' }}>Module Coming Soon</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          This area is available in the menu, but its screens are not built yet.
        </p>
      </div>
    </div>
  );
};
