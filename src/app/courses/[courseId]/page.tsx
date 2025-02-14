import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudentMap } from '@/docs/sheet';
import CalendarPreview from '@/components/base/CalendarPreview';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar, Book, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const decodedCourseId = decodeURIComponent(courseId);

  return {
    title: decodedCourseId,
    description: `View and manage schedule for course ${decodedCourseId}`,
    openGraph: {
      title: `Schedule for ${decodedCourseId}`,
      description: `View and manage schedule for course ${decodedCourseId}`
    }
  };
}

export default async function CourseDetailPage({ params }: { params: { courseId: string } }) {
  const { courseId } = params;
  const decodedCourseId = decodeURIComponent(courseId);
  const studentMap = await getStudentMap();
  
  // Get all students taking this course
  const studentsInCourse = Object.entries(studentMap)
    .filter(([, info]) => Object.entries(info).filter(([key]) => key !== 'selectedCourse').some(([course]) => course === decodedCourseId))
    .map(([student]) => student);

  if (studentsInCourse.length === 0) {
    notFound();
  }

  // Get the host from headers
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  // Create calendar URLs
  const calendarUrl = `${protocol}://${host}/api/calendar/course/${encodeURIComponent(decodedCourseId)}`;
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(calendarUrl.replace(/^https?:/, 'webcal:'))}`;
  const yandexCalendarUrl = `https://calendar.yandex.com/import?url=${encodeURIComponent(calendarUrl.replace(/^https?:/, 'webcal:'))}`;

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
              <Book className="h-4 w-4" />
              <span className="font-medium text-sm md:text-base">{decodedCourseId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Separator orientation="vertical" className="hidden md:block mx-2 h-4" />
              <Users className="h-4 w-4" />
              <span className="text-muted-foreground text-sm md:text-base">{studentsInCourse.length} students enrolled</span>
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
                Download or add the course schedule to your preferred calendar application
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
                    download={`${decodedCourseId.replace(/\s+/g, "_")}_schedule.ics`}
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
                View the course schedule in a calendar format
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="rounded-b-lg overflow-hidden">
                <CalendarPreview calendarUrl={calendarUrl} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 