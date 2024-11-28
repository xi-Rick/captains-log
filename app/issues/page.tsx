'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { RevealFx } from '~/once-ui/components';
import {
  AlertCircle,
  Clock,
  ArrowUpCircle,
  Shield,
  Layout,
  Zap,
  Mic,
  Circle,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '../utils/cn';

export default function Issues() {
  const { toast } = useToast();
  const [selectedPriority, setSelectedPriority] = useState('all');

  const issues = [
    {
      id: 1,
      title: 'Voice Command to End Transmission',
      description:
        'Users cannot stop the transcription process with voice commands, requiring manual interaction.',
      priority: 'high',
      category: 'core',
      status: 'planned',
      impact: 'User Workflow',
      solutions: [
        'Add keyword-based voice detection for "End Transmission."',
        'Integrate Whisper API with real-time command recognition.',
        'Include a fallback timeout to auto-stop after inactivity.',
      ],
      timeframe: '1 week',
      progress: 90,
    },
    {
      id: 2,
      title: 'Audio Transcription Accuracy',
      description:
        'OpenAI transcription occasionally misinterprets technical terms and proper nouns.',
      priority: 'high',
      category: 'core',
      status: 'in-progress',
      impact: 'User Experience',
      solutions: [
        'Implement custom dictionary for domain-specific terms.',
        'Add post-processing correction layer.',
        'Allow manual corrections with learning capability.',
      ],
      timeframe: '2-3 weeks',
      progress: 85,
    },
    {
      id: 3,
      title: 'Authentication Token Expiration',
      description:
        'Users getting logged out unexpectedly during long sessions.',
      priority: 'high',
      category: 'security',
      status: 'investigating',
      impact: 'User Session',
      solutions: [
        'Implement refresh token mechanism.',
        'Add session extension notifications.',
        'Optimize token lifetime settings.',
      ],
      timeframe: '1 week',
      progress: 20,
    },
    {
      id: 4,
      title: 'Slow UI Response During Large Logs',
      description:
        'The application becomes unresponsive when users interact with logs containing thousands of entries.',
      priority: 'medium',
      category: 'performance',
      status: 'in-progress',
      impact: 'App Performance',
      solutions: [
        'Implement pagination for log rendering.',
        'Optimize database queries for fetching large data sets.',
        'Introduce lazy loading for UI components.',
      ],
      timeframe: '3 weeks',
      progress: 25,
    },
    {
      id: 5,
      title: 'Dark Mode Display Issues',
      description:
        'Some components display incorrect colors in dark mode, reducing readability.',
      priority: 'medium',
      category: 'ui',
      status: 'open',
      impact: 'Visual Design',
      solutions: [
        'Audit all UI components for dark mode compatibility.',
        'Use TailwindCSS dark mode utilities to fix color contrast.',
        'Add unit tests for theme consistency.',
      ],
      timeframe: '1 week',
      progress: 90,
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'core':
        return <Mic className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'ui':
        return <Layout className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const filteredIssues =
    selectedPriority === 'all'
      ? issues
      : issues.filter((issue) => issue.priority === selectedPriority);

  return (
    <>
      {/* Animated stars background */}
      <div className="absolute inset-0">
        {/* Light mode: black dots */}
        <div className="absolute inset-0 bg-[radial-gradient(black_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-0"></div>
        {/* Dark mode: white dots */}
        <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] bg-[length:50px_50px] opacity-25 dark:opacity-25"></div>
      </div>
      <RevealFx>
        <div className="container py-8 space-y-6 ">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'absolute left-4 top-4 md:left-8 md:top-8',
            )}
          >
            <ChevronLeft className="mr-2 size-4" />
            Back
          </Link>
          <br />
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold">Issues Tracker</h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Critical Issues</AlertTitle>
            <AlertDescription>
              There are {issues.filter((i) => i.priority === 'high').length}{' '}
              high-priority issues that need attention.
            </AlertDescription>
          </Alert>

          <Tabs
            defaultValue="overview"
            className="space-y-4"
            value={selectedPriority}
            onValueChange={setSelectedPriority}
          >
            <TabsList>
              <TabsTrigger value="all">All Issues</TabsTrigger>
              <TabsTrigger value="high">High Priority</TabsTrigger>
              <TabsTrigger value="medium">Medium Priority</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {/* Display all issues here */}
            </TabsContent>
            <TabsContent value="high">
              {/* Display high priority issues here */}
            </TabsContent>
            <TabsContent value="medium">
              {/* Display medium priority issues here */}
            </TabsContent>
          </Tabs>

          <div className="grid gap-6">
            {filteredIssues.map((issue) => (
              <Card key={issue.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(issue.category)}
                      <CardTitle>{issue.title}</CardTitle>
                    </div>
                    <Badge>{issue.priority} priority</Badge>
                  </div>
                  <CardDescription>{issue.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">
                        Potential Solutions:
                      </h4>
                      <ul className="list-disc pl-6 space-y-1">
                        {issue.solutions.map((solution, index) => (
                          <li key={index}>{solution}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          Timeframe: {issue.timeframe}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Progress</span>
                          <span className="text-sm">{issue.progress}%</span>
                        </div>
                        <Progress value={issue.progress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              toast({
                title: 'Issues Tracker',
                description: 'Issue statuses are updated daily.',
                action: <ToastAction altText="Refresh">Refresh</ToastAction>,
              })
            }
          >
            <ArrowUpCircle className="mr-2 h-4 w-4" />
            Check for Updates
          </Button>
        </div>
      </RevealFx>
    </>
  );
}
