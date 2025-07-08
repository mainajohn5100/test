export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'New' | 'Active' | 'Pending' | 'On Hold' | 'Closed' | 'Terminated';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  project: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Agent' | 'Customer';
};

export type Project = {
  id: string;
  name: string;
  status: 'New' | 'Active' | 'On Hold' | 'Completed';
  manager: string;
  team: string[];
  deadline: string;
  createdAt: string;
}

export const users: User[] = [
    { id: 'usr_1', name: 'Alex Johnson', email: 'alex.j@example.com', avatar: 'https://placehold.co/32x32/FFC0CB/4A4A4A.png?text=AJ', role: 'Admin' },
    { id: 'usr_2', name: 'Maria Garcia', email: 'maria.g@example.com', avatar: 'https://placehold.co/32x32/B9F2D0/4A4A4A.png?text=MG', role: 'Agent' },
    { id: 'usr_3', name: 'James Smith', email: 'james.s@example.com', avatar: 'https://placehold.co/32x32/C2DFFF/4A4A4A.png?text=JS', role: 'Agent' },
    { id: 'usr_4', name: 'Priya Patel', email: 'priya.p@example.com', avatar: 'https://placehold.co/32x32/FFE6B3/4A4A4A.png?text=PP', role: 'Customer' },
];

export const tickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Login button not working on Safari',
    description: 'Users on Safari are reporting that the main login button on the homepage is unresponsive. Tested on Safari 15.2. Seems to be a JS issue.',
    status: 'Active',
    priority: 'High',
    assignee: 'Maria Garcia',
    reporter: 'Priya Patel',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-02T14:30:00Z',
    tags: ['bug', 'safari', 'login'],
    project: 'Website Redesign'
  },
  {
    id: 'TKT-002',
    title: 'API endpoint for user data is slow',
    description: 'The /api/users endpoint is taking over 2000ms to respond. This is affecting dashboard load times. Needs optimization.',
    status: 'Active',
    priority: 'Urgent',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    createdAt: '2024-05-02T11:00:00Z',
    updatedAt: '2024-05-03T09:00:00Z',
    tags: ['performance', 'api', 'backend'],
    project: 'API V2'
  },
  {
    id: 'TKT-003',
    title: 'Add a new "Export to CSV" feature',
    description: 'Users want to be able to export their transaction history to a CSV file from the reports page.',
    status: 'New',
    priority: 'Medium',
    assignee: 'James Smith',
    reporter: 'Priya Patel',
    createdAt: '2024-05-03T15:20:00Z',
    updatedAt: '2024-05-03T15:20:00Z',
    tags: ['feature-request', 'reports', 'csv'],
    project: 'Reporting Module'
  },
  {
    id: 'TKT-004',
    title: 'Update privacy policy documentation',
    description: 'The privacy policy needs to be updated to include the new GDPR clauses discussed in the last legal meeting.',
    status: 'Pending',
    priority: 'Low',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    createdAt: '2024-05-04T18:00:00Z',
    updatedAt: '2024-05-04T18:00:00Z',
    tags: ['documentation', 'legal'],
    project: 'Website Redesign'
  },
  {
    id: 'TKT-005',
    title: 'Mobile app crashing on startup for Android 12',
    description: 'Multiple users have reported the app crashes immediately after the splash screen on Android 12 devices.',
    status: 'Active',
    priority: 'Urgent',
    assignee: 'Maria Garcia',
    reporter: 'Customer Support',
    createdAt: '2024-05-05T09:30:00Z',
    updatedAt: '2024-05-05T11:00:00Z',
    tags: ['crash', 'android', 'mobile-app'],
    project: 'Mobile App Q3'
  },
  {
    id: 'TKT-006',
    title: 'Email notifications are not being sent',
    description: 'Our email service integration seems to be failing. No notifications for new tickets or comments have been sent for the past 3 hours.',
    status: 'Closed',
    priority: 'High',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    createdAt: '2024-04-28T12:00:00Z',
    updatedAt: '2024-04-29T10:00:00Z',
    tags: ['email', 'outage', 'backend'],
    project: null,
  },
  {
    id: 'TKT-007',
    title: 'Onboarding tour for new users',
    description: 'Create a new feature: an interactive tour for first-time users to guide them through the main features of the platform.',
    status: 'On Hold',
    priority: 'Medium',
    assignee: 'James Smith',
    reporter: 'Marketing',
    createdAt: '2024-04-15T16:00:00Z',
    updatedAt: '2024-04-20T11:45:00Z',
    tags: ['onboarding', 'feature-request', 'ux'],
    project: null,
  }
];

export const projects: Project[] = [
  { id: 'proj_1', name: 'Website Redesign', status: 'Active', manager: 'usr_1', team: ['usr_2', 'usr_3'], deadline: '2024-07-30', createdAt: '2024-01-15' },
  { id: 'proj_2', name: 'API V2', status: 'Active', manager: 'usr_1', team: ['usr_1', 'usr_2'], deadline: '2024-06-15', createdAt: '2024-02-01' },
  { id: 'proj_3', name: 'Reporting Module', status: 'On Hold', manager: 'usr_3', team: ['usr_3'], deadline: '2024-08-20', createdAt: '2024-03-10' },
  { id: 'proj_4', name: 'Mobile App Q3', status: 'Completed', manager: 'usr_2', team: ['usr_2'], deadline: '2024-03-31', createdAt: '2023-12-01' },
  { id: 'proj_5', name: 'New Project', status: 'New', manager: 'usr_2', team: ['usr_1', 'usr_3'], deadline: '2025-07-08', createdAt: '2024-05-20' },
];

export const chartData = [
  { name: 'Jan', tickets: 400, closed: 240 },
  { name: 'Feb', tickets: 300, closed: 139 },
  { name: 'Mar', tickets: 200, closed: 480 },
  { name: 'Apr', tickets: 278, closed: 390 },
  { name: 'May', tickets: 189, closed: 480 },
  { name: 'Jun', tickets: 239, closed: 380 },
  { name: 'Jul', tickets: 349, closed: 430 },
];

export const pieChartData = [
    { name: 'New', value: 1, fill: 'hsl(var(--chart-1))'},
    { name: 'Active', value: 3, fill: 'hsl(var(--chart-2))' },
    { name: 'Pending', value: 1, fill: 'hsl(var(--chart-3))' },
    { name: 'On Hold', value: 1, fill: 'hsl(var(--chart-4))' },
    { name: 'Closed', value: 1, fill: 'hsl(var(--chart-5))' },
]

export const avgResolutionTimeData = [
  { name: 'Jan', days: 1.5 },
  { name: 'Feb', days: 1.2 },
  { name: 'Mar', days: 1.8 },
  { name: 'Apr', days: 1.6 },
  { name: 'May', days: 1.3 },
  { name: 'Jun', days: 1.7 },
  { name: 'Jul', days: 1.4 },
];

export const projectsByStatusData = [
  { name: 'Active', value: 2, fill: 'hsl(var(--chart-1))' },
  { name: 'On Hold', value: 1, fill: 'hsl(var(--chart-2))' },
  { name: 'Completed', value: 1, fill: 'hsl(var(--chart-3))' },
  { name: 'New', value: 1, fill: 'hsl(var(--chart-4))' },
];

export const ticketTrendsData = {
  monthly: [
    { name: 'Jan', New: 30, Active: 40, Pending: 20, Closed: 50 },
    { name: 'Feb', New: 20, Active: 30, Pending: 15, Closed: 40 },
    { name: 'Mar', New: 50, Active: 60, Pending: 25, Closed: 80 },
    { name: 'Apr', New: 40, Active: 50, Pending: 30, Closed: 70 },
    { name: 'May', New: 60, Active: 70, Pending: 35, Closed: 90 },
    { name: 'Jun', New: 55, Active: 65, Pending: 40, Closed: 85 },
  ],
  weekly: [
    { name: 'W1', New: 10, Active: 15, Pending: 5, Closed: 20 },
    { name: 'W2', New: 8, Active: 12, Pending: 7, Closed: 18 },
    { name: 'W3', New: 15, Active: 20, Pending: 10, Closed: 25 },
    { name: 'W4', New: 12, Active: 18, Pending: 8, Closed: 22 },
  ],
  daily: [
    { name: 'Mon', New: 2, Active: 5, Pending: 1, Closed: 4 },
    { name: 'Tue', New: 3, Active: 4, Pending: 2, Closed: 5 },
    { name: 'Wed', New: 1, Active: 6, Pending: 1, Closed: 3 },
    { name: 'Thu', New: 4, Active: 3, Pending: 3, Closed: 6 },
    { name: 'Fri', New: 2, Active: 7, Pending: 2, Closed: 5 },
    { name: 'Sat', New: 1, Active: 2, Pending: 1, Closed: 2 },
    { name: 'Sun', New: 0, Active: 1, Pending: 0, Closed: 1 },
  ]
};
