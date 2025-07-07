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
  project: string;
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
}

export const users: User[] = [
  { id: 'usr_1', name: 'Alex Johnson', email: 'alex@example.com', avatar: 'https://placehold.co/32x32/BDE0FE/4A4A4A.png?text=AJ', role: 'Admin' },
  { id: 'usr_2', name: 'Maria Garcia', email: 'maria@example.com', avatar: 'https://placehold.co/32x32/cdb4db/4A4A4A.png?text=MG', role: 'Agent' },
  { id: 'usr_3', name: 'James Smith', email: 'james@example.com', avatar: 'https://placehold.co/32x32/ffc8dd/4A4A4A.png?text=JS', role: 'Agent' },
  { id: 'usr_4', name: 'Priya Patel', email: 'priya@example.com', avatar: 'https://placehold.co/32x32/ffafcc/4A4A4A.png?text=PP', role: 'Customer' },
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
    project: 'API V2'
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
    project: 'Reporting Module'
  }
];

export const projects: Project[] = [
  { id: 'proj_1', name: 'Website Redesign', status: 'Active', manager: 'Alex Johnson', team: ['usr_2', 'usr_3'], deadline: '2024-07-30' },
  { id: 'proj_2', name: 'API V2', status: 'Active', manager: 'Alex Johnson', team: ['usr_1', 'usr_2'], deadline: '2024-06-15' },
  { id: 'proj_3', name: 'Reporting Module', status: 'On Hold', manager: 'James Smith', team: ['usr_3'], deadline: '2024-08-20' },
  { id: 'proj_4', name: 'Mobile App Q3', status: 'Completed', manager: 'Maria Garcia', team: ['usr_2'], deadline: '2024-03-31' },
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
    { name: 'New', value: 1, fill: 'var(--chart-1)'},
    { name: 'Active', value: 3, fill: 'var(--chart-2)' },
    { name: 'Pending', value: 1, fill: 'var(--chart-3)' },
    { name: 'On Hold', value: 1, fill: 'var(--chart-4)' },
    { name: 'Closed', value: 1, fill: 'var(--chart-5)' },
]
