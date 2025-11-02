import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import { SessionWrapper } from './SessionWrapper';
import { cn } from './utils/cn';

//console.log(
//"Captain's Log, Stardate 9529.1: This is the final cruise of the Starship Enterprise under my command. This ship and her history will shortly become the care of another crew. To them and their posterity will we commit our future. They will continue the voyages we have begun and journey to all the undiscovered countries, boldly going where no man - where no one - has gone before. 🚀",
//);

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const APP_NAME = "Captian's Log";
const APP_DEFAULT_TITLE = "Captain's Log";
const APP_TITLE_TEMPLATE = '%s - PWA App';
const APP_DESCRIPTION = "Captain's Log - A Personal AI Transcription Logbook";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable,
        )}
      >
        <SessionWrapper>
          <Analytics />
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionWrapper>
      </body>
    </html>
  );
}
