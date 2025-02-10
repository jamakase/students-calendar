import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getStudentMap } from '@/docs/sheet';
import CalendarPreview from '@/components/base/CalendarPreview';
import { headers } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";

export async function generateMetadata({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  return {
    title: `Student Detail - ${studentId}`,
    description: `Details for student ${studentId}`
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
  const yandexCalendarUrl = `https://calendar.yandex.com/import?url=${encodeURIComponent(calendarUrl)}`;

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
    <div className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div className="flex gap-2">
            <a
              href={calendarUrl}
              download={`${decodedStudentId.replace(/\s+/g, "_")}_schedule.ics`}
            >
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download ICS
              </Button>
            </a>
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Google Calendar
              </Button>
            </a>
            <a
              href={yandexCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm">
                <Calendar className="mr-2 h-4 w-4" />
                Add to Yandex Calendar
              </Button>
            </a>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Name:</span> {decodedStudentId}
              </div>
              <div>
                <span className="font-medium">Group:</span> {studentInfo.group}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarPreview icsContent={icsContent} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 