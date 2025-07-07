import { config } from 'dotenv';
config();

import '@/ai/flows/ticket-summarization.ts';
import '@/ai/flows/suggest-tags.ts';
import '@/ai/flows/smart-replies.ts';
import '@/ai/flows/evaluate-tags.ts';
import '@/ai/flows/analyze-email-priority.ts';
