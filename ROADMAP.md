# Project Roadmap & Pending Tasks

This document outlines the features and improvements that have been discussed but are not yet fully implemented. It serves as a guide for future development work.

## 1. SLA Breach Notifications

**Status:** Partially Implemented

-   **What's Done:** SLA policies can be defined in the settings, and tickets are correctly assigned SLA due dates. The UI now displays real-time countdowns and visual indicators (On Track, At Risk, Breached) on the ticket view page.
-   **What's Left:** The crucial backend component for **automated breach notifications** is pending. This requires setting up a scheduled function (e.g., a cron job or Firebase Scheduled Function) that runs periodically to:
    1.  Query for tickets that are nearing their SLA deadline.
    2.  Send notifications (in-app and/or email) to the assigned agent or an administrator to alert them of the impending breach.

## 2. M-Pesa Subscription Integration

**Status:** Not Started (Discussion Only)

-   **What's Left:** This is a major feature that would require a full implementation cycle. The high-level steps are:
    1.  **Frontend:** Create a "Billing" or "Subscription" page in the settings for users to select a plan and enter their phone number.
    2.  **Backend:**
        -   Integrate the M-Pesa Daraja API using the official SDK.
        -   Create a secure endpoint to initiate an STK Push to the user's phone.
        -   Create a callback endpoint (`/api/mpesa-callback`) to receive payment confirmations from Safaricom.
        -   Set up a recurring scheduled task (cron job) to handle monthly renewals.
    3.  **Database:** Update the `Organization` data model to include subscription status, plan details, and next billing date.

## 3. Email & WhatsApp Channel Configuration

**Status:** Partially Implemented

-   **Email (Resend):** The inbound email webhook (`/api/inbound-email`) is functional for creating tickets. However, the UI for configuring the public-facing support email in the "Channels" page is currently disabled and marked with a `TODO`. The final step of linking a custom domain for receiving emails also needs to be completed in the Resend dashboard.
-   **WhatsApp (Twilio):** The inbound webhook and basic user creation/reply logic are in place. The configuration UI is present, but the entire flow requires thorough end-to-end testing to ensure reliability.

## 4. Minor UI & Feature Todos

-   **User Avatar Uploads:** The UI for uploading a custom profile picture in the "Edit Profile" dialog is present but the functionality is currently disabled.
-   **Community Forum:** The "Community Forum" button on the `/support` page is currently a disabled placeholder and needs to be linked to an actual forum or removed.
