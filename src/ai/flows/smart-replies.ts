
'use server';

/**
 * @fileOverview This flow is deprecated. Canned responses are now handled by a manual template picker.
 *
 * - generateSmartReply - DEPRECATED
 * - SmartReplyInput - DEPRECATED
 * - SmartReplyOutput - DEPRECATED
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartReplyInputSchema = z.object({
  ticketContent: z.string().describe('The content of the current ticket.'),
  userHistory: z.string().describe('A summary of previous tickets from the same user.'),
  cannedResponses: z.string().describe('A list of canned responses available to the agent.'),
});
export type SmartReplyInput = z.infer<typeof SmartReplyInputSchema>;

const SmartReplyOutputSchema = z.object({
  suggestedReply: z.string().describe('A suggested reply for the agent to use.'),
});
export type SmartReplyOutput = z.infer<typeof SmartReplyOutputSchema>;

export async function generateSmartReply(input: SmartReplyInput): Promise<SmartReplyOutput> {
  // This is deprecated, return a simple response.
  return { suggestedReply: "This feature has been replaced by manual templates." };
}

const smartReplyFlow = ai.defineFlow(
  {
    name: 'smartReplyFlow',
    inputSchema: SmartReplyInputSchema,
    outputSchema: SmartReplyOutputSchema,
  },
  async input => {
    return { suggestedReply: "This feature has been replaced by manual templates." };
  }
);
