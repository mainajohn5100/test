
# RequestFlow Onboarding Guide

Welcome to RequestFlow! This guide will help you get started, whether you're an Administrator setting up your organization, an Agent managing support tickets, or a Client submitting requests.

***

## Table of Contents
1.  [For Administrators](#for-administrators)
    *   [Initial Setup: Creating Your Organization](#initial-setup-creating-your-organization)
    *   [Managing Users](#managing-users)
    *   [Managing Projects](#managing-projects)
    *   [Understanding the Settings Panel](#understanding-the-settings-panel-admin)
2.  [For Agents](#for-agents)
    *   [Your First Login](#your-first-login)
    *   [Managing Tickets](#managing-tickets)
    *   [Working with Projects](#working-with-projects)
3.  [For Clients](#for-clients)
    *   [Your First Login](#your-first-login-client)
    *   [Submitting and Viewing Tickets](#submitting-and-viewing-tickets)
    *   [Viewing Your Projects](#viewing-your-projects)

---

## For Administrators

As an Administrator, you have full control over your organization's instance of RequestFlow. Your primary responsibilities are setting up the application, managing users, and overseeing all activity.

### Initial Setup: Creating Your Organization
Your journey begins at the signup page.
1.  **Navigate to Signup**: Go to the application's signup page.
2.  **Fill in Details**:
    *   **Your Full Name**: This will be your display name within the app.
    *   **Organization Name**: The name of your company or team.
    *   **Email & Password**: These will be your credentials for logging in.
3.  **Create Organization**: Clicking "Sign Up & Create Organization" will create your new organization, set you as the first Administrator, and take you directly to your dashboard.

### Managing Users
You are responsible for creating accounts for all Agents and Clients in your organization.
*   **Navigate to User Accounts**: Click on "User Accounts" in the main navigation.
*   **Create User**: Click the "Create User" button.
*   **Fill in Details**: Provide the user's full name, email, an initial password, and assign them a role (`Agent` or `Client`).
*   **Communicate Credentials**: You must securely provide the new user with their initial password so they can log in for the first time.

### Managing Projects
You can create and oversee all projects.
*   **Navigate to Projects**: Click on "Projects" in the main navigation.
*   **Create Project**: Click "Create New Project", fill in the details (name, description, manager, budget, deadline), and assign team members.

### Understanding the Settings Panel (Admin)
The Settings page gives you granular control over your organization.

#### **1. Personalization**
*   **Mode**: Choose between `Light`, `Dark`, or `System` themes for the application's appearance. This setting is local to your browser.
*   **Loading Screen**: Choose between a `Spinner` or `Skeleton` placeholder for loading screens. This is a personal preference.
*   **Interface Elements**:
    *   **Show Full Screen Button**: Toggles the visibility of the full-screen mode button in the header.
    *   **Exclude Closed Tickets**: When checked, all default ticket and project views will hide items with a "Closed" or "Terminated" status. As an Admin, changing this sets the default for the entire organization.

#### **2. Notifications**
*   **In-App Notifications**: Enable or disable the bell icon notifications in the app header.
*   **Email Notifications**: Enable or disable receiving notifications via email.

#### **3. Integrations**
*   **Email-to-Ticket**: Configure automatic ticket creation from emails sent to a support address.
    *   **Enable Email-to-Ticket**: Master switch to turn the feature on or off.
    *   **Your Public Support Email**: The email address your clients will use (e.g., `support@yourcompany.com`).
    *   **Your Unique Inbound Address**: The address you must forward emails *to*. You will need to set up this forwarding rule in your email provider's settings.
*   **Email Templates**: Customize the content of all automated emails sent by the system. You can use placeholders like `{{user.name}}` or `{{ticket.title}}` to personalize messages.

#### **4. Access Control**
These are global settings for your entire organization.
*   **Agent Panel / Client Panel**: Master switches to enable or disable access for all users with the "Agent" or "Client" role. Disabling a panel will prevent those users from logging in.
*   **Enable Projects Module**: Globally turns the entire Projects feature on or off for all users.
*   **Client Can Select Project**: If Projects are enabled, this allows clients to assign a new ticket to one of their associated projects during creation.

#### **5. Account**
*   **Edit Profile & Security**: Change your personal details (name, avatar) and update your password.
*   **Public Activity**: If checked, other users can see the tickets and projects you're associated with on your public profile page.
*   **Inactivity Timeout**: Set an organization-wide automatic logout time for inactive users.

---

## For Agents

As an Agent, your primary role is to manage and resolve support tickets and contribute to assigned projects.

### Your First Login
An Administrator will create your account and provide you with an initial password.
1.  Log in with your email and the provided password.
2.  It is highly recommended to change your password immediately by going to `Settings` > `Account` > `Edit Profile & Security`.
3.  Customize your profile by adding an avatar.

### Managing Tickets
*   **View Assigned Tickets**: The "Tickets" section in the navigation menu will show you views of tickets currently assigned to you.
*   **Update Tickets**: Open a ticket to view its details, conversation history, and properties. You can:
    *   Add replies to communicate with the client or other agents.
    *   Change the ticket's `Status` and `Priority`.
    *   Add or remove tags.
*   **Create Tickets**: You can also create tickets on behalf of clients.

### Working with Projects
*   **View Projects**: If you are assigned to a project as a manager or team member, it will appear in the "Projects" section.
*   **Manage Tasks**:
    *   If you are the **Project Manager**, you can add, edit, and delete tasks. You can also grant permission for the entire team to edit tasks.
    *   If you are a **Team Member**, you can view tasks. You can only edit them if the manager has enabled the "Allow Team to Edit" permission for that project.

---

## For Clients

As a Client, you can submit support requests, track their progress, and interact with the support team.

### Your First Login (Client)
An Administrator from the organization you are working with will create an account for you and provide you with your initial password.
1.  Log in using your email and the provided password.
2.  We recommend you change your password right away via the `Settings` > `Account` page.
3.  Feel free to upload a profile photo to personalize your account.

### Submitting and Viewing Tickets
*   **Create a Ticket**: Click "Tickets" > "Create Ticket" from the main menu. Fill in the title and a detailed description of your issue. You can also add attachments like screenshots.
*   **View Your Tickets**: The "Tickets" section will show you a list of all tickets you have submitted. You can filter them by status.
*   **Reply to Tickets**: Click on any ticket to view the conversation. You can add a reply to provide more information or respond to an agent, as long as the ticket is not closed.

### Viewing Your Projects
*   If you are associated with any projects, they will appear in the "Projects" section. You can click into a project to view its overall status, tasks, and any related tickets you have submitted.
