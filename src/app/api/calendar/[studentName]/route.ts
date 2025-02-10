import { generateICS } from "../../../../docs/sheet";

export async function GET(
  request: Request,
  { params }: { params: { studentName: string } }
) {
  const { studentName } = params;
  try {
    const icsContent = await generateICS(decodeURIComponent(studentName));
    return new Response(icsContent, {
      headers: {
        "Content-Type": "text/calendar",
      },
    });
  } catch (error) {
    return new Response("Error generating calendar", { status: 500 });
  }
} 