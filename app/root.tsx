import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "@remix-run/react";
import { Toaster } from "sonner";
import { Button } from "~/components/ui/button";
import { ExternalLink, LayoutDashboard, Settings } from "lucide-react";

import stylesheet from "~/tailwind.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
];

export default function App() {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Flake Manager</title>
        <Meta />
        <Links />
      </head>
      <body className="bg-background h-full">
        <div className="flex min-h-screen flex-col">
          <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b px-4 backdrop-blur">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <Link
                  to="/dashboard"
                  className="mr-6 flex items-center space-x-2"
                >
                  <span className="font-bold tracking-tight">
                    Flake Manager
                  </span>
                </Link>
                <nav className="flex items-center gap-6 text-sm">
                  <Link
                    to="/dashboard"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/thresholds"
                    className="text-muted-foreground hover:text-primary flex items-center gap-1 text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Thresholds</span>
                  </Link>
                </nav>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://docs.cypress.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    Cypress Docs
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </header>

          <main className="bg-background flex-1">
            <div className="mx-auto max-w-screen-lg px-4 py-8 md:px-8">
              <Outlet />
            </div>
          </main>
        </div>
        <Toaster position="top-right" richColors closeButton />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
