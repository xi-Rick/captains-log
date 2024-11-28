import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { StarLog } from '~/app/types/starLog';

// Define the GET handler for fetching a single star log by ID
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const _id = searchParams.get('id'); // Assuming the _id is passed as a query parameter (e.g., ?id=abc123)

  if (!_id) {
    return NextResponse.json(
      { error: 'ID parameter is required' },
      { status: 400 },
    );
  }

  const client = new MongoClient(process.env.MONGODB_URI as string);

  try {
    // Connect to MongoDB Atlas
    await client.connect();

    // Get the star logs collection from the database
    const collection = client.db('captains-log').collection<StarLog>('starlog');

    // Ensure the _id is converted into ObjectId
    const objectId = new ObjectId(_id);

    // Fetch the single star log by its ObjectId
    const starLog = await collection.findOne({ _id: objectId });

    if (!starLog) {
      return NextResponse.json({ error: 'Starlog not found' }, { status: 404 });
    }

    // Convert the _id field from ObjectId to string for compatibility
    const formattedStarLog = {
      ...starLog,
      _id: starLog._id.toString(),
    };

    // Return the star log as a JSON response
    return NextResponse.json(formattedStarLog);
  } catch (error) {
    console.error('Error fetching starlog:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching data from MongoDB' },
      { status: 500 },
    );
  } finally {
    // Ensure that the MongoDB client is always closed
    await client.close();
  }
}
