import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "Students Calendar",
    template: "%s | Students Calendar"
  },
  description: "A simple and efficient way to manage student schedules and timetables",
  authors: [{ name: "jamakase", url: "https://jamakase.com" }],
  keywords: ["students", "calendar", "schedule", "timetable", "education"],
  creator: "jamakase",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://students-calendar.jamakase.com",
    title: "Students Calendar",
    description: "A simple and efficient way to manage student schedules and timetables",
    siteName: "Students Calendar"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <main className="flex-1">
          {children}
        </main>
        <footer className="py-6 md:px-8 md:py-0">
          <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              Built by{" "}
              <a
                href="https://jamakase.com"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                jamakase
              </a>
              . The source code is available on{" "}
              <a
                href="https://github.com/jamakase/students-calendar"
                target="_blank"
                rel="noreferrer"
                className="font-medium underline underline-offset-4"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
