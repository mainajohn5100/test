
import { Resend } from 'resend';
import type { Ticket, User } from './data';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

if (!resend) {
  console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
}

// Basic Handlebars-like replacer
function replacePlaceholders(template: string, data: { [key: string]: any }) {
  let processed = template;

  const processObject = (prefix: string, obj: any) => {
    if (!obj) return;
    for (const [key, value] of Object.entries(obj)) {
       const stringValue = (value !== null && value !== undefined) ? String(value) : '';
       processed = processed.replace(new RegExp(`{{${prefix}.${key}}}`, 'g'), stringValue);
    }
  };
  
  processObject('ticket', data.ticket);
  processObject('user', data.user);
  processObject('inviter', data.inviter);
  processObject('project', data.project);
  processObject('replier', data.replier);

  // For general top-level keys like {{link}} or {{content}}
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'object') {
       processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }
  
  return processed;
}


interface SendEmailParams {
  to: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
  from?: string;
}

export async function sendEmail({ to, subject, template, data, from = "onboarding@resend.dev" }: SendEmailParams) {
  const html = replacePlaceholders(template, data);

  if (!resend) {
    console.log("--- SIMULATING EMAIL (RESEND_API_KEY not set) ---");
    console.log(`To: ${to}`);
    console.log(`From: ${from}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${html}`);
    console.log("-----------------------------------------------------");
    return;
  }

  try {
    await resend.emails.send({
      from,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email with Resend:', error);
    // In a real app, you might want to have more robust error handling,
    // like queuing the email for a retry.
  }
}
