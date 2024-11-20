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

// POST method for adding a new star log
export async function POST(req: NextRequest) {
  try {
    const newLog: StarLog = await req.json();

    // Ensure timestamp is properly set if not provided
    if (!newLog.timestamp) {
      newLog.timestamp = new Date().toISOString(); // Store as ISO string
    }

    const collection = await getCollection();
    const result = await collection.insertOne(newLog);

    return NextResponse.json({
      message: 'Log added successfully',
      _id: result.insertedId.toString(),
    });
  } catch (error) {
    console.error('Error adding record:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the log' },
      { status: 500 },
    );
  }
}

// DELETE method for deleting a star log
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
