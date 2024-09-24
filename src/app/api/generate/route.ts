import { generateICS } from '../../../docs/sheet';

export async function POST(req: Request) {
    const { studentName } = await req.json();
    const icsStream = await generateICS(studentName);

    return new Response(icsStream, {
        headers: {
            'Content-Type': 'text/calendar',
            'Content-Disposition': `attachment; filename="calendar.ics"`
        }
    });
}