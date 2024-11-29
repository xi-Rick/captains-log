import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
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
    const collection = await getCollection();

    // Delete ALL logs in the collection
    const result = await collection.deleteMany({});

    return NextResponse.json({
      message: `Deleted all ${result.deletedCount} log(s) from the database`,
    });
  } catch (error) {
    console.error('Error deleting all records:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting all logs' },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
