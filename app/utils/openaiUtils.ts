// utils/openaiUtils.ts

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const model = 'gpt-3.5-turbo';

export const sendAudioToOpenAI = async (blob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('file', blob, 'audio.wav');
  formData.append('model', 'whisper-1');

  const response = await fetch(
    'https://api.openai.com/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error('Failed to transcribe audio');
  }

  const data = await response.json();
  return data.text;
};

export const generateSummarizedTitle = async (
  transcribedText: string,
): Promise<string> => {
  const conversation = [
    {
      role: 'user',
      content: `Summarize the transcribed text for a title in less than 7 words: "${transcribedText}"`,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: conversation,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate a summarized title');
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

export const analyzeSentiment = async (text: string): Promise<string> => {
  const conversation = [
    {
      role: 'user',
      content: `Analyze the sentiment of this text and respond with just one word (positive/negative/neutral): "${text}"`,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: conversation,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze sentiment');
  }

  const data = await response.json();
  return data.choices[0].message.content.toLowerCase();
};

export const extractKeywords = async (text: string): Promise<string[]> => {
  const conversation = [
    {
      role: 'user',
      content: `Extract up to 5 key topics from this text and respond with just the words separated by commas: "${text}"`,
    },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: conversation,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to extract keywords');
  }

  const data = await response.json();
  return data.choices[0].message.content
    .split(',')
    .map((word: string) => word.trim());
};
