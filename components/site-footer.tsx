'use client';
import Link from 'next/link';
import ThemeSwitcher from './theme-switcher';

const footerNavs = [
  {
    label: 'Explore',
    items: [
      {
        href: '/docs',
        name: 'Documentation',
      },
      {
        href: '/issues',
        name: 'Issues',
      },
      {
        href: '/contribute',
        name: 'Contribute',
      },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="">
      <div className="mx-auto w-full max-w-screen-xl xl:pb-2">
        <div className="gap-4 p-4 px-8 py-16 sm:pb-16 md:flex md:justify-between">
          <div className="mb-12 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/images/icon-128x128.png"
                alt="Captain's Log logo"
                className="text-primary size-8"
              />
              <span className="self-center whitespace-nowrap text-2xl font-bold tracking-tight dark:text-white">
                Captain's Log
              </span>
            </Link>
            <p className="max-w-xs text-sm text-gray-600 dark:text-gray-300">
              Navigating audio adventures with open-source precision. Capture,
              track, and share your sonic journey.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-1 sm:gap-10">
            {footerNavs.map((nav) => (
              <div key={nav.label}>
                <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                  {nav.label}
                </h2>
                <ul className="grid gap-2">
                  {nav.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="group flex items-center text-sm font-medium text-gray-500 duration-200 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
                      >
                        {item.name}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="ml-1 h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <ThemeSwitcher />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-neutral-200 dark:border-neutral-700/20 px-8 py-6">
          <div className="flex justify-center items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 tracking-tight">
              Copyright © {new Date().getFullYear()} / Captain's Log / All
              Rights Reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
