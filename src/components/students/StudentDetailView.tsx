"use client";

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import CalendarPreview from '@/components/base/CalendarPreview';

interface StudentDetailViewProps {
  studentName: string;
  studentInfo: {
    group: string;
    [key: string]: string;
  };
  calendarUrl: string;
  googleCalendarUrl: string;
  yandexCalendarUrl: string;
  icsContent: string;
}

export default function StudentDetailView({
  studentName,
  studentInfo,
  calendarUrl,
  googleCalendarUrl,
  yandexCalendarUrl,
  icsContent
}: StudentDetailViewProps) {
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
              download={`${studentName.replace(/\s+/g, "_")}_schedule.ics`}
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
                <span className="font-medium">Name:</span> {studentName}
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