import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudentMap } from '@/docs/sheet';
import CalendarPreview from '@/components/base/CalendarPreview';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, User, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const decodedStudentId = decodeURIComponent(studentId);
  const studentMap = await getStudentMap();
  const studentInfo = studentMap[decodedStudentId];

  if (!studentInfo) {
    return {
      title: "Student Not Found",
      description: "The requested student schedule could not be found"
    };
  }

  return {
    title: decodedStudentId,
    description: `View and manage schedule for ${decodedStudentId} from group ${studentInfo.group}`,
    openGraph: {
      title: `Schedule for ${decodedStudentId}`,
      description: `View and manage schedule for ${decodedStudentId} from group ${studentInfo.group}`
    }
  };
}

export default async function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const decodedStudentId = decodeURIComponent(studentId);
  const studentMap = await getStudentMap();
  const studentInfo = studentMap[decodedStudentId];

  if (!studentInfo) {
    notFound();
  }

  // Get the host from headers
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  // Create calendar URLs
  const calendarUrl = `${protocol}://${host}/api/calendar/${encodeURIComponent(decodedStudentId)}`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarUrl.replace(/^https?:/, 'webcal:'))}`;
  const yandexCalendarUrl = `https://calendar.yandex.com/import?url=${encodeURIComponent(calendarUrl.replace(/^https?:/, 'webcal:'))}`;

  // Fetch the student's schedule as ICS content
  const res = await fetch(`${protocol}://${host}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ studentName: decodedStudentId }),
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch schedule: ${res.statusText}`);
  }

  const icsContent = await res.text();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6 lg:px-8">
          <Link href="/">
            <Button variant="ghost" size="sm" className="w-9 px-0">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <Separator orientation="vertical" className="mx-2 md:mx-4 h-6" />
          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium text-sm md:text-base">{decodedStudentId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="hidden md:block mx-2 h-4" />
              <Users className="h-4 w-4" />
              <span className="text-muted-foreground text-sm md:text-base">{studentInfo.group}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-screen-2xl p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-6 md:gap-8">
          <Card>
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Calendar Actions
              </CardTitle>
              <CardDescription className="text-sm">
                Download or add your schedule to your preferred calendar application
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full transition-all hover:shadow-md"
                >
                  <a
                    href={calendarUrl}
                    download={`${decodedStudentId.replace(/\s+/g, "_")}_schedule.ics`}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download ICS
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full transition-all hover:shadow-md"
                >
                  <a
                    href={googleCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Add to Google Calendar
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="w-full transition-all hover:shadow-md sm:col-span-2 lg:col-span-1"
                >
                  <a
                    href={yandexCalendarUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Add to Yandex Calendar
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Schedule Preview
              </CardTitle>
              <CardDescription className="text-sm">
                View your schedule in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-b-lg overflow-hidden">
                <CalendarPreview icsContent={icsContent} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 