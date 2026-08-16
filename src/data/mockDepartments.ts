export interface Department {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'operational' | 'limited' | 'offline';
  stats: { label: string; value: string | number }[];
  color: string;
  headCount: number;
  budget: string;
}

export const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 'dept-pw',
    name: 'Public Works',
    description: 'Responsible for roads, bridges, water systems, and public infrastructure maintenance across all municipal districts.',
    icon: 'Wrench',
    status: 'operational',
    stats: [
      { label: 'Teams', value: 12 },
      { label: 'Active', value: 42 },
      { label: 'Uptime', value: '98%' },
    ],
    color: '#3B82F6',
    headCount: 186,
    budget: '$4.2M',
  },
  {
    id: 'dept-em',
    name: 'Emergency Services',
    description: 'First responders handling fire, hazmat, rescue, and all emergency civic situations requiring immediate deployment.',
    icon: 'Siren',
    status: 'operational',
    stats: [
      { label: 'Units', value: 18 },
      { label: 'Alerts', value: 5 },
      { label: 'Response', value: '6m' },
    ],
    color: '#EF4444',
    headCount: 245,
    budget: '$8.1M',
  },
  {
    id: 'dept-san',
    name: 'Sanitation & Health',
    description: 'Waste management, environmental health inspections, pest control, and public hygiene maintenance operations.',
    icon: 'Recycle',
    status: 'operational',
    stats: [
      { label: 'Vehicles', value: 34 },
      { label: 'Routes', value: 22 },
      { label: 'SLA', value: '94%' },
    ],
    color: '#22C55E',
    headCount: 142,
    budget: '$3.8M',
  },
  {
    id: 'dept-pow',
    name: 'Power & Utilities',
    description: 'Electrical grid management, streetlight maintenance, utility line inspections, and power infrastructure oversight.',
    icon: 'Zap',
    status: 'limited',
    stats: [
      { label: 'Grids', value: 8 },
      { label: 'Active', value: 14 },
      { label: 'Load', value: '72%' },
    ],
    color: '#F59E0B',
    headCount: 98,
    budget: '$5.6M',
  },
  {
    id: 'dept-law',
    name: 'Law Enforcement',
    description: 'Community policing, traffic management, code enforcement, and public safety coordination across all districts.',
    icon: 'Shield',
    status: 'operational',
    stats: [
      { label: 'Officers', value: 142 },
      { label: 'Patrols', value: 28 },
      { label: 'Active', value: 12 },
    ],
    color: '#8B5CF6',
    headCount: 312,
    budget: '$12.4M',
  },
];
