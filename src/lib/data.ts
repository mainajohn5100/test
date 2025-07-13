
export type Attachment = {
  name: string;
  url: string;
  type: string;
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'New' | 'Active' | 'Pending' | 'On Hold' | 'Closed' | 'Terminated';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  assignee: string;
  reporter: string;
  reporterEmail?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  project: string | null;
  attachments?: Attachment[];
  source?: 'Project' | 'Client Inquiry' | 'Internal' | 'Partner' | 'Vendor' | 'General Inquiry';
  organizationId: string;
};

export type TicketConversation = {
    id: string;
    authorId: string;
    content: string;
    createdAt: string;
}

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Agent' | 'Client';
  phone?: string;
  country?: string;
  city?: string;
  zipCode?: string;
  dob?: string; // ISO Date string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  activityIsPublic: boolean;
  organizationId: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'Active' | 'On Hold' | 'Completed';
  manager: string;
  team: string[];
  deadline: string;
  createdAt: string;
  creatorId: string;
  ticketsEnabled?: boolean;
  organizationId: string;
}

export type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link: string;
};


export const users: User[] = [
    { 
        id: 'usr_1', 
        name: 'Alex Johnson', 
        email: 'alex.j@example.com', 
        avatar: 'https://placehold.co/32x32/FFC0CB/4A4A4A.png?text=AJ', 
        role: 'Admin',
        phone: '123-456-7890',
        country: 'USA',
        city: 'New York',
        zipCode: '10001',
        dob: '1985-05-15',
        gender: 'Male',
        activityIsPublic: false,
        organizationId: 'org_1'
    },
    { 
        id: 'usr_2', 
        name: 'Maria Garcia', 
        email: 'maria.g@example.com', 
        avatar: 'https://placehold.co/32x32/B9F2D0/4A4A4A.png?text=MG', 
        role: 'Agent',
        phone: '987-654-3210',
        country: 'Spain',
        city: 'Madrid',
        zipCode: '28001',
        dob: '1992-11-20',
        gender: 'Female',
        activityIsPublic: true,
        organizationId: 'org_1'
    },
    { id: 'usr_3', name: 'James Smith', email: 'james.s@example.com', avatar: 'https://placehold.co/32x32/C2DFFF/4A4A4A.png?text=JS', role: 'Agent', activityIsPublic: false, organizationId: 'org_1' },
    { id: 'usr_4', name: 'Priya Patel', email: 'priya.p@example.com', avatar: 'https://placehold.co/32x32/FFE6B3/4A4A4A.png?text=PP', role: 'Client', activityIsPublic: false, organizationId: 'org_1' },
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
    reporterEmail: 'priya.p@example.com',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-02T14:30:00Z',
    tags: ['bug', 'safari', 'login'],
    project: 'Website Redesign',
    source: 'Project',
    organizationId: 'org_1',
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
    project: 'API V2',
    source: 'Project',
    organizationId: 'org_1',
  },
  {
    id: 'TKT-003',
    title: 'Add a new "Export to CSV" feature',
    description: 'Users want to be able to export their transaction history to a CSV file from the reports page.',
    status: 'New',
    priority: 'Medium',
    assignee: 'James Smith',
    reporter: 'Priya Patel',
    reporterEmail: 'priya.p@example.com',
    createdAt: '2024-05-03T15:20:00Z',
    updatedAt: '2024-05-03T15:20:00Z',
    tags: ['feature-request', 'reports', 'csv'],
    project: 'Reporting Module',
    source: 'Project',
    organizationId: 'org_1',
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
    project: 'Website Redesign',
    source: 'Internal',
    organizationId: 'org_1',
  },
  {
    id: 'TKT-005',
    title: 'Mobile app crashing on startup for Android 12',
    description: 'Multiple users have reported the app crashes immediately after the splash screen on Android 12 devices.',
    status: 'Active',
    priority: 'Urgent',
    assignee: 'Maria Garcia',
    reporter: 'Client Support',
    reporterEmail: 'support@requestflow.app',
    createdAt: '2024-05-05T09:30:00Z',
    updatedAt: '2024-05-05T11:00:00Z',
    tags: ['crash', 'android', 'mobile-app'],
    project: 'Mobile App Q3',
    source: 'Project',
    organizationId: 'org_1',
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
    source: 'Internal',
    organizationId: 'org_1',
  },
  {
    id: 'TKT-007',
    title: 'Onboarding tour for new users',
    description: 'Create a new feature: an interactive tour for first-time users to guide them through the main features of the platform.',
    status: 'On Hold',
    priority: 'Medium',
    assignee: 'James Smith',
    reporter: 'Marketing',
    reporterEmail: 'marketing@requestflow.app',
    createdAt: '2024-04-15T16:00:00Z',
    updatedAt: '2024-04-20T11:45:00Z',
    tags: ['onboarding', 'feature-request', 'ux'],
    project: null,
    source: 'Internal',
    organizationId: 'org_1',
  }
];

export const projects: Project[] = [
  { id: 'proj_1', name: 'Website Redesign', description: 'A complete overhaul of the public-facing website with a new design system and CMS.', status: 'Active', manager: 'usr_1', team: ['usr_2', 'usr_3'], deadline: '2024-07-30', createdAt: '2024-01-15', creatorId: 'usr_1', ticketsEnabled: true, organizationId: 'org_1' },
  { id: 'proj_2', name: 'API V2', description: 'Development of the next version of our public API with new endpoints and improved performance.', status: 'Active', manager: 'usr_1', team: ['usr_1', 'usr_2'], deadline: '2024-06-15', createdAt: '2024-02-01', creatorId: 'usr_1', ticketsEnabled: true, organizationId: 'org_1' },
  { id: 'proj_3', name: 'Reporting Module', description: 'A new module for generating and exporting custom reports for our enterprise clients.', status: 'On Hold', manager: 'usr_3', team: ['usr_3'], deadline: '2024-08-20', createdAt: '2024-03-10', creatorId: 'usr_1', ticketsEnabled: false, organizationId: 'org_1' },
  { id: 'proj_4', name: 'Mobile App Q3', description: 'Adding new features to the mobile app for the third quarter, including offline support.', status: 'Completed', manager: 'usr_2', team: ['usr_2'], deadline: '2024-03-31', createdAt: '2023-12-01', creatorId: 'usr_1', ticketsEnabled: true, organizationId: 'org_1' },
  { id: 'proj_5', name: 'New Project', description: 'A placeholder for a new and exciting upcoming project.', status: 'New', manager: 'usr_2', team: ['usr_1', 'usr_3'], deadline: '2025-07-08', createdAt: '2024-05-20', creatorId: 'usr_1', ticketsEnabled: true, organizationId: 'org_1' },
];
