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

    // Improved streak calculation
    const streakLogs = await collection
      .find({ timestamp: { $exists: true } })
      .sort({ timestamp: -1 })
      .toArray();

    let streak = 0;

    if (streakLogs.length > 0) {
      // Get today's date at start of day in UTC
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Create a map of dates with entries
      const entriesByDate = new Map();
      streakLogs.forEach((log) => {
        const date = new Date(log.timestamp);
        date.setUTCHours(0, 0, 0, 0);
        entriesByDate.set(date.getTime(), true);
      });

      // Check if there's an entry for today
      const hasEntryToday = entriesByDate.has(today.getTime());

      // Start counting from today
      let currentDate = today;
      let consecutiveDays = 0;

      // Count consecutive days including today
      while (entriesByDate.has(currentDate.getTime())) {
        consecutiveDays++;
        // Move to previous day
        currentDate = new Date(currentDate.getTime() - 86400000);
      }

      // Set streak
      streak = consecutiveDays;
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
