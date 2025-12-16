/**
 * Pinecone Assistant API Client
 */

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PineconeResponse {
  message: {
    role: string;
    content: string;
  };
}

export async function chatWithAssistant(
  messages: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.PINECONE_API_KEY;
  const assistantName = process.env.PINECONE_ASSISTANT_NAME;

  if (!apiKey || !assistantName) {
    throw new Error('Missing Pinecone configuration');
  }

  const response = await fetch(
    `https://prod-1-data.ke.pinecone.io/assistant/chat/${assistantName}`,
    {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        stream: false,
        model: 'gpt-4o',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Pinecone API error:', error);
    throw new Error(`Pinecone API error: ${response.status}`);
  }

  const data: PineconeResponse = await response.json();
  return data.message?.content || 'לא קיבלתי תשובה מהמערכת';
}

