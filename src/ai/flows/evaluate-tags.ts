'use server';

/**
 * @fileOverview Evaluates custom tags for a ticket and sorts them appropriately.
 *
 * - evaluateTags - A function that evaluates and sorts custom tags for a ticket.
 * - EvaluateTagsInput - The input type for the evaluateTags function.
 * - EvaluateTagsOutput - The return type for the evaluateTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateTagsInputSchema = z.object({
  tags: z
    .array(z.string())
    .describe('An array of custom tags for a ticket.'),
  description: z.string().describe('The description of the ticket.'),
});
export type EvaluateTagsInput = z.infer<typeof EvaluateTagsInputSchema>;

const EvaluateTagsOutputSchema = z.object({
  sortedTags: z
    .array(z.string())
    .describe('The tags sorted based on their relevance to the ticket.'),
});
export type EvaluateTagsOutput = z.infer<typeof EvaluateTagsOutputSchema>;

export async function evaluateTags(input: EvaluateTagsInput): Promise<EvaluateTagsOutput> {
  return evaluateTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateTagsPrompt',
  input: {schema: EvaluateTagsInputSchema},
  output: {schema: EvaluateTagsOutputSchema},
  prompt: `You are an expert ticket triage agent.

You will receive a list of tags and a description of a ticket.

Based on the description, you will sort the tags in order of relevance to the ticket.

Description: {{{description}}}
Tags: {{#each tags}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Return the sorted tags in the "sortedTags" field.
`,
});

const evaluateTagsFlow = ai.defineFlow(
  {
    name: 'evaluateTagsFlow',
    inputSchema: EvaluateTagsInputSchema,
    outputSchema: EvaluateTagsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
