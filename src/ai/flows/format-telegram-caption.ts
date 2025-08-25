'use server';

/**
 * @fileOverview This file contains the Genkit flow for formatting Telegram captions using the Google Gemini AI tool.
 *
 * - formatTelegramCaption - A function that handles the formatting of Telegram captions.
 * - FormatTelegramCaptionInput - The input type for the formatTelegramCaption function.
 * - FormatTelegramCaptionOutput - The return type for the formatTelegramCaption function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatTelegramCaptionInputSchema = z.object({
  originalCaption: z.string().describe('The original caption containing the model name.'),
  link: z.string().describe('The final link to include in the caption.'),
  linkPlacement: z.enum(['caption', 'button', 'both']).describe('Where to place the link (in the caption, as a button, or both).'),
});
export type FormatTelegramCaptionInput = z.infer<typeof FormatTelegramCaptionInputSchema>;

const FormatTelegramCaptionOutputSchema = z.object({
  formattedCaption: z.string().describe('The formatted caption for the Telegram post.'),
});
export type FormatTelegramCaptionOutput = z.infer<typeof FormatTelegramCaptionOutputSchema>;

export async function formatTelegramCaption(input: FormatTelegramCaptionInput): Promise<FormatTelegramCaptionOutput> {
  return formatTelegramCaptionFlow(input);
}

const formatCaptionPrompt = ai.definePrompt({
  name: 'formatCaptionPrompt',
  input: {schema: FormatTelegramCaptionInputSchema},
  output: {schema: FormatTelegramCaptionOutputSchema},
  prompt: `You are a Telegram post formatting expert. Your task is to extract a model's name from the provided text and create a standardized caption.

Instructions:
1.  **Extract Model Name:** From the "Original Caption", identify only the model's name. The name is usually at the beginning.
2.  **Format Output:** Create the caption strictly in the following format, with each part on a new line:
    🌴 Model: [Extracted Model Name]
    📦 Mega: [Final Link]

Original Caption: {{{originalCaption}}}
Final Link: {{{link}}}

Formatted Caption:`,
});

const formatTelegramCaptionFlow = ai.defineFlow(
  {
    name: 'formatTelegramCaptionFlow',
    inputSchema: FormatTelegramCaptionInputSchema,
    outputSchema: FormatTelegramCaptionOutputSchema,
  },
  async input => {
    const {output} = await formatCaptionPrompt(input);
    return {formattedCaption: output!.formattedCaption!};
  }
);
