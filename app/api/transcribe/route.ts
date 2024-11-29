// /app/api/transcribe/route.ts
import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

interface TranscribeRequestBody {
  title: string;
  id: string;
  content: string;
  timestamp: string;
  duration: number;
  sentiment: string;
  keywords: string[];
  userId: string;
}

export async function POST(req: Request) {
  try {
    const {
      title,
      id,
      content,
      timestamp,
      duration,
      sentiment,
      keywords,
      userId,
    }: TranscribeRequestBody = await req.json();

    // Ensure the MongoDB URI is defined in environment variables
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { error: 'MONGODB_URI environment variable is not defined' },
        { status: 500 },
      );
    }

    // Connect to MongoDB Atlas
    const client = new MongoClient(mongoUri);

    await client.connect();

    // Insert the transcription details into a MongoDB collection
    const collection = client.db('captains-log').collection('starlog');

    await collection.insertOne({
      title,
      id,
      content,
      timestamp,
      duration,
      sentiment,
      keywords,
      userId,
    });

    // Close the MongoDB connection
    await client.close();

    return NextResponse.json({
      message: 'Transcription data saved to MongoDB',
    });
  } catch (error) {
    console.error('Error saving transcription data:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving to MongoDB' },
      { status: 500 },
    );
  }
}
