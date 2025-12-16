import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Tool to query Pinecone Assistant for Base44 Q&A
 */
export const queryPineconeTool = createTool({
  id: 'query-pinecone',
  description: 'Search the Base44 community knowledge base for answers to questions about Base44 platform, integrations, AI features, payments, and more.',
  inputSchema: z.object({
    question: z.string().describe('The question to search for in the Base44 knowledge base'),
  }),
  outputSchema: z.object({
    answer: z.string().describe('The answer from the knowledge base'),
    found: z.boolean().describe('Whether a relevant answer was found'),
  }),
  execute: async ({ context }) => {
    const { question } = context;
    
    const apiKey = process.env.PINECONE_API_KEY;
    const assistantName = process.env.PINECONE_ASSISTANT_NAME || 'base';

    if (!apiKey) {
      return {
        answer: 'שגיאה: לא הוגדר מפתח API של Pinecone',
        found: false,
      };
    }

    try {
      const response = await fetch(
        `https://prod-1-data.ke.pinecone.io/assistant/chat/${assistantName}`,
        {
          method: 'POST',
          headers: {
            'Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: question,
              },
            ],
            stream: false,
            model: 'gpt-4o',
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pinecone API error:', errorText);
        return {
          answer: 'לא הצלחתי לחפש במאגר הידע. נסה שוב.',
          found: false,
        };
      }

      const data = await response.json();
      const answer = data.message?.content || '';

      return {
        answer: answer || 'לא מצאתי תשובה רלוונטית במאגר.',
        found: !!answer,
      };
    } catch (error) {
      console.error('Error querying Pinecone:', error);
      return {
        answer: 'שגיאה בחיפוש במאגר הידע.',
        found: false,
      };
    }
  },
});

