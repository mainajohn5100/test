'use server';

/**
 * @fileOverview Provides smart replies to speed up agent response times.
 *
 * - generateSmartReply - Generates a smart reply based on the ticket and user history.
 * - SmartReplyInput - The input type for the generateSmartReply function.
 * - SmartReplyOutput - The return type for the generateSmartReply function.
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
  return smartReplyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartReplyPrompt',
  input: {schema: SmartReplyInputSchema},
  output: {schema: SmartReplyOutputSchema},
  prompt: `You are an AI assistant helping agents respond to tickets quickly.

  Given the current ticket content, a summary of the user's past tickets, and a list of canned responses, suggest the most appropriate reply for the agent to use.

  Current Ticket:
  {{ticketContent}}

  User History:
  {{userHistory}}

  Canned Responses:
  {{cannedResponses}}

  Suggested Reply:`,
});

const smartReplyFlow = ai.defineFlow(
  {
    name: 'smartReplyFlow',
    inputSchema: SmartReplyInputSchema,
    outputSchema: SmartReplyOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
