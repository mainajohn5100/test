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
  subject: z.string().describe('The subject line of the email.'),
  body: z.string().describe('The body content of the email.'),
});
export type AnalyzeEmailPriorityInput = z.infer<typeof AnalyzeEmailPriorityInputSchema>;

const AnalyzeEmailPriorityOutputSchema = z.object({
  priority: priorityLevels.describe('The determined priority level for the ticket.'),
});
export type AnalyzeEmailPriorityOutput = z.infer<typeof AnalyzeEmailPriorityOutputSchema>;

export async function analyzeEmailPriority(input: AnalyzeEmailPriorityInput): Promise<AnalyzeEmailPriorityOutput> {
  return analyzeEmailPriorityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeEmailPriorityPrompt',
  input: {schema: AnalyzeEmailPriorityInputSchema},
  output: {schema: AnalyzeEmailPriorityOutputSchema},
  prompt: `You are a ticket prioritization expert for a customer support team. Your task is to analyze the content of an incoming email and assign a priority level.

  Analyze the subject and body for sentiment and urgency. Look for keywords indicating a critical issue (e.g., "urgent", "ASAP", "down", "broken", "cannot access") versus less critical requests (e.g., "question", "suggestion", "feedback").

  Based on your analysis, assign one of the following priority levels: Low, Medium, High, or Urgent.

  Subject: {{{subject}}}
  Body: {{{body}}}

  Return only the assigned priority in the "priority" field.
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
