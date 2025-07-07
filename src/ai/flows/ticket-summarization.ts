// src/ai/flows/ticket-summarization.ts
'use server';

/**
 * @fileOverview A flow to summarize ticket content for project leads.
 *
 * - summarizeTicket - A function that summarizes the ticket content.
 * - SummarizeTicketInput - The input type for the summarizeTicket function.
 * - SummarizeTicketOutput - The return type for the summarizeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeTicketInputSchema = z.object({
  ticketContent: z
    .string()
    .describe('The full content of the ticket to be summarized.'),
});
export type SummarizeTicketInput = z.infer<typeof SummarizeTicketInputSchema>;

const SummarizeTicketOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise summary of the ticket content for project leads.'),
});
export type SummarizeTicketOutput = z.infer<typeof SummarizeTicketOutputSchema>;

export async function summarizeTicket(input: SummarizeTicketInput): Promise<SummarizeTicketOutput> {
  return summarizeTicketFlow(input);
}

const summarizeTicketPrompt = ai.definePrompt({
  name: 'summarizeTicketPrompt',
  input: {schema: SummarizeTicketInputSchema},
  output: {schema: SummarizeTicketOutputSchema},
  prompt: `You are an AI assistant helping project leads quickly understand ticket context and progress.
  Summarize the following ticket content into a concise summary that highlights the key issues, progress, and any required actions.
  Ticket Content: {{{ticketContent}}}`,
});

const summarizeTicketFlow = ai.defineFlow(
  {
    name: 'summarizeTicketFlow',
    inputSchema: SummarizeTicketInputSchema,
    outputSchema: SummarizeTicketOutputSchema,
  },
  async input => {
    const {output} = await summarizeTicketPrompt(input);
    return output!;
  }
);
