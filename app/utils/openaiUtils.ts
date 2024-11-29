// /app/utils/openaiUtils.ts
export const sendAudioToOpenAI = async (blob: Blob): Promise<string> => {
  const formData = new FormData();
  formData.append('type', 'transcribe');
  formData.append('file', blob, 'audio.wav');

  const response = await fetch('/api/openai', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to transcribe audio: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.text;
};

export const generateSummarizedTitle = async (transcribedText: string): Promise<string> => {
  const formData = new FormData();
  formData.append('type', 'summarizeTitle');
  formData.append('transcribedText', transcribedText);

  const response = await fetch('/api/openai', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to generate title: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.title;
};

export const analyzeSentiment = async (text: string): Promise<string> => {
  const formData = new FormData();
  formData.append('type', 'sentiment');
  formData.append('text', text);

  const response = await fetch('/api/openai', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to analyze sentiment: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.sentiment;
};

export const extractKeywords = async (text: string): Promise<string[]> => {
  const formData = new FormData();
  formData.append('type', 'keywords');
  formData.append('text', text);

  const response = await fetch('/api/openai', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to extract keywords: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.keywords;
};
