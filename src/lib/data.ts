

export type Attachment = {
  name: string;
  url: string;
  type: string;
  size?: number; // Size in bytes
};

export type TicketConversation = {
    id: string;
    authorId: string;
    authorName: string;
    content: string;
    createdAt: string;
    attachments?: Attachment[];
}

export type SLATarget = {
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  firstResponseHours: number;
  resolutionHours: number;
};

export type SLAPolicy = {
  id: string;
  name: string;
  targets: SLATarget[];
};

export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'New' | 'Active' | 'Pending' | 'On Hold' | 'Closed' | 'Terminated';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  category: 'General' | 'Support' | 'Advertising' | 'Billing' | 'Internal';
  assignee: string;
  reporter: string;
  reporterId?: string;
  reporterEmail: string;
  reporterPhone?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  project: string | null;
  attachments?: Attachment[];
  source?: 'Project' | 'Client Inquiry' | 'Internal' | 'Partner' | 'Vendor' | 'General Inquiry' | 'WhatsApp';
  organizationId: string;
  clientCanReply?: boolean;
  statusLastSetBy?: 'Admin' | 'Agent' | 'Client' | 'System';
  priorityLastSetBy?: 'Admin' | 'Agent' | 'Client' | 'System';
  // SLA Fields
  slaPolicyId?: string;
  firstResponseDue?: string;
  resolutionDue?: string;
  // CSAT Fields
  csatScore?: 1 | 2 | 3 | 4 | 5;
  csatStatus?: 'pending' | 'rated' | 'not_applicable';
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'Admin' | 'Agent' | 'Client';
  status: 'active' | 'disabled';
  phone: string;
  country?: string;
  city?: string;
  zipCode?: string;
  dob?: string; // ISO Date string
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  activityIsPublic: boolean;
  organizationId: string;
  lastSeen?: string;
  createdByAdmin?: boolean;
  createdAt?: string; // Added for sorting admins
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: 'New' | 'Active' | 'On Hold' | 'Completed';
  manager: string;
  team: string[];
  stakeholders?: string[];
  deadline: string;
  createdAt: string;
  creatorId: string;
  ticketsEnabled?: boolean;
  teamCanEditTasks?: boolean;
  organizationId: string;
  budget?: number;
  statusLastSetBy?: 'Admin' | 'Agent' | 'Client';
}

export type Task = {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed';
  assignedTo: string | null; // User ID
  dueDate: string | null;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  link: string;
  type?: 'new_assignee' | 'status_change' | 'priority_change' | 'new_reply' | 'sla_warning';
  metadata?: Record<string, any>;
};

export type EmailTemplate = {
  newTicketAutoReply: string;
  statusChange: string;
  priorityChange: string;
  newAssignee: string;
  projectInvite: string;
  agentReplyToClient: string;
  clientReplyToAgent: string;
  adminReplyToClient: string;
  adminReplyToAgent: string;
  clientReplyToAdmin: string;
  agentReplyToAdmin: string;
  slaAtRisk: string;
  slaBreached: string;
  csatRequest: string;
};

export type LoadingScreenStyle = 'spinner' | 'skeleton';

export type CannedResponse = {
    title: string;
    content: string;
};

export type WhatsAppSettings = {
  provider: 'twilio';
  accountSid: string;
  authToken: string;
  phoneNumber: string; // The Twilio WhatsApp-enabled number
};

export type Organization = {
  id:string;
  name: string;
  logo?: string;
  domain?: string;
  createdAt: string;
  settings?: {
    agentPanelEnabled?: boolean;
    clientPanelEnabled?: boolean;
    projectsEnabled?: boolean;
    clientCanSelectProject?: boolean;
    inactivityTimeout?: number;
    supportEmail?: string;
    emailTemplates?: Partial<EmailTemplate>;
    whatsapp?: Partial<WhatsAppSettings>;
    ticketStatuses?: string[];
    cannedResponses?: CannedResponse[];
    slaPolicies?: SLAPolicy[];
    // Hybrid / Org-level settings
    excludeClosedTickets?: boolean;
    // SuperAdmin managed settings
    subscriptionPlan?: string;
    subscriptionStatus?: 'Active' | 'Trialing' | 'Past Due' | 'Canceled';
    organizationStatus?: 'active' | 'suspended' | 'disabled';
  }
};


export const users: User[] = [
    { 
        id: 'usr_1', 
        name: 'Alex Johnson', 
        email: 'alex.j@example.com', 
        avatar: 'https://placehold.co/32x32/FFC0CB/4A4A4A.png?text=AJ', 
        role: 'Admin',
        status: 'active',
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
        status: 'active',
        phone: '987-654-3210',
        country: 'Spain',
        city: 'Madrid',
        zipCode: '28001',
        dob: '1992-11-20',
        gender: 'Female',
        activityIsPublic: true,
        organizationId: 'org_1'
    },
    { 
        id: 'usr_3', 
        name: 'James Smith', 
        email: 'james.s@example.com', 
        avatar: 'https://placehold.co/32x32/C2DFFF/4A4A4A.png?text=JS', 
        role: 'Agent',
        status: 'active',
        phone: '555-555-5555',
        country: 'UK',
        city: 'London',
        zipCode: 'SW1A 0AA',
        dob: '1990-01-01',
        gender: 'Male',
        activityIsPublic: false,
        organizationId: 'org_1' 
    },
    { 
        id: 'usr_4', 
        name: 'Priya Patel', 
        email: 'priya.p@example.com', 
        avatar: 'https://placehold.co/32x32/FFE6B3/4A4A4A.png?text=PP', 
        role: 'Client',
        status: 'active',
        phone: '111-222-3333',
        country: 'India',
        city: 'Mumbai',
        zipCode: '400001',
        dob: '1995-08-25',
        gender: 'Female',
        activityIsPublic: false,
        organizationId: 'org_1'
    },
];

export const tickets: Ticket[] = [
  {
    id: 'TKT-001',
    title: 'Login button not working on Safari',
    description: 'Users on Safari are reporting that the main login button on the homepage is unresponsive. Tested on Safari 15.2. Seems to be a JS issue.',
    status: 'Active',
    priority: 'High',
    category: 'Support',
    assignee: 'Maria Garcia',
    reporter: 'Priya Patel',
    reporterEmail: 'priya.p@example.com',
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-02T14:30:00Z',
    tags: ['bug', 'safari', 'login'],
    project: 'Website Redesign',
    source: 'Project',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-002',
    title: 'API endpoint for user data is slow',
    description: 'The /api/users endpoint is taking over 2000ms to respond. This is affecting dashboard load times. Needs optimization.',
    status: 'Active',
    priority: 'Urgent',
    category: 'Support',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    reporterEmail: 'priyah.p@example.com',
    createdAt: '2024-05-02T11:00:00Z',
    updatedAt: '2024-05-03T09:00:00Z',
    tags: ['performance', 'api', 'backend'],
    project: 'API V2',
    source: 'Project',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-003',
    title: 'Add a new "Export to CSV" feature',
    description: 'Users want to be able to export their transaction history to a CSV file from the analytics page.',
    status: 'New',
    priority: 'Medium',
    category: 'General',
    assignee: 'James Smith',
    reporter: 'Priya Patel',
    reporterEmail: 'priya.p@example.com',
    createdAt: '2024-05-03T15:20:00Z',
    updatedAt: '2024-05-03T15:20:00Z',
    tags: ['feature-request', 'analytics', 'csv'],
    project: 'Reporting Module',
    source: 'Project',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-004',
    title: 'Update privacy policy documentation',
    description: 'The privacy policy needs to be updated to include the new GDPR clauses discussed in the last legal meeting.',
    status: 'Pending',
    priority: 'Low',
    category: 'Billing',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    reporterEmail: 'priya.ph@example.com',
    createdAt: '2024-05-04T18:00:00Z',
    updatedAt: '2024-05-04T18:00:00Z',
    tags: ['documentation', 'legal'],
    project: 'Website Redesign',
    source: 'Internal',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-005',
    title: 'Mobile app crashing on startup for Android 12',
    description: 'Multiple users have reported the app crashes immediately after the splash screen on Android 12 devices.',
    status: 'Active',
    priority: 'Urgent',
    category: 'Support',
    assignee: 'Maria Garcia',
    reporter: 'Client Support',
    reporterEmail: 'support@requestflow.app',
    createdAt: '2024-05-05T09:30:00Z',
    updatedAt: '2024-05-05T11:00:00Z',
    tags: ['crash', 'android', 'mobile-app'],
    project: 'Mobile App Q3',
    source: 'Project',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-006',
    title: 'Email notifications are not being sent',
    description: 'Our email service integration seems to be failing. No notifications for new tickets or comments have been sent for the past 3 hours.',
    status: 'Closed',
    priority: 'High',
    category: 'Support',
    assignee: 'Alex Johnson',
    reporter: 'Internal',
    reporterEmail: 'priya.p@exampleh.com',
    createdAt: '2024-04-28T12:00:00Z',
    updatedAt: '2024-04-29T10:00:00Z',
    tags: ['email', 'outage', 'backend'],
    project: null,
    source: 'Internal',
    organizationId: 'org_1',
    clientCanReply: true,
  },
  {
    id: 'TKT-007',
    title: 'Onboarding tour for new users',
    description: 'Create a new feature: an interactive tour for first-time users to guide them through the main features of the platform.',
    status: 'On Hold',
    priority: 'Medium',
    category: 'Advertising',
    assignee: 'James Smith',
    reporter: 'Marketing',
    reporterEmail: 'marketing@requestflow.app',
    createdAt: '2024-04-15T16:00:00Z',
    updatedAt: '2024-04-20T11:45:00Z',
    tags: ['onboarding', 'feature-request', 'ux'],
    project: null,
    source: 'Internal',
    organizationId: 'org_1',
    clientCanReply: true,
  }
];

export const projects: Project[] = [
  { id: 'proj_1', name: 'Website Redesign', description: 'A complete overhaul of the public-facing website with a new design system and CMS.', status: 'Active', manager: 'usr_1', team: ['usr_2', 'usr_3'], stakeholders: ['usr_4'], deadline: '2024-07-30', createdAt: '2024-01-15', creatorId: 'usr_1', ticketsEnabled: true, teamCanEditTasks: false, organizationId: 'org_1', budget: 50000 },
  { id: 'proj_2', name: 'API V2', description: 'Development of the next version of our public API with new endpoints and improved performance.', status: 'Active', manager: 'usr_1', team: ['usr_1', 'usr_2'], deadline: '2024-06-15', createdAt: '2024-02-01', creatorId: 'usr_1', ticketsEnabled: true, teamCanEditTasks: true, organizationId: 'org_1', budget: 75000 },
  { id: 'proj_3', name: 'Reporting Module', description: 'A new module for generating and exporting custom reports for our enterprise clients.', status: 'On Hold', manager: 'usr_3', team: ['usr_3'], deadline: '2024-08-20', createdAt: '2024-03-10', creatorId: 'usr_1', ticketsEnabled: false, teamCanEditTasks: false, organizationId: 'org_1', budget: 30000 },
  { id: 'proj_4', name: 'Mobile App Q3', description: 'Adding new features to the mobile app for the third quarter, including offline support.', status: 'Completed', manager: 'usr_2', team: ['usr_2'], deadline: '2024-03-31', createdAt: '2023-12-01', creatorId: 'usr_1', ticketsEnabled: true, teamCanEditTasks: false, organizationId: 'org_1', budget: 120000 },
  { id: 'proj_5', name: 'New Project', description: 'A placeholder for a new and exciting upcoming project.', status: 'New', manager: 'usr_2', team: ['usr_1', 'usr_3'], deadline: '2025-07-08', createdAt: '2024-05-20', creatorId: 'usr_1', ticketsEnabled: true, teamCanEditTasks: false, organizationId: 'org_1', budget: 10000 },
];
