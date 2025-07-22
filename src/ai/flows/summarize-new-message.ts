'use server';

/**
 * @fileOverview Summarizes a new chat message for notifications.
 *
 * - summarizeNewMessage - A function that creates a summary for a new message.
 * - SummarizeNewMessageInput - The input type for the summarizeNewMessage function.
 * - SummarizeNewMessageOutput - The return type for the summarizeNewMessage function.
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
  return summarizeNewMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNewMessagePrompt',
  input: {schema: SummarizeNewMessageInputSchema},
  output: {schema: SummarizeNewMessageOutputSchema},
  prompt: `You are an AI assistant that writes concise notification summaries.
  
  Summarize the following message into a very short phrase (max 10 words).
  The summary must start with the sender's name.

  - Sender: {{{from}}}
  - Ticket Title: {{{ticketTitle}}}
  - Message: {{{message}}}
  
  Example: "Priya asked for an update on the Safari bug."
  
  Your response must be in the specified JSON format.
  `,
});

const summarizeNewMessageFlow = ai.defineFlow(
  {
    name: 'summarizeNewMessageFlow',
    inputSchema: SummarizeNewMessageInputSchema,
    outputSchema: SummarizeNewMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
