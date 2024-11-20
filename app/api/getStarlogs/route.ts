// /app/api/getStarLogs/route.ts
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

// GET method for fetching star logs
export async function GET(req: NextRequest) {
  try {
    const collection = await getCollection();
    const count = await collection.countDocuments();
    const recentRecordings = await collection
      .find()
      .sort({ _id: -1 })
      .toArray();

    const formattedRecordings = recentRecordings.map((recording) => ({
      ...recording,
      _id: recording._id.toString(),
    }));

    // Calculate logs for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(
      Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), 1),
    );

    const logsThisMonth = await collection.countDocuments({
      timestamp: {
        $gte: startOfMonth.toISOString(),
        $lte: new Date(
          Date.UTC(
            currentDate.getUTCFullYear(),
            currentDate.getUTCMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          ),
        ).toISOString(),
      },
    });

    // Calculate streak (e.g., consecutive days with logs)
    const streakLogs = await collection
      .find({ timestamp: { $exists: true } })
      .sort({ timestamp: -1 })
      .toArray();

    let streak = 0;
    if (streakLogs.length > 0) {
      let previousDate = new Date(streakLogs[0].timestamp);
      streak = 1;

      for (let i = 1; i < streakLogs.length; i++) {
        const currentDate = new Date(streakLogs[i].timestamp);
        const diff =
          (previousDate.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24);

        if (diff === 1) streak++;
        else break;

        previousDate = currentDate;
      }
    }

    return NextResponse.json({
      totalEntries: count,
      recentRecordings: formattedRecordings,
      logsThisMonth,
      streak,
    });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching data from MongoDB' },
      { status: 500 },
    );
  }
}

// PATCH method for updating multiple star logs (example: update the "title" of all logs)
export async function PATCH(req: NextRequest) {
  try {
    const { filter, updateData } = await req.json(); // Expecting filter and updateData in the body

    const collection = await getCollection();
    const result = await collection.updateMany(filter, { $set: updateData });

    return NextResponse.json({
      message: `${result.modifiedCount} logs updated successfully`,
    });
  } catch (error) {
    console.error('Error updating logs:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the logs' },
      { status: 500 },
    );
  } finally {
    await client.close();
  }
}
