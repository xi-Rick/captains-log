'use client';

import React from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { RevealFx } from '~/once-ui/components';
import { Info, Zap, Database, Mic, Code, ChevronLeft } from 'lucide-react';
import { cn } from '../utils/cn';
import { Text } from '~/once-ui/components';
export default function Documentation() {
  const { toast } = useToast();

  const technologies = [
    {
      category: 'Frontend',
      items: [
        {
          name: 'Next.js 14.2.5',
          description: 'React framework with server-side rendering',
        },
        {
          name: 'React 18',
          description: 'UI library for building user interfaces',
        },
        { name: 'Tailwind CSS', description: 'Utility-first CSS framework' },
        { name: 'shadcn/ui', description: 'Reusable component library' },
        { name: 'once-ui', description: 'UI components library' },
        { name: 'Framer Motion', description: 'Animation library' },
      ],
    },
    {
      category: 'Backend',
      items: [
        {
          name: 'MongoDB',
          description: 'NoSQL database for storing transcriptions',
        },
        { name: 'NextAuth.js', description: 'Authentication solution' },
        { name: 'OpenAI API', description: 'AI-powered transcription service' },
      ],
    },
  ];

  const transcriptionFields = [
    {
      field: 'title',
      type: 'string',
      description: 'AI-generated title for the transcription',
    },
    {
      field: 'id',
      type: 'string',
      description: 'Unique identifier for the transcription',
    },
    { field: 'content', type: 'string', description: 'Raw transcribed text' },
    {
      field: 'timestamp',
      type: 'Date',
      description: 'When the transcription was created',
    },
    {
      field: 'duration',
      type: 'number',
      description: 'Length of the audio in seconds',
    },
    {
      field: 'sentiment',
      type: 'string',
      description: 'AI-analyzed emotional tone',
    },
    {
      field: 'keywords',
      type: 'string[]',
      description: 'Key terms extracted by AI',
    },
    {
      field: 'userId',
      type: 'string',
      description: 'ID of the user who created the transcription',
    },
  ];

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
        <div className="container py-8 space-y-6">
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
            <h1 className="text-4xl font-bold">Documentation</h1>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Documentation Beta</AlertTitle>
            <AlertDescription>
              This documentation is being actively developed. Check back
              regularly for updates.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tech">Technologies</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card className="border-none shadow-none">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl font-bold">
                    Transform Spoken Thoughts into Structured Knowledge
                  </CardTitle>
                  <CardDescription className="text-base">
                    Captain's Log combines voice recording with AI processing to
                    create a unique documentation experience that adapts to your
                    workflow and thinking style.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Use Cases Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Perfect For:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">
                          Professional Development
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>
                            • Record meeting insights and action items on the go
                          </li>
                          <li>• Document project decisions and rationales</li>
                          <li>• Track client interactions and follow-ups</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">
                          Creative Work
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Capture writing ideas and story concepts</li>
                          <li>• Record musical compositions and melodies</li>
                          <li>• Document design iterations and feedback</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">
                          Personal Growth
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Maintain a voice-driven reflection journal</li>
                          <li>• Track goals and progress updates</li>
                          <li>• Record gratitude and achievements</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-medium text-primary">
                          Research & Learning
                        </h4>
                        <ul className="space-y-1 text-sm text-muted-foreground">
                          <li>• Document research observations</li>
                          <li>• Create study notes and summaries</li>
                          <li>• Record interview insights</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Unique Value Props */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">
                      Why Captain's Log Stands Out:
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium mb-2">
                          Hands-Free Efficiency
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Record thoughts naturally while multitasking, driving,
                          or walking
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium mb-2">
                          AI-Powered Organization
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Automatic categorization and tagging of entries for
                          easy retrieval
                        </p>
                      </div>
                      <div className="p-4 bg-secondary/20 rounded-lg">
                        <h4 className="font-medium mb-2">Smart Summaries</h4>
                        <p className="text-sm text-muted-foreground">
                          Get AI-generated insights and key points from your
                          longer recordings
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tech" className="space-y-4">
              {technologies.map((tech) => (
                <Card key={tech.category}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {tech.category === 'Frontend' ? (
                        <Code className="h-5 w-5" />
                      ) : (
                        <Database className="h-5 w-5" />
                      )}
                      {tech.category} Technologies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Technology</TableHead>
                          <TableHead>Description</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tech.items.map((item) => (
                          <TableRow key={item.name}>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>{item.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="schema" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5" />
                    Transcription Schema
                  </CardTitle>
                  <CardDescription>
                    Details of the audio transcription data structure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transcriptionFields.map((field) => (
                        <TableRow key={field.field}>
                          <TableCell className="font-medium">
                            {field.field}
                          </TableCell>
                          <TableCell className="font-mono">
                            {field.type}
                          </TableCell>
                          <TableCell>{field.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            variant="outline"
            className="mt-4"
            onClick={() =>
              toast({
                title: 'Documentation Updates',
                description: 'More detailed documentation coming soon!',
                action: (
                  <ToastAction altText="Learn more">Learn more</ToastAction>
                ),
              })
            }
          >
            <Zap className="mr-2 h-4 w-4" />
            Check for Updates
          </Button>
        </div>
      </RevealFx>
    </>
  );
}
