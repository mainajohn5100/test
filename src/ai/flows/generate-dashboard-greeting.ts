
'use server';

/**
 * @fileOverview Generates a dynamic, friendly greeting for the dashboard.
 *
 * - generateDashboardGreeting - A function that creates a greeting based on site stats.
 * - DashboardGreetingInput - The input type for the generateDashboardGreeting function.
 * - DashboardGreetingOutput - The return type for the generateDashboardGreeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DashboardGreetingInputSchema = z.object({
  totalTickets: z.number().describe('The total number of tickets in the system.'),
  openTickets: z.number().describe('The number of tickets that are not closed or terminated.'),
  newTicketsToday: z.number().describe('The number of tickets created today.'),
  totalProjects: z.number().describe('The total number of active projects.'),
  recentMessagesSummary: z.string().optional().describe('A summary of the most recent unread message. If provided, the greeting should focus on this.'),
});
export type DashboardGreetingInput = z.infer<typeof DashboardGreetingInputSchema>;

const DashboardGreetingOutputSchema = z.object({
  greeting: z.string().describe('A short, friendly, and insightful overview of the site activity. Max 20 words.'),
});
export type DashboardGreetingOutput = z.infer<typeof DashboardGreetingOutputSchema>;

export async function generateDashboardGreeting(input: DashboardGreetingInput): Promise<DashboardGreetingOutput> {
  return generateDashboardGreetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDashboardGreetingPrompt',
  input: {schema: DashboardGreetingInputSchema},
  output: {schema: DashboardGreetingOutputSchema},
  prompt: `You are an AI assistant that provides helpful, friendly, and brief summaries for a project management dashboard.
  
  Generate a very short, one-sentence summary (max 20 words) of the current status based on the following data.
  Keep the tone light and encouraging.

  {{#if recentMessagesSummary}}
  Prioritize the recent message summary. For example, "You have a new message from Alex about the login issue." or "Maria replied about the API V2 project."
  - Recent Message: {{{recentMessagesSummary}}}
  {{else}}
    {{#if (eq newTicketsToday 1)}}
      Looks like there's 1 new ticket for you to check out.
    {{else if (gt newTicketsToday 1)}}
      Looks like a busy day with {{newTicketsToday}} new tickets waiting for you.
    {{else if (gt openTickets 0)}}
      The team is focused on clearing the {{openTickets}} open tickets.
    {{else if (gt totalProjects 0)}}
      All quiet on the ticket front! A good day to focus on the {{totalProjects}} active projects.
    {{else}}
      The board is clear! No open tickets and all projects are quiet. Great work!
    {{/if}}
  {{/if}}
  
  Your response must be in the specified JSON format.
  `,
});

const generateDashboardGreetingFlow = ai.defineFlow(
  {
    name: 'generateDashboardGreetingFlow',
    inputSchema: DashboardGreetingInputSchema,
    outputSchema: DashboardGreetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
