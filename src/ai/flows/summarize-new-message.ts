
'use server';

/**
 * @fileOverview This flow is deprecated. Notification summaries are now handled with simple truncation.
 *
 * - summarizeNewMessage - DEPRECATED
 * - SummarizeNewMessageInput - DEPRECATED
 * - SummarizeNewMessageOutput - DEPRECATED
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeNewMessageInputSchema = z.object({
  from: z.string().describe("The name of the person who sent the message."),
  message: z.string().describe('The content of the new message.'),
  ticketTitle: z.string().describe('The title of the ticket the message is on.'),
});
export type SummarizeNewMessageInput = z.infer<typeof SummarizeNewMessageInputSchema>;

const SummarizeNewMessageOutputSchema = z.object({
  summary: z.string().describe('A very brief summary of the message, including who sent it. e.g., "Alex replied about the login issue." Max 10 words.'),
});
export type SummarizeNewMessageOutput = z.infer<typeof SummarizeNewMessageOutputSchema>;

export async function summarizeNewMessage(input: SummarizeNewMessageInput): Promise<SummarizeNewMessageOutput> {
  // This is deprecated, return a simple response.
  return { summary: "This feature has been deprecated." };
}

const summarizeNewMessageFlow = ai.defineFlow(
  {
    name: 'summarizeNewMessageFlow',
    inputSchema: SummarizeNewMessageInputSchema,
    outputSchema: SummarizeNewMessageOutputSchema,
  },
  async input => {
    return { summary: "This feature has been deprecated." };
  }
);
