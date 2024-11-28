import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { StarLog } from '~/app/types/starLog';

// MongoDB client setup
const client = new MongoClient(process.env.MONGODB_URI as string);
const dbName = 'captains-log';
const collectionName = 'starlog';

async function getCollection() {
  await client.connect();
  return client.db(dbName).collection<StarLog>(collectionName);
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json(); // The ID of the record to delete (passed as JSON body)

    const collection = await getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      return NextResponse.json({ message: 'Log deleted successfully' });
    } else {
      return NextResponse.json({ message: 'Log not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the log' },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
