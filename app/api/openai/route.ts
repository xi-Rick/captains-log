// app/api/openai/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const type = formData.get('type') as string | null;

  if (!type) {
    return NextResponse.json({ error: 'Type is required' }, { status: 400 });
  }

  try {
    switch (type) {
      case 'transcribe': {
        const file = formData.get('file') as File | null;
        if (!file) {
          return NextResponse.json({ error: 'File is required' }, { status: 400 });
        }
    
        // Transcribe audio with OpenAI Whisper
        const transcriptionResponse = await openai.audio.transcriptions.create({
          file: file,
          model: 'whisper-1',
        });

        return NextResponse.json({ text: transcriptionResponse.text });
      }

      case 'summarizeTitle': {
        const transcribedText = formData.get('transcribedText') as string | null;
        if (!transcribedText) {
          return NextResponse.json({ error: 'Transcribed text is required' }, { status: 400 });
        }

        const titleResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Summarize the transcribed text for a title in less than 7 words: "${transcribedText}"`,
            },
          ],
        });

        return NextResponse.json({ title: titleResponse.choices[0].message.content });
      }

      case 'sentiment': {
        const text = formData.get('text') as string | null;
        if (!text) {
          return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const sentimentResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Analyze the sentiment of this text and respond with just one word (positive/negative/neutral): "${text}"`,
            },
          ],
        });

        return NextResponse.json({
            sentiment: sentimentResponse.choices?.[0]?.message?.content?.toLowerCase(),
          });
      }

      case 'keywords': {
        const keywordsText = formData.get('text') as string | null;
        if (!keywordsText) {
          return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        const keywordsResponse = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Extract up to 5 key topics from this text and respond with just the words separated by commas: "${keywordsText}"`,
            },
          ],
        });

        return NextResponse.json({
          keywords: keywordsResponse.choices[0].message.content
            ?.split(',')
            .map((word: string) => word.trim()),
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}
