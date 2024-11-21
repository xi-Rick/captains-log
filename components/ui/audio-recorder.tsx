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
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { TranscriptionData } from '~/app/types/transcription';
import {
  sendAudioToOpenAI,
  generateSummarizedTitle,
  analyzeSentiment,
  extractKeywords,
} from '@/app/utils/openaiUtils';

type Props = {
  onTranscriptionComplete?: (transcription: string, title: string) => void;
  userId?: string;
};

const padWithLeadingZeros = (num: number, length: number): string => {
  return String(num).padStart(length, '0');
};

const AudioVisualizer = ({ audioData = new Array(40).fill(0) }) => {
  return (
    <div className="flex justify-center items-center h-full w-full gap-[1%]">
      {audioData.map((value, i) => {
        // Calculate the height of each bar, with responsiveness in mind
        const height = value
          ? Math.min(40, value * 100) // Height scales dynamically based on audio data
          : Math.random() * 20 + 10; // Random fallback height

        return (
          <div
            key={i}
            className="flex-1 bg-primary/60 rounded-full animate-pulse"
            style={{
              height: `${height}px`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        );
      })}
    </div>
  );
};

const useAudioVisualization = (
  mediaRecorder: MediaRecorder | null,
  isPlayback = false,
  blob?: Blob,
) => {
  const [audioData, setAudioData] = useState(new Array(40).fill(0));
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if ((!mediaRecorder && !blob) || (isPlayback && !blob)) return;

    const setupAudioContext = async () => {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 512;

      if (isPlayback && blob) {
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        const source = audioContextRef.current.createMediaElementSource(audio);
        source.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      } else if (mediaRecorder?.stream) {
        const source = audioContextRef.current.createMediaStreamSource(
          mediaRecorder.stream,
        );
        source.connect(analyzerRef.current);
      }
    };

    const updateVisualization = () => {
      if (!analyzerRef.current) return;

      const bufferLength = analyzerRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyzerRef.current.getByteFrequencyData(dataArray);

      const bands = 40;
      const samplesPerBand = Math.floor(bufferLength / bands);
      const newData = new Array(bands).fill(0).map((_, i) => {
        const sum = Array.from(
          dataArray.slice(i * samplesPerBand, (i + 1) * samplesPerBand),
        ).reduce((acc, val) => acc + val, 0);
        return sum / (samplesPerBand * 2);
      });

      setAudioData(newData);
      animationFrameRef.current = requestAnimationFrame(updateVisualization);
    };

    setupAudioContext();
    if (!isPlayback) {
      updateVisualization();
    } else if (audioRef.current) {
      audioRef.current.addEventListener('play', updateVisualization);
    }

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      if (audioRef.current)
        audioRef.current.removeEventListener('play', updateVisualization);
    };
  }, [mediaRecorder, blob, isPlayback]);

  return { audioData, audioRef };
};

export const AudioRecorderWithVisualizer = ({
  onTranscriptionComplete,
  userId = '01',
}: Props) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingChunks, setRecordingChunks] = useState<Blob[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const { audioData, audioRef } = useAudioVisualization(
    mediaRecorder,
    !isRecording && !!audioBlob,
    audioBlob ?? undefined,
  );

  const { hours, minutes, seconds } = useMemo(
    () => ({
      hours: Math.floor(timer / 3600),
      minutes: Math.floor((timer % 3600) / 60),
      seconds: timer % 60,
    }),
    [timer],
  );

  const formattedTime = useMemo(
    () => ({
      hours: padWithLeadingZeros(hours, 2).split(''),
      minutes: padWithLeadingZeros(minutes, 2).split(''),
      seconds: padWithLeadingZeros(seconds, 2).split(''),
    }),
    [hours, minutes, seconds],
  );

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
              {Object.entries(formattedTime).map(
                ([unit, [left, right]], index) => (
                  <React.Fragment key={unit}>
                    {index > 0 && <span>:</span>}
                    <div className="flex space-x-1">
                      <span className="bg-primary dark:text-black text-white rounded p-2">
                        {left}
                      </span>
                      <span className="bg-primary dark:text-black text-white rounded p-2">
                        {right}
                      </span>
                    </div>
                  </React.Fragment>
                ),
              )}
            </div>
          )}

          {/* Visualizer Section */}
          <div className="relative flex items-center justify-center h-40 rounded-xl bg-muted/50 p-4">
            <div className="w-full h-full flex justify-center items-center">
              <AudioVisualizer audioData={audioData} />
              {!isRecording && audioBlob && (
                <audio ref={audioRef} className="hidden" />
              )}
            </div>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex justify-center items-center space-x-2">
              <span className="text-sm text-muted">Processing...</span>
              <div className="loader h-6 w-6 border-4 border-primary rounded-full border-t-transparent animate-spin" />
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
