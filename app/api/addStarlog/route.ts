// app/api/starlog/route.ts
import { MongoClient, ObjectId } from 'mongodb';
import { NextResponse, NextRequest } from 'next/server';
import { StarLog } from '../../types/starLog'; // Adjust the import path based on your project structure

export async function POST(req: NextRequest) {
  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['title', 'text', 'timestamp'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 },
        );
      }
    }

    // Create new starlog object with default values
    const newStarLog: StarLog = {
      _id: new ObjectId(), // Generate a new ObjectId for the _id property
      title: body.title, // Assuming the title is coming from the request body
      text: body.text, // Assuming the transcription text is coming from the request body
      timestamp: new Date(body.timestamp).toISOString(), // Ensure timestamp is formatted as an ISO string
      userId: body.userId, // Assuming userId is passed in the request body
      sentiment: body.sentiment, // Assuming sentiment is passed or generated earlier
      keywords: body.keywords, // Assuming keywords are passed or extracted from the transcription
      duration: body.duration, // Assuming duration is passed as part of the transcription
      content: body.content,
    };

    // Connect to MongoDB
    await client.connect();
    const collection = client.db('captains-log').collection<StarLog>('starlog');

    const result = await collection.insertOne(newStarLog);

    return NextResponse.json(
      {
        message: 'Star log created successfully',
        _id: result.insertedId.toString(), // Return the _id as a string
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating star log:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the star log' },
      { status: 500 },
    );
  } finally {
    // Close the MongoDB connection
    await client.close();
  }
}
