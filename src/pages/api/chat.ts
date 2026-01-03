import type { APIRoute } from 'astro';
import { SYSTEM_PROMPT } from '../../lib/chatContext';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = import.meta.env.ANTHROPIC_API_KEY;

    // Fallback/Mock if no API key is present (for development/demo)
    if (!apiKey) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple keyword matching for demo purposes when no API key
      const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
      let mockResponse = "I am currently running in demo mode (no API key configured). I can tell you that Ahmed is an AI Security Researcher based in Ireland. Please add an ANTHROPIC_API_KEY to see my full capabilities!";

      if (lastUserMessage.includes('skill')) {
        mockResponse = "Ahmed's skills include Python, TypeScript, AI Security, and DevSecOps. He is also proficient with tools like Git, Docker, and Linux.";
      } else if (lastUserMessage.includes('contact')) {
        mockResponse = "You can contact Ahmed via email or LinkedIn. (Note: Real contact details would be provided here with the live API).";
      } else if (lastUserMessage.includes('oss') || lastUserMessage.includes('open source')) {
        mockResponse = "Ahmed has contributed to several Python projects and authored the 'github-reputation-toolkit'. He has over 7 PRs to major repositories.";
      }

      return new Response(JSON.stringify({ response: mockResponse }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Actual call to Anthropic API
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Anthropic API Error:', errorData);
        throw new Error('Anthropic API request failed');
      }

      const data = await response.json();
      const content = data.content[0].text;

      return new Response(JSON.stringify({ response: content }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });

    } catch (error) {
      console.error('API Call failed:', error);
      return new Response(JSON.stringify({ error: 'Failed to communicate with AI service' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
