# **App Name**: RequestFlow

## Core Features:

- Ticket Creation: New ticket creation with detailed fields (description, priority, attachments).
- Email Integration: Automatic email notification system to agents for new and updated tickets.
- Ticket Management: View, sort and filter tickets by status, assignee, or other criteria.
- Ticket Updates: Update ticket status, priority, and other details. Use an LLM as a tool to evaluate any custom tags and sort appropriately.
- Role Based Access: Three user panels with distinct capabilities (Admin, Agent, Customer).
- Ticket Communication: Add comments and updates to existing tickets.
- AI powered summary tool: Generate automatic summary from tickets for progress reporting using LLMs
- Query Conversion: Converts emails into tickets automatically.
- Main Dashboard: Displays recent tickets with options to filter and sort them.
- App Navigation: The app navigation Includes the following: 1. Main dashboard, 2. tickets dropdown tab (all tickets, new tickets, pending tickets, on hold, closed, active, terminated tickets), 3. reports tab (graphs and charts), 4. projects tab (new, all, active, on hold, completed projects), 5. User Accounts Management, and 6. settings tab.
- Reporting Overview: Provides a simplified view of key reports on the dashboard using graphs and charts, with options to print or download the reports.
- Intelligent Tagging: Uses an AI tool to suggest appropriate tags for categorizing new tickets automatically based on the query content, improving organization.
- Smart Replies: Employ an AI tool to automatically suggest a relevant canned response from a library of responses, or offer a summary of previous tickets from the same user to speed response times.
- Status Updates: Allows users to set statuses on a ticket.
- Vertical Navigation: Navigation tabs are arranged vertically on the left side of the screen for easy access.
- Project Management: Manages projects with statuses such as new, all, active, on hold, and completed.
- Knowledge Base: A centralized repository for storing and sharing helpful articles, FAQs, and documentation to assist users in resolving issues independently.
- Time Tracking: Allows users to track the time spent on individual tickets or projects for accurate billing and resource allocation.
- Invoice Generation: Creates invoices based on tracked time and project milestones, streamlining the billing process for small and medium sized companies/enterprises
- Customer Relationship Management: Customer Relationship Management (CRM): Integrates basic CRM functionality to manage customer profiles, interactions, and history for improved customer service.
- Infrastructure: Prisma will be used for persistent storage, sentry for bug fixing, add sla rules and other libraries and frameworks that seem useful

## Style Guidelines:

- Primary color: Soft, data-focused light blue (#BDE0FE).
- Background color: Light, desaturated blue (#a2d2ff).
- Accent color: Gentle, complimentary light purple (#cdb4db).
- Body font: 'Raleway', objective look suitable for body text.
- Headline font: 'Montserrat', that will be suitable for short amounts of text.
- Professional, consistent icons representing ticket status and actions.
- Clean, organized layout with clear information hierarchy and data presentation.