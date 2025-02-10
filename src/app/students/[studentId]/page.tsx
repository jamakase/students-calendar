import { notFound } from 'next/navigation';
import { getStudentMap } from '@/docs/sheet';
import { headers } from 'next/headers';
import StudentDetailView from '@/components/students/StudentDetailView';

interface StudentInfo {
  group: string;
  [key: string]: string;
}

export async function generateMetadata({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const decodedStudentId = decodeURIComponent(studentId);
  return {
    title: `Schedule - ${decodedStudentId}`,
    description: `View and manage schedule for ${decodedStudentId}`
  };
}

async function getStudentData(studentId: string) {
  const decodedStudentId = decodeURIComponent(studentId);
  const studentMap = await getStudentMap();
  const studentInfo = studentMap[decodedStudentId] as StudentInfo;

  if (!studentInfo) {
    notFound();
  }

  return {
    studentInfo,
    decodedStudentId
  };
}

async function getCalendarData(studentName: string) {
  const headersList = headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  // Create calendar URLs
  const calendarUrl = `${baseUrl}/api/calendar/${encodeURIComponent(studentName)}`;
  const webcalUrl = calendarUrl.replace(/^https?:/, 'webcal:');
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
  const yandexCalendarUrl = `https://calendar.yandex.ru/settings/import?url=${encodeURIComponent(webcalUrl)}`;

  // Fetch the student's schedule
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ studentName }),
    next: { revalidate: 0 }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch schedule: ${res.statusText}`);
  }

  const icsContent = await res.text();

  return {
    calendarUrl,
    googleCalendarUrl,
    yandexCalendarUrl,
    icsContent
  };
}

export default async function StudentDetailPage({ params }: { params: { studentId: string } }) {
  const { studentId } = params;
  const { studentInfo, decodedStudentId } = await getStudentData(studentId);
  const calendarData = await getCalendarData(decodedStudentId);

  return (
    <StudentDetailView 
      studentName={decodedStudentId}
      studentInfo={studentInfo}
      {...calendarData}
    />
  );
} 