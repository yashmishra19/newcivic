export interface Report {
  id: string;
  name: string;
  category: string;
  size: string;
  generatedDate: string;
  createdBy: string;
  fileType: 'pdf' | 'xlsx' | 'csv' | 'docx';
}

export const REPORT_CATEGORIES = [
  'All Reports',
  'Monthly Audits',
  'Incident Logs',
  'Financial Data',
  'Citizen Feedback',
  'Logistics',
  'Statistics',
];

export const MOCK_REPORTS: Report[] = [
  {
    id: 'rpt-001',
    name: 'Operational_Audit_Aug_2026.pdf',
    category: 'Monthly Audits',
    size: '4.2 MB',
    generatedDate: 'Aug 15, 2026',
    createdBy: 'Alex Mercer',
    fileType: 'pdf',
  },
  {
    id: 'rpt-002',
    name: 'Incident_Stats_Q3_Projected.xlsx',
    category: 'Statistics',
    size: '1.8 MB',
    generatedDate: 'Aug 14, 2026',
    createdBy: 'System Auto',
    fileType: 'xlsx',
  },
  {
    id: 'rpt-003',
    name: 'Sanitation_Route_Optimization.csv',
    category: 'Logistics',
    size: '850 KB',
    generatedDate: 'Aug 12, 2026',
    createdBy: 'Maria Santos',
    fileType: 'csv',
  },
  {
    id: 'rpt-004',
    name: 'July_Financial_Summary.xlsx',
    category: 'Financial Data',
    size: '2.1 MB',
    generatedDate: 'Aug 10, 2026',
    createdBy: 'Finance Dept',
    fileType: 'xlsx',
  },
  {
    id: 'rpt-005',
    name: 'Emergency_Response_Log_Week32.pdf',
    category: 'Incident Logs',
    size: '3.4 MB',
    generatedDate: 'Aug 9, 2026',
    createdBy: 'System Auto',
    fileType: 'pdf',
  },
  {
    id: 'rpt-006',
    name: 'Citizen_Satisfaction_Survey_Jul.pdf',
    category: 'Citizen Feedback',
    size: '1.2 MB',
    generatedDate: 'Aug 5, 2026',
    createdBy: 'Sarah Kim',
    fileType: 'pdf',
  },
  {
    id: 'rpt-007',
    name: 'Power_Grid_Performance_Jul.xlsx',
    category: 'Statistics',
    size: '980 KB',
    generatedDate: 'Aug 3, 2026',
    createdBy: 'System Auto',
    fileType: 'xlsx',
  },
  {
    id: 'rpt-008',
    name: 'Department_Budget_Allocation_FY27.docx',
    category: 'Financial Data',
    size: '560 KB',
    generatedDate: 'Aug 1, 2026',
    createdBy: 'Alex Mercer',
    fileType: 'docx',
  },
];
