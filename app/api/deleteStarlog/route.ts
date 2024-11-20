import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

interface RequestBody {
  title: string;
  text: string;
}

export async function DELETE(req: NextRequest) {
  try {
    const { _id } = (await req.json()) as { _id: string };

    if (!_id) {
      return NextResponse.json(
        { error: 'ID is required for deletion.' },
        { status: 400 },
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(process.env.MONGODB_URI as string);
    await client.connect();

    const collection = client.db('captains-log').collection('starlog');
    const deleteResult = await collection.deleteOne({ _id: new ObjectId(_id) });

    if (deleteResult.deletedCount === 1) {
      return NextResponse.json(null, { status: 204 });
    } else {
      return NextResponse.json(
        { error: 'Recording not found.' },
        { status: 404 },
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while deleting the recording.' },
      { status: 500 },
    );
  }
}
