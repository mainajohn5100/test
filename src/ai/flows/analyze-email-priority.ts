
'use server';

/**
 * @fileOverview Analyzes email content to determine priority for a new ticket.
 *
 * - analyzeEmailPriority - A function that analyzes email content for priority.
 * - AnalyzeEmailPriorityInput - The input type for the analyzeEmailPriority function.
 * - AnalyzeEmailPriorityOutput - The return type for the analyzeEmailPriority function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const priorityLevels = z.enum(['Low', 'Medium', 'High', 'Urgent']);

const AnalyzeEmailPriorityInputSchema = z.object({
  fromAddress: z.string().email().describe("The sender's email address."),
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type AnalyzeEmailPriorityInput = z.infer<typeof AnalyzeEmailPriorityInputSchema>;

const AnalyzeEmailPriorityOutputSchema = z.object({
  isSystemNotification: z.boolean().describe('Whether the email is a system-generated notification that should be ignored.'),
  priority: priorityLevels.describe('The determined priority level for the ticket. Set to Low if it is a system notification.'),
});
export type AnalyzeEmailPriorityOutput = z.infer<typeof AnalyzeEmailPriorityOutputSchema>;

export async function analyzeEmailPriority(input: AnalyzeEmailPriorityInput): Promise<AnalyzeEmailPriorityOutput> {
  return analyzeEmailPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmailPriorityPrompt',
  input: {schema: AnalyzeEmailPriorityInputSchema},
  output: {schema: AnalyzeEmailPriorityOutputSchema},
  prompt: `You are a ticket prioritization expert for a customer support team. Your task is to analyze an incoming email and determine if it should be converted into a ticket.

  First, check if the email is a system-generated notification from RequestFlow itself, which should be ignored. Look for subjects starting with "[RequestFlow-Notification]" or if the from address is "noreply@requestflow.app". If it is a notification, set 'isSystemNotification' to true and priority to 'Low'.

  If it's not a system notification, analyze the subject and body for sentiment and urgency to assign a priority level. Look for keywords indicating a critical issue (e.g., "urgent", "ASAP", "down", "broken", "cannot access") versus less critical requests (e.g., "question", "suggestion", "feedback"). Assign one of the following priority levels: Low, Medium, High, or Urgent. Set 'isSystemNotification' to false.

  From: {{{fromAddress}}}
  Subject: {{{subject}}}
  Body: {{{body}}}

  Return your analysis in the specified JSON format.
  `,
});

const analyzeEmailPriorityFlow = ai.defineFlow(
  {
    name: 'analyzeEmailPriorityFlow',
    inputSchema: AnalyzeEmailPriorityInputSchema,
    outputSchema: AnalyzeEmailPriorityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
