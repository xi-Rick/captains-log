'use client';

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Trash, PauseCircle, Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { TranscriptionData } from '~/app/types/transcription';
import {
  sendAudioToOpenAI,
  generateSummarizedTitle,
  analyzeSentiment,
  extractKeywords,
} from '@/app/utils/openaiUtils';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const isFetching = useRef(false);

  // Speech Recognition Hook
  const {
    transcript,
    listening: isSpeechListening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

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
      // Start audio recording
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

      // Start speech recognition
      SpeechRecognition.startListening({ continuous: true });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder || isFetching.current) return;

    try {
      isFetching.current = true; // Prevent duplicate calls
      setIsProcessing(true);

      // Stop speech recognition
      SpeechRecognition.stopListening();

      // Stop media recorder
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());

      if (!audioBlob) {
        console.error('No audio blob available');
        return;
      }

      const transcribedText = await sendAudioToOpenAI(audioBlob);
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, ...transcriptionData }),
      });

      if (!response.ok) throw new Error('Failed to save transcription');

      if (onTranscriptionComplete) {
        onTranscriptionComplete(transcribedText, title);
      }

      resetRecording();
    } catch (error) {
      console.error('Error processing recording:', error);
      alert('An error occurred while processing the recording.');
    } finally {
      isFetching.current = false; // Unlock
      setIsProcessing(false);
    }
  };

  const resetRecording = () => {
    if (mediaRecorder) {
      try {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.warn('Error stopping media recorder:', error);
      }
    }
    // Stop speech recognition
    SpeechRecognition.stopListening();
    resetTranscript();

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

  const backToBridge = async () => {
    if (mediaRecorder) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      router.push('/dashboard');
    }
  };

  const voiceCommands = {
    'back to bridge': backToBridge,
    'pause recording': togglePause,
    'resume recording': togglePause,
    'stop recording': stopRecording,
    'delete recording': resetRecording,
    'play recording': () => {
      if (audioBlob) {
        setIsPlaying(true);
        audioRef.current?.play();
      }
    },
  };

  useEffect(() => {
    Object.entries(voiceCommands).forEach(([command, action]) => {
      if (transcript.toLowerCase().includes(command)) {
        action();
        resetTranscript();
      }
    });
  }, [transcript]);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout;

    if (isRecording && !isPaused) {
      timerInterval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [isRecording, isPaused]);

  // Add keyboard shortcut handler
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      // Only handle shortcuts when Ctrl key is pressed
      if (event.ctrlKey) {
        switch (event.key.toLowerCase()) {
          case 'b':
            event.preventDefault();
            backToBridge();
            break;
          case 'p':
            event.preventDefault();
            togglePause();
            break;
          case 'r':
            event.preventDefault();
            togglePause(); // Resume is the same as toggle for pause/resume
            break;
          case 's':
            event.preventDefault();
            stopRecording();
            break;
          case 'd':
            event.preventDefault();
            resetRecording();
            break;
          case 'l':
            event.preventDefault();
            if (audioBlob) {
              setIsPlaying(true);
              audioRef.current?.play();
            }
            break;
        }
      }
    },
    [
      backToBridge,
      togglePause,
      stopRecording,
      resetRecording,
      audioBlob,
      audioRef,
    ],
  );

  // Add effect to set up keyboard event listener
  useEffect(() => {
    // Add event listener
    window.addEventListener('keydown', handleKeyboardShortcuts);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [handleKeyboardShortcuts]);

  return (
    <Card className="w-full max-w-5xl bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {!browserSupportsSpeechRecognition && (
            <Alert variant="default">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Speech Recognition Unavailable</AlertTitle>
              <AlertDescription>
                Your browser does not support speech recognition.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col space-y-6">
            {/* Speech Recognition Status */}
            {isRecording && (
              <div className="text-center text-sm text-muted-foreground">
                {isSpeechListening
                  ? 'Speech recognition active. Use any of the voice commands!'
                  : 'Speech recognition paused.'}
              </div>
            )}
          </div>
          {/* Timer Section */}
          <AnimatePresence>
            {isRecording && (
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 250,
                  damping: 15,
                }}
                className="flex gap-2 justify-center items-center sm:flex-row flex-wrap text-sm sm:text-base"
              >
                {Object.entries(formattedTime).map(
                  ([unit, [left, right]], index) => (
                    <React.Fragment key={unit}>
                      {index > 0 && (
                        <span className="text-muted-foreground">:</span>
                      )}
                      <motion.div
                        key={`${unit}-${left}-${right}`}
                        initial={{
                          opacity: 0,
                          y: -15,
                          scale: 0.9,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 15,
                          scale: 0.9,
                        }}
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 20,
                        }}
                        className="flex space-x-1"
                      >
                        <motion.span
                          className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded p-2 min-w-[2.5rem] text-center sm:min-w-[2.5rem] min-w-[2rem]"
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{
                            scale: 0.95,
                            transition: { duration: 0.2 },
                          }}
                        >
                          {left}
                        </motion.span>
                        <motion.span
                          className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-foreground rounded p-2 min-w-[2.5rem] text-center sm:min-w-[2.5rem] min-w-[2rem]"
                          whileHover={{
                            scale: 1.05,
                            transition: { duration: 0.2 },
                          }}
                          whileTap={{
                            scale: 0.95,
                            transition: { duration: 0.2 },
                          }}
                        >
                          {right}
                        </motion.span>
                      </motion.div>
                    </React.Fragment>
                  ),
                )}
              </motion.div>
            )}
          </AnimatePresence>

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
                    className="bg-muted dark:text-white text-black"
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
                    className="bg-muted dark:text-white text-black"
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
                  className="bg-muted dark:text-white text-black"
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
                className="bg-muted dark:text-white text-black"
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
