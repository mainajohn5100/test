'use server';

/**
 * @fileOverview Analyzes email content to determine its source for ticket flagging.
 *
 * - analyzeEmailForSource - A function that analyzes an email to determine its source.
 * - AnalyzeEmailForSourceInput - The input type for the analyzeEmailForSource function.
 * - AnalyzeEmailForSourceOutput - The return type for the analyzeEmailForSource function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ticketSources = z.enum(['Partner', 'Vendor', 'General Inquiry', 'Internal']);

const AnalyzeEmailForSourceInputSchema = z.object({
  fromAddress: z.string().email().describe("The sender's email address."),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type AnalyzeEmailForSourceInput = z.infer<typeof AnalyzeEmailForSourceInputSchema>;

const AnalyzeEmailForSourceOutputSchema = z.object({
  source: ticketSources.describe('The determined source of the ticket.'),
});
export type AnalyzeEmailForSourceOutput = z.infer<typeof AnalyzeEmailForSourceOutputSchema>;

export async function analyzeEmailForSource(input: AnalyzeEmailForSourceInput): Promise<AnalyzeEmailForSourceOutput> {
  return analyzeEmailForSourceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmailForSourcePrompt',
  input: {schema: AnalyzeEmailForSourceInputSchema},
  output: {schema: AnalyzeEmailForSourceOutputSchema},
  prompt: `You are a ticket categorization expert. Your task is to analyze an incoming email and determine its source based on the content and sender.

  Analyze the email signature, domain, and language to determine if it is from a known partner, a vendor providing services to us, or an internal employee. If none of these categories fit, classify it as a 'General Inquiry'.

  - If the email is from a known partner domain (e.g., @partner.com, @synergy.co), classify as 'Partner'.
  - If the email discusses invoices, services provided to us, or is from a known vendor domain (e.g., @vendor.net, @supplyco.com), classify as 'Vendor'.
  - If the email is from an internal company domain (@requestflow.app), classify as 'Internal'.
  - Otherwise, classify as 'General Inquiry'.

  From: {{{fromAddress}}}
  Subject: {{{subject}}}
  Body: {{{body}}}

  Return your analysis in the specified JSON format.
  `,
});

const analyzeEmailForSourceFlow = ai.defineFlow(
  {
    name: 'analyzeEmailForSourceFlow',
    inputSchema: AnalyzeEmailForSourceInputSchema,
    outputSchema: AnalyzeEmailForSourceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
