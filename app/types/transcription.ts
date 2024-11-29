export interface TranscriptionData {
  id: string;
  content: string;
  timestamp: string;
  duration: number;
  sentiment: string;
  keywords: string[];
  userId: string;
}
