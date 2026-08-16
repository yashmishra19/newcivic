export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low';
export type IncidentStatus = 'reported' | 'verified' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
export type IncidentCategory = 'public-works' | 'emergency' | 'sanitation' | 'power' | 'law-enforcement';

export interface Incident {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    neighborhood: string;
    lat: number;
    lng: number;
  };
  category: IncidentCategory;
  priority: IncidentPriority;
  status: IncidentStatus;
  reportedAt: string;
  reportedBy: string;
  reporterAvatar: string;
  assignedTeam: string | null;
  assignedDepartment: string;
  photo: string;
  timeline: { label: string; time: string; completed: boolean }[];
  activityLog: { user: string; action: string; time: string }[];
}

export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  'public-works': 'Public Works',
  'emergency': 'Emergency',
  'sanitation': 'Sanitation',
  'power': 'Power & Utilities',
  'law-enforcement': 'Law Enforcement',
};

export const PRIORITY_COLORS: Record<IncidentPriority, string> = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#EAB308',
  low: '#3B82F6',
};

export const STATUS_COLORS: Record<IncidentStatus, string> = {
  reported: '#6366F1',
  verified: '#8B5CF6',
  assigned: '#3B82F6',
  'in-progress': '#F97316',
  resolved: '#22C55E',
  closed: '#6B7280',
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  reported: 'Reported',
  verified: 'Verified',
  assigned: 'Assigned',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-7842',
    title: 'Major Water Pipe Burst',
    description: 'A major water main has burst on Oak Street causing significant flooding and water pressure loss for nearby residents. Emergency repair crews are needed immediately.',
    location: { address: '245 Oak Street', neighborhood: 'Downtown', lat: 40.7128, lng: -74.006 },
    category: 'public-works',
    priority: 'critical',
    status: 'in-progress',
    reportedAt: '2026-08-16T12:55:00Z',
    reportedBy: 'Sarah Jenkins',
    reporterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    assignedTeam: 'Water Crew Alpha',
    assignedDepartment: 'Public Works',
    photo: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '12:55 PM', completed: true },
      { label: 'Verified', time: '12:58 PM', completed: true },
      { label: 'Assigned', time: '1:02 PM', completed: true },
      { label: 'Team Dispatched', time: '1:05 PM', completed: true },
      { label: 'Repair Started', time: '1:15 PM', completed: true },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'System', action: 'Incident auto-classified as Critical', time: '12:55 PM' },
      { user: 'Officer Davis', action: 'Verified incident and escalated priority', time: '12:58 PM' },
      { user: 'Dispatch', action: 'Assigned Water Crew Alpha', time: '1:02 PM' },
      { user: 'Water Crew Alpha', action: 'En route to location', time: '1:05 PM' },
      { user: 'Water Crew Alpha', action: 'Arrived on site, repair in progress', time: '1:15 PM' },
    ],
  },
  {
    id: 'INC-7840',
    title: 'Gas Leak Detection',
    description: 'Strong gas odor detected near Community Park playground area. Multiple citizens have reported the smell. Area needs immediate evacuation and inspection.',
    location: { address: 'Community Park, Elm District', neighborhood: 'Elm District', lat: 40.7189, lng: -74.0021 },
    category: 'emergency',
    priority: 'critical',
    status: 'in-progress',
    reportedAt: '2026-08-16T12:33:00Z',
    reportedBy: 'Michael Chen',
    reporterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    assignedTeam: 'Hazmat Unit 2',
    assignedDepartment: 'Emergency Services',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '12:33 PM', completed: true },
      { label: 'Verified', time: '12:35 PM', completed: true },
      { label: 'Assigned', time: '12:36 PM', completed: true },
      { label: 'Team Dispatched', time: '12:38 PM', completed: true },
      { label: 'Repair Started', time: '12:50 PM', completed: true },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'System', action: 'Emergency alert triggered', time: '12:33 PM' },
      { user: 'Officer Park', action: 'Confirmed gas odor, area cordoned off', time: '12:35 PM' },
      { user: 'Dispatch', action: 'Hazmat Unit 2 deployed', time: '12:36 PM' },
    ],
  },
  {
    id: 'INC-7839',
    title: 'Power Line Inspection Required',
    description: 'Downed power line spotted after overnight storm in Sector 12. Line is sparking intermittently. No injuries reported but area is hazardous.',
    location: { address: 'Sector 12, Pine Avenue', neighborhood: 'Northgate', lat: 40.7282, lng: -73.9942 },
    category: 'power',
    priority: 'high',
    status: 'assigned',
    reportedAt: '2026-08-16T12:07:00Z',
    reportedBy: 'David Wilson',
    reporterAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    assignedTeam: 'Power Grid Team B',
    assignedDepartment: 'Power & Utilities',
    photo: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '12:07 PM', completed: true },
      { label: 'Verified', time: '12:12 PM', completed: true },
      { label: 'Assigned', time: '12:20 PM', completed: true },
      { label: 'Team Dispatched', time: '', completed: false },
      { label: 'Repair Started', time: '', completed: false },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'System', action: 'Incident created from citizen report', time: '12:07 PM' },
      { user: 'Officer Martinez', action: 'Verified via field check', time: '12:12 PM' },
      { user: 'Dispatch', action: 'Assigned Power Grid Team B', time: '12:20 PM' },
    ],
  },
  {
    id: 'INC-7836',
    title: 'Traffic Light Failure at Intersection',
    description: 'All traffic lights at the Pine Ave and 3rd Street intersection are non-functional. Traffic is backed up significantly. Police directing traffic manually.',
    location: { address: 'Pine Ave & 3rd St', neighborhood: 'Midtown', lat: 40.7214, lng: -73.9987 },
    category: 'public-works',
    priority: 'high',
    status: 'in-progress',
    reportedAt: '2026-08-16T11:45:00Z',
    reportedBy: 'Lisa Park',
    reporterAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    assignedTeam: 'Traffic Systems Unit',
    assignedDepartment: 'Public Works',
    photo: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '11:45 AM', completed: true },
      { label: 'Verified', time: '11:48 AM', completed: true },
      { label: 'Assigned', time: '11:52 AM', completed: true },
      { label: 'Team Dispatched', time: '11:55 AM', completed: true },
      { label: 'Repair Started', time: '12:10 PM', completed: true },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'System', action: 'Incident reported by citizen', time: '11:45 AM' },
      { user: 'Officer Kim', action: 'Verified and requested traffic support', time: '11:48 AM' },
    ],
  },
  {
    id: 'INC-7833',
    title: 'Road Pothole Cluster',
    description: 'Multiple deep potholes spanning a 200-meter stretch of Maple Boulevard. Several vehicles have reported tire damage. Road surface severely deteriorated.',
    location: { address: '800 Maple Boulevard', neighborhood: 'Oakwood', lat: 40.7068, lng: -74.0089 },
    category: 'public-works',
    priority: 'medium',
    status: 'assigned',
    reportedAt: '2026-08-16T11:20:00Z',
    reportedBy: 'Robert Taylor',
    reporterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    assignedTeam: 'Road Maintenance Crew 3',
    assignedDepartment: 'Public Works',
    photo: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '11:20 AM', completed: true },
      { label: 'Verified', time: '11:35 AM', completed: true },
      { label: 'Assigned', time: '11:50 AM', completed: true },
      { label: 'Team Dispatched', time: '', completed: false },
      { label: 'Repair Started', time: '', completed: false },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'System', action: 'Multiple citizen reports aggregated', time: '11:20 AM' },
    ],
  },
  {
    id: 'INC-7830',
    title: 'Streetlight Malfunction',
    description: 'Row of 8 streetlights on Cedar Lane are flickering and going out intermittently. Area becomes very dark at night, creating safety concerns for pedestrians.',
    location: { address: '150 Cedar Lane', neighborhood: 'Harbor District', lat: 40.7025, lng: -74.0158 },
    category: 'power',
    priority: 'medium',
    status: 'resolved',
    reportedAt: '2026-08-16T10:30:00Z',
    reportedBy: 'Emily Watson',
    reporterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    assignedTeam: 'Lighting Maintenance',
    assignedDepartment: 'Power & Utilities',
    photo: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '10:30 AM', completed: true },
      { label: 'Verified', time: '10:45 AM', completed: true },
      { label: 'Assigned', time: '11:00 AM', completed: true },
      { label: 'Team Dispatched', time: '11:15 AM', completed: true },
      { label: 'Repair Started', time: '11:30 AM', completed: true },
      { label: 'Resolved', time: '12:45 PM', completed: true },
    ],
    activityLog: [
      { user: 'Lighting Maintenance', action: 'Replaced faulty ballasts on all 8 units', time: '12:45 PM' },
    ],
  },
  {
    id: 'INC-7828',
    title: 'Illegal Dumping Site',
    description: 'Large quantities of construction debris and household waste illegally dumped behind the old factory on River Road. Environmental hazard risk.',
    location: { address: '900 River Road', neighborhood: 'Industrial Zone', lat: 40.7155, lng: -74.0134 },
    category: 'sanitation',
    priority: 'medium',
    status: 'verified',
    reportedAt: '2026-08-16T09:15:00Z',
    reportedBy: 'James Anderson',
    reporterAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    assignedTeam: null,
    assignedDepartment: 'Sanitation & Health',
    photo: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '9:15 AM', completed: true },
      { label: 'Verified', time: '9:45 AM', completed: true },
      { label: 'Assigned', time: '', completed: false },
      { label: 'Team Dispatched', time: '', completed: false },
      { label: 'Cleanup Started', time: '', completed: false },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'Officer Rivera', action: 'Verified site, documented with photos', time: '9:45 AM' },
    ],
  },
  {
    id: 'INC-7825',
    title: 'Overflowing Storm Drain',
    description: 'Storm drain at the corner of Birch St and 5th Ave is completely blocked and overflowing. Water pooling on road surface creating flooding risk during rain.',
    location: { address: 'Birch St & 5th Ave', neighborhood: 'Westside', lat: 40.7198, lng: -74.0112 },
    category: 'public-works',
    priority: 'high',
    status: 'in-progress',
    reportedAt: '2026-08-16T08:45:00Z',
    reportedBy: 'Maria Garcia',
    reporterAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    assignedTeam: 'Drainage Crew 1',
    assignedDepartment: 'Public Works',
    photo: 'https://images.unsplash.com/photo-1446776709462-d6b525c57bd3?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '8:45 AM', completed: true },
      { label: 'Verified', time: '9:00 AM', completed: true },
      { label: 'Assigned', time: '9:10 AM', completed: true },
      { label: 'Team Dispatched', time: '9:20 AM', completed: true },
      { label: 'Repair Started', time: '9:40 AM', completed: true },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [],
  },
  {
    id: 'INC-7822',
    title: 'Vandalized Bus Shelter',
    description: 'Bus shelter at stop #47 on Willow Street has been severely vandalized. Glass panels shattered, bench broken. Passengers exposed to elements.',
    location: { address: '320 Willow Street', neighborhood: 'Southgate', lat: 40.7045, lng: -74.003 },
    category: 'public-works',
    priority: 'low',
    status: 'reported',
    reportedAt: '2026-08-16T08:00:00Z',
    reportedBy: 'Patricia Brown',
    reporterAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    assignedTeam: null,
    assignedDepartment: 'Public Works',
    photo: 'https://images.unsplash.com/photo-1567449303078-57ad995bd17f?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '8:00 AM', completed: true },
      { label: 'Verified', time: '', completed: false },
      { label: 'Assigned', time: '', completed: false },
      { label: 'Team Dispatched', time: '', completed: false },
      { label: 'Repair Started', time: '', completed: false },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [],
  },
  {
    id: 'INC-7819',
    title: 'Noise Complaint - Construction',
    description: 'Unauthorized late-night construction activity at the development site on Harbor Road. Noise levels exceeding municipal limits after 10 PM.',
    location: { address: '1200 Harbor Road', neighborhood: 'Harbor District', lat: 40.7002, lng: -74.0195 },
    category: 'law-enforcement',
    priority: 'low',
    status: 'verified',
    reportedAt: '2026-08-15T23:30:00Z',
    reportedBy: 'Thomas Lee',
    reporterAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop',
    assignedTeam: 'Police Patrol 7',
    assignedDepartment: 'Law Enforcement',
    photo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '11:30 PM', completed: true },
      { label: 'Verified', time: '11:45 PM', completed: true },
      { label: 'Assigned', time: '', completed: false },
      { label: 'Team Dispatched', time: '', completed: false },
      { label: 'Investigation', time: '', completed: false },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [
      { user: 'Officer Chen', action: 'Verified noise levels exceed 75dB limit', time: '11:45 PM' },
    ],
  },
  {
    id: 'INC-7815',
    title: 'Sewer Line Backup',
    description: 'Sewage backing up through manhole cover on Ash Street. Strong odor affecting surrounding residences. Health hazard concern.',
    location: { address: '450 Ash Street', neighborhood: 'Midtown', lat: 40.7175, lng: -74.0055 },
    category: 'sanitation',
    priority: 'high',
    status: 'in-progress',
    reportedAt: '2026-08-16T07:30:00Z',
    reportedBy: 'Nancy White',
    reporterAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop',
    assignedTeam: 'Sewer Response Unit',
    assignedDepartment: 'Sanitation & Health',
    photo: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '7:30 AM', completed: true },
      { label: 'Verified', time: '7:45 AM', completed: true },
      { label: 'Assigned', time: '8:00 AM', completed: true },
      { label: 'Team Dispatched', time: '8:10 AM', completed: true },
      { label: 'Repair Started', time: '8:30 AM', completed: true },
      { label: 'Resolved', time: '', completed: false },
    ],
    activityLog: [],
  },
  {
    id: 'INC-7810',
    title: 'Fallen Tree Blocking Road',
    description: 'Large oak tree has fallen across both lanes of Parkview Drive after last night\'s storm. Road completely impassable. Power lines may be affected.',
    location: { address: 'Parkview Drive', neighborhood: 'Greenfield', lat: 40.7245, lng: -74.0178 },
    category: 'emergency',
    priority: 'high',
    status: 'resolved',
    reportedAt: '2026-08-16T06:15:00Z',
    reportedBy: 'Kevin Moore',
    reporterAvatar: 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop',
    assignedTeam: 'Emergency Response Team 1',
    assignedDepartment: 'Emergency Services',
    photo: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&h=400&fit=crop',
    timeline: [
      { label: 'Reported', time: '6:15 AM', completed: true },
      { label: 'Verified', time: '6:20 AM', completed: true },
      { label: 'Assigned', time: '6:25 AM', completed: true },
      { label: 'Team Dispatched', time: '6:30 AM', completed: true },
      { label: 'Removal Started', time: '6:45 AM', completed: true },
      { label: 'Resolved', time: '8:30 AM', completed: true },
    ],
    activityLog: [
      { user: 'ERT 1', action: 'Tree removed, road cleared', time: '8:30 AM' },
      { user: 'Power Grid Team A', action: 'Power lines inspected and secured', time: '8:45 AM' },
    ],
  },
];

// Sparkline data for KPI cards
export const INCIDENT_SPARKLINE_DATA = [
  { day: 'Mon', value: 32 },
  { day: 'Tue', value: 28 },
  { day: 'Wed', value: 45 },
  { day: 'Thu', value: 38 },
  { day: 'Fri', value: 42 },
  { day: 'Sat', value: 35 },
  { day: 'Sun', value: 48 },
];

// Chart data for analytics
export const INCIDENT_TREND_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Aug ${i + 1}`,
  reported: Math.floor(Math.random() * 20) + 10,
  resolved: Math.floor(Math.random() * 18) + 8,
}));

export const CATEGORY_DISTRIBUTION = [
  { name: 'Public Works', value: 38, color: '#3B82F6' },
  { name: 'Emergency', value: 15, color: '#EF4444' },
  { name: 'Sanitation', value: 22, color: '#22C55E' },
  { name: 'Power', value: 14, color: '#F59E0B' },
  { name: 'Law Enforcement', value: 11, color: '#8B5CF6' },
];

export const RESPONSE_TIME_DATA = [
  { department: 'Emergency', avgMinutes: 6, color: '#EF4444' },
  { department: 'Power', avgMinutes: 18, color: '#F59E0B' },
  { department: 'Public Works', avgMinutes: 25, color: '#3B82F6' },
  { department: 'Sanitation', avgMinutes: 32, color: '#22C55E' },
  { department: 'Law Enforcement', avgMinutes: 14, color: '#8B5CF6' },
];

export const NEIGHBORHOOD_HEATMAP = [
  { neighborhood: 'Downtown', incidents: 45, intensity: 0.9 },
  { neighborhood: 'Midtown', incidents: 38, intensity: 0.76 },
  { neighborhood: 'Harbor District', incidents: 32, intensity: 0.64 },
  { neighborhood: 'Oakwood', incidents: 28, intensity: 0.56 },
  { neighborhood: 'Northgate', incidents: 22, intensity: 0.44 },
  { neighborhood: 'Westside', incidents: 18, intensity: 0.36 },
  { neighborhood: 'Elm District', incidents: 15, intensity: 0.3 },
  { neighborhood: 'Southgate', incidents: 12, intensity: 0.24 },
  { neighborhood: 'Industrial Zone', incidents: 20, intensity: 0.4 },
  { neighborhood: 'Greenfield', incidents: 8, intensity: 0.16 },
];

export const DISPATCH_DISTRIBUTION = [
  { department: 'Public Works', dispatches: 142, percentage: 35, color: '#3B82F6' },
  { department: 'Emergency', dispatches: 68, percentage: 17, color: '#EF4444' },
  { department: 'Sanitation', dispatches: 95, percentage: 23, color: '#22C55E' },
  { department: 'Power', dispatches: 58, percentage: 14, color: '#F59E0B' },
  { department: 'Law Enforcement', dispatches: 45, percentage: 11, color: '#8B5CF6' },
];
