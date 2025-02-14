import { getStudentMap, getCoursesList } from "@/docs/sheet";
import StudentList from "@/components/base/StudentList";
import CourseList from "@/components/base/CourseList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function Home() {
  const studentToGroupMap = await getStudentMap();
  const students = Object.keys(studentToGroupMap).sort();
  
  // Get unique courses from all students
  const courses = await getCoursesList();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Schedule Viewer</CardTitle>
          <CardDescription>View schedules by student or course</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
            </TabsList>
            <TabsContent value="students" className="mt-4">
              <div className="flex justify-center">
                <StudentList students={students} />
              </div>
            </TabsContent>
            <TabsContent value="courses" className="mt-4">
              <div className="flex justify-center">
                <CourseList courses={courses} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
