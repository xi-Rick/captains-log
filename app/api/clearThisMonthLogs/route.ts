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

    // Get the current date
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Delete all logs within the current month
    const result = await collection.deleteMany({
      timestamp: {
        $gte: firstDayOfMonth.toISOString(),
        $lte: lastDayOfMonth.toISOString(),
      },
    });

    if (result.deletedCount > 0) {
      return NextResponse.json({
        message: `Deleted ${result.deletedCount} log(s) for the current month`,
      });
    } else {
      return NextResponse.json(
        { message: 'No logs found for the current month' },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error('Error deleting records:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting logs' },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
