export type NotificationSeverity = 'emergency' | 'warning' | 'info' | 'success';
export type NotificationCategory = 'emergency-alert' | 'incident-update' | 'system-status' | 'citizen-feedback';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  actionLabel: string | null;
  relatedIncidentId: string | null;
}

export const NOTIFICATION_SEVERITY_COLORS: Record<NotificationSeverity, string> = {
  emergency: '#EF4444',
  warning: '#F97316',
  info: '#3B82F6',
  success: '#22C55E',
};

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-001',
    title: 'CRITICAL ALERT: Structure Fire Reported',
    message: 'Emergency units Alpha and Beta dispatched to Harbor District Dock 9. Multiple callers reporting smoke and flames from warehouse structure. Evacuation in progress.',
    severity: 'emergency',
    category: 'emergency-alert',
    timestamp: '2 min ago',
    read: false,
    actionLabel: 'Dispatch Support',
    relatedIncidentId: null,
  },
  {
    id: 'notif-002',
    title: 'Gas Leak Containment Update',
    message: 'Hazmat Unit 2 has secured the perimeter at Community Park, Elm District. Gas concentration readings dropping. Estimated all-clear in 45 minutes.',
    severity: 'warning',
    category: 'incident-update',
    timestamp: '15 min ago',
    read: false,
    actionLabel: 'Track Progress',
    relatedIncidentId: 'INC-7840',
  },
  {
    id: 'notif-003',
    title: 'Water Main Repair in Progress',
    message: 'Water Crew Alpha has arrived at Oak Street. Emergency valve shutoff completed successfully. Pipe replacement underway, estimated 45 minutes to completion.',
    severity: 'info',
    category: 'incident-update',
    timestamp: '28 min ago',
    read: false,
    actionLabel: 'Track Progress',
    relatedIncidentId: 'INC-7842',
  },
  {
    id: 'notif-004',
    title: 'Daily System Backup Successful',
    message: 'All database backups completed at 06:00 AM. 2.4 TB of operational data securely archived to municipal cloud storage. Next backup scheduled for tomorrow.',
    severity: 'success',
    category: 'system-status',
    timestamp: '6 hours ago',
    read: true,
    actionLabel: null,
    relatedIncidentId: null,
  },
  {
    id: 'notif-005',
    title: 'Citizen Praise: Pothole Resolution',
    message: 'Citizen David Wilson submitted positive feedback: "Incredible response time on the Maple Blvd pothole cluster. Road surface is like new. Thank you Public Works!"',
    severity: 'success',
    category: 'citizen-feedback',
    timestamp: '1 hour ago',
    read: true,
    actionLabel: 'View Feedback',
    relatedIncidentId: null,
  },
  {
    id: 'notif-006',
    title: 'Power Grid Overload Warning',
    message: 'Grid 4 (Midtown) is operating at 94% capacity. Load balancing recommended to prevent cascading failures. Power & Utilities team has been notified.',
    severity: 'warning',
    category: 'system-status',
    timestamp: '2 hours ago',
    read: true,
    actionLabel: 'View Grid Status',
    relatedIncidentId: null,
  },
  {
    id: 'notif-007',
    title: 'Emergency Response Team Shift Change',
    message: 'Night shift Emergency Response Team 2 has checked in. All units accounted for. Day shift ERT 1 logging off after successful 12-hour rotation.',
    severity: 'info',
    category: 'system-status',
    timestamp: '3 hours ago',
    read: true,
    actionLabel: null,
    relatedIncidentId: null,
  },
  {
    id: 'notif-008',
    title: 'Fallen Tree Incident Resolved',
    message: 'Emergency Response Team 1 has cleared the fallen tree from Parkview Drive. Both lanes are now open. Power lines confirmed secure by Power Grid Team A.',
    severity: 'success',
    category: 'incident-update',
    timestamp: '4 hours ago',
    read: true,
    actionLabel: 'View Report',
    relatedIncidentId: 'INC-7810',
  },
  {
    id: 'notif-009',
    title: 'New Citizen Reports Spike',
    message: 'Unusual spike detected: 14 new incident reports in the last hour from Harbor District. Possible correlation with overnight storm damage. Investigation recommended.',
    severity: 'warning',
    category: 'system-status',
    timestamp: '5 hours ago',
    read: true,
    actionLabel: 'Analyze Trend',
    relatedIncidentId: null,
  },
  {
    id: 'notif-010',
    title: 'Monthly SLA Report Available',
    message: 'July 2026 Service Level Agreement report has been generated. Overall SLA compliance at 96.2%, up 1.8% from last month. Download available in Reports section.',
    severity: 'info',
    category: 'system-status',
    timestamp: '1 day ago',
    read: true,
    actionLabel: 'View Report',
    relatedIncidentId: null,
  },
];
