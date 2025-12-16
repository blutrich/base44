import { base44Agent } from '@/mastra';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  // Check for required environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY is not set!');
    return new Response(
      JSON.stringify({ error: 'Missing OPENAI_API_KEY - add it to .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  if (!process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY === 'YOUR_API_KEY') {
    console.error('❌ PINECONE_API_KEY is not set or is placeholder!');
    return new Response(
      JSON.stringify({ error: 'Missing PINECONE_API_KEY - add it to .env.local' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const { messages, threadId, resourceId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: 'Messages are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    console.log('📤 Sending to agent:', lastMessage.content.substring(0, 50) + '...');
    
    // Stream the response from Mastra agent (no memory - Vercel compatible)
    const response = await base44Agent.stream(lastMessage.content);

    console.log('✅ Stream started');
    
    // Return the stream - handle both old and new API
    if (typeof response.toTextStreamResponse === 'function') {
      return response.toTextStreamResponse();
    }
    
    // Fallback: create a ReadableStream from the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response.textStream) {
            controller.enqueue(new TextEncoder().encode(chunk));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
