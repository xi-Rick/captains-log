'use client';

import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Trash, PauseCircle, Play } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { AudioVisualizer, LiveAudioVisualizer } from 'react-audio-visualize';
import { v4 as uuidv4 } from 'uuid';
import { TranscriptionData } from '~/app/types/transcription';
import {
  sendAudioToOpenAI,
  generateSummarizedTitle,
  analyzeSentiment,
  extractKeywords,
} from '@/app/utils/openaiUtils';

type Props = {
  className?: string;
  timerClassName?: string;
  onTranscriptionComplete?: (transcription: string, title: string) => void;
};

const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, '0');
};

export const AudioRecorderWithVisualizer = ({
  onTranscriptionComplete,
  userId = '01',
}: Props & { userId?: string }) => {
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);

  const hours = Math.floor(timer / 3600);
  const minutes = Math.floor((timer % 3600) / 60);
  const seconds = timer % 60;

  const [hourLeft, hourRight] = useMemo(
    () => padWithLeadingZeros(hours, 2).split(''),
    [hours],
  );
  const [minuteLeft, minuteRight] = useMemo(
    () => padWithLeadingZeros(minutes, 2).split(''),
    [minutes],
  );
  const [secondLeft, secondRight] = useMemo(
    () => padWithLeadingZeros(seconds, 2).split(''),
    [seconds],
  );

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({
          width: Math.floor(offsetWidth - 32),
          height: Math.floor(offsetHeight - 32),
        });
      }
    };

    updateDimensions();

    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
          setRecordingChunks([...chunks]);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        if (audioRef.current) {
          audioRef.current.src = URL.createObjectURL(blob);
        }
      };

      setMediaRecorder(recorder);
      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const togglePause = () => {
    if (!mediaRecorder) return;

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      setIsPaused(true);
    } else if (mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioBlob) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const stopRecording = async () => {
    if (!mediaRecorder) return;

    try {
      setIsProcessing(true);
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());

      const blob = new Blob(recordingChunks, { type: 'audio/webm' });
      const transcribedText = await sendAudioToOpenAI(blob);
      const title = await generateSummarizedTitle(transcribedText);
      const sentiment = await analyzeSentiment(transcribedText);
      const keywords = await extractKeywords(transcribedText);

      const transcriptionData: TranscriptionData = {
        id: uuidv4(),
        content: transcribedText,
        timestamp: new Date().toISOString(),
        duration: timer,
        sentiment,
        keywords,
        userId,
      };

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          ...transcriptionData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save transcription');
      }

      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcribedText, title);
      }

      setRecordingChunks([]);
      setIsRecording(false);
      setIsPaused(false);
      setTimer(0);
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('An error occurred while processing the recording.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
    setMediaRecorder(null);
    setRecordingChunks([]);
    setAudioBlob(null);
    setIsRecording(false);
    setIsPaused(false);
    setTimer(0);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.src = '';
    }
  };

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isRecording, isPaused]);

  return (
    <Card className="w-full max-w-5xl bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Timer Section */}
          {isRecording && (
            <div className="flex justify-center items-center space-x-2 text-xl font-bold text-primary">
              <div className="flex space-x-1">
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {hourLeft}
                </span>
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {hourRight}
                </span>
              </div>
              <span>:</span>
              <div className="flex space-x-1">
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {minuteLeft}
                </span>
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {minuteRight}
                </span>
              </div>
              <span>:</span>
              <div className="flex space-x-1">
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {secondLeft}
                </span>
                <span className="bg-primary dark:text-black text-white rounded p-2">
                  {secondRight}
                </span>
              </div>
            </div>
          )}

          {/* Visualizer Section */}
          <div
            ref={containerRef}
            className="relative flex items-center justify-center h-40 rounded-xl bg-muted/50 p-4"
          >
            {isRecording && mediaRecorder && dimensions.width > 0 ? (
              <LiveAudioVisualizer
                mediaRecorder={mediaRecorder}
                width={dimensions.width}
                height={dimensions.height}
                barWidth={3}
                gap={2}
                barColor={theme === 'dark' ? '#ffffff' : '#000000'}
              />
            ) : !isRecording && audioBlob && dimensions.width > 0 ? (
              <div className="w-full">
                <AudioVisualizer
                  blob={audioBlob}
                  width={dimensions.width}
                  height={dimensions.height}
                  barWidth={3}
                  gap={2}
                  barColor={theme === 'dark' ? '#ffffff' : '#000000'}
                />
                <audio ref={audioRef} className="hidden" />
              </div>
            ) : (
              <span className="text-sm dark:text-muted text-black">
                No recording available
              </span>
            )}
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-center items-center space-x-2">
              <span className="text-sm text-muted">Processing...</span>
              <div className="loader h-6 w-6 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
            </div>
          )}

          {/* Controls Section */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {isRecording && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={resetRecording}
                      size="lg"
                      variant="destructive"
                      disabled={isProcessing}
                      className="h-12 w-12 rounded-full"
                    >
                      <Trash className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-muted text-white"
                  >
                    Reset recording
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={togglePause}
                      size="lg"
                      variant="secondary"
                      disabled={isProcessing}
                      className={cn(
                        'h-12 w-12 rounded-full transition-all duration-300',
                        isPaused && 'bg-yellow-500 hover:bg-yellow-600',
                      )}
                    >
                      <PauseCircle className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="center"
                    className="bg-muted text-white"
                  >
                    {isPaused ? 'Resume recording' : 'Pause recording'}
                  </TooltipContent>
                </Tooltip>
              </>
            )}

            {!isRecording && audioBlob && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={togglePlayback}
                    size="lg"
                    variant="secondary"
                    className="h-12 w-12 rounded-full"
                  >
                    <Play className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="center"
                  className="bg-muted text-white"
                >
                  {isPlaying ? 'Pause playback' : 'Play recording'}
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="lg"
                  variant="default"
                  disabled={isProcessing}
                  className={cn(
                    'h-12 w-12 rounded-full transition-all duration-300',
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-primary hover:bg-primary/90',
                  )}
                >
                  <Mic className="h-5 w-5 " />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="bg-muted text-white"
              >
                {!isRecording ? 'Start recording' : 'Stop recording'}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
