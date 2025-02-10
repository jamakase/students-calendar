import { getStudentMap } from "@/docs/sheet";
import StudentList from "@/components/base/StudentList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const studentToGroupMap = await getStudentMap();
  const students = Object.keys(studentToGroupMap).sort();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Students Calendar</CardTitle>
          <CardDescription>Select your name to view your schedule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <StudentList students={students} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
