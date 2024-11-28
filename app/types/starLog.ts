// app/types/starLog.ts
import { ObjectId } from 'mongodb';
export interface StarLog {
  _id: ObjectId;
  title: string;
  text: string;
  timestamp: string;
  content: string;
  duration: number;
  sentiment: string;
  keywords: string[];
  userId: string;
}
