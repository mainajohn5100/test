
import sgMail from '@sendgrid/mail';
import type { Ticket, User } from './data';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn("SENDGRID_API_KEY is not set. Email sending will be disabled.");
}

// Basic Handlebars-like replacer
function replacePlaceholders(template: string, data: { ticket: Ticket; user: User | null; [key: string]: any }) {
  let processed = template;
  
  // Replace ticket placeholders
  if (data.ticket) {
    for (const [key, value] of Object.entries(data.ticket)) {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      processed = processed.replace(new RegExp(`{{ticket.${key}}}`, 'g'), stringValue);
    }
  }

  // Replace user placeholders
  if (data.user) {
    for (const [key, value] of Object.entries(data.user)) {
       const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      processed = processed.replace(new RegExp(`{{user.${key}}}`, 'g'), stringValue);
    }
  }
  
  return processed;
}

interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  data: {
    ticket: Ticket;
    user: User | null;
    [key: string]: any;
  };
  from?: string;
}

export async function sendEmail({ to, subject, template, data, from = "noreply@requestflow.app" }: SendEmailParams) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log("--- SIMULATING EMAIL (SENDGRID_API_KEY not set) ---");
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    const body = replacePlaceholders(template, data);
    console.log(`Body:\n${body}`);
    console.log("-----------------------------------------------------");
    return;
  }

  const html = replacePlaceholders(template, data);
  const text = html.replace(/<[^>]*>?/gm, ''); // Simple conversion to text

  const msg = {
    to,
    from, // Use a verified sender from your SendGrid account
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email with SendGrid:', error);
    // In a real app, you might want to have more robust error handling,
    // like queuing the email for a retry.
  }
}
