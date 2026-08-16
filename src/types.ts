export type IssueSeverity = 'critical' | 'moderate' | 'low' | 'resolved';

export type IssueCategory = 
  | 'pothole'
  | 'street_light'
  | 'water_leak'
  | 'traffic_signal'
  | 'graffiti'
  | 'sidewalk'
  | 'illegal_dumping'
  | 'fallen_tree';

export interface TimelineEvent {
  id: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actorRole: 'citizen' | 'city_agent' | 'contractor' | 'system';
}

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  isOfficial?: boolean;
}

export interface CivicIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: IssueSeverity;
  status: 'reported' | 'in_progress' | 'scheduled' | 'resolved';
  description: string;
  location: {
    address: string;
    neighborhood: string;
    lat: number;
    lng: number;
    jurisdiction?: 'Public' | 'Private';
  };
  reportedAt: string;
  reportedBy: {
    name: string;
    avatar: string;
    badge?: string;
  };
  imageUrl: string;
  resolvedImageUrl?: string;
  upvotes: number;
  hasUpvoted?: boolean;
  assignedDepartment: string;
  estimatedFixTime?: string;
  timeline: TimelineEvent[];
  comments: Comment[];
  aiAnalysis?: {
    detectedHazard: string;
    confidence: number;
    recommendedPriority: string;
    estimatedRepairCost?: string;
  };
}

export interface FilterOptions {
  searchQuery: string;
  category: string;
  severity: string;
  status: string;
  sortBy: 'newest' | 'upvotes' | 'severity';
}
