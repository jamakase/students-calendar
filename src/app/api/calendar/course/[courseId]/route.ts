import { NextRequest } from "next/server";
import { getCourseICS } from "@/docs/sheet";

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;
  try {
    const icsContent = await getCourseICS(decodeURIComponent(courseId));
    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
      },
    });
  } catch (error) {
    console.error("Error generating calendar:", error);
    return new Response("Error generating calendar", { status: 500 });
  }
}