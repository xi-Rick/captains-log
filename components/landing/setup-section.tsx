'use client';

import { KeyIcon, DatabaseIcon, UserIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const setupSteps = [
  {
    id: 'step_1',
    title: 'Google Authentication',
    description: 'Set up secure authentication for your personal instance.',
    icon: UserIcon,
    requirements: [
      'Create a Google Cloud Project',
      'Configure OAuth 2.0 credentials',
      'Get your Google Client ID',
    ],
  },
  {
    id: 'step_2',
    title: 'OpenAI Integration',
    description: 'Enable AI features for your journaling experience.',
    icon: KeyIcon,
    requirements: [
      'Create an OpenAI account',
      'Generate an API key',
      'Set up usage limits',
    ],
  },
  {
    id: 'step_3',
    title: 'Database Setup',
    description: 'Configure your personal MongoDB database.',
    icon: DatabaseIcon,
    requirements: [
      'Create a MongoDB Atlas account',
      'Set up a new cluster',
      'Get your MongoDB URI',
    ],
  },
  {
    id: 'step_4',
    title: 'Local Deployment',
    description: 'Deploy the app for personal use.',
    icon: KeyIcon,
    requirements: [
      'Clone the repository',
      'Configure environment variables',
      'Deploy to your preferred host',
    ],
  },
];

export default function SetupRequirementsSection() {
  return (
    <section id="setup">
      <section
        id="clients"
        className="mx-auto max-w-7xl px-6 text-center md:px-8"
      >
        <div className="py-14">
          <div className="mx-auto max-w-screen-xl px-4 md:px-8">
            <div className="mt-6">
              <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 md:gap-x-16 [&_path]:fill-white"></ul>
            </div>
          </div>
        </div>
      </section>
      <br className="h-32" />
      <div className="mx-auto flex max-w-screen-xl flex-col gap-8 px-4 py-14 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h4 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Self-Hosted
          </h4>

          <h2 className="text-5xl font-bold tracking-tight text-black sm:text-6xl dark:text-white">
            Your Personal Instance
          </h2>

          <p className="mt-6 text-xl leading-8 text-black/80 dark:text-white">
            Captain's Log is designed as a single-user application that you'll
            need to set up and host yourself. Here's what you'll need to get
            started.
          </p>
        </div>

        <div className="mx-auto grid w-full flex-col justify-center gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {setupSteps.map((step, idx) => (
            <div
              key={step.id}
              className="relative flex max-w-[400px] flex-col gap-8 overflow-hidden rounded-2xl border p-4 text-black dark:text-white"
            >
              <div className="flex items-center">
                <step.icon className="size-8 text-blue-500" />
                <div className="ml-4">
                  <h2 className="text-base font-semibold leading-7">
                    {step.title}
                  </h2>
                  <p className="h-12 text-sm leading-5 text-black/70 dark:text-white">
                    {step.description}
                  </p>
                </div>
              </div>

              <motion.div
                key={`${step.id}-${idx}`}
                initial="initial"
                animate="animate"
                variants={{
                  initial: {
                    opacity: 0,
                    y: 12,
                  },
                  animate: {
                    opacity: 1,
                    y: 0,
                  },
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.1 + idx * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="flex flex-col gap-2"
              >
                <ul className="flex flex-col gap-2 font-normal">
                  {step.requirements.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-xs font-medium text-black dark:text-white"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                        {idx + 1}
                      </span>
                      <span className="flex">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
