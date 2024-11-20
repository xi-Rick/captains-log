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
    await collection.deleteMany({});

    return NextResponse.json({ message: 'All logs cleared successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to clear logs' },
      { status: 500 },
    );
  }
}
