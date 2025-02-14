import { coursesList } from '../../docs/sheet';
import Link from 'next/link';
import React from 'react';

interface CoursesPageProps {
  courses: string[];
}

export default function CoursesPage({ courses }: CoursesPageProps) {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Courses</h1>
      <ul>
        {courses.map((course, index) => (
          <li key={index} style={{ margin: '0.5rem 0' }}>
            <Link href={`/api/course-ics/${encodeURIComponent(course)}`}>{course}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getStaticProps() {
  // Use the coursesList exported from sheet.ts to provide the course list at build time
  return {
    props: {
      courses: coursesList
    }
  };
} 