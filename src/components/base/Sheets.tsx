"use client";

import { useState } from "react";
import StudentList from "./StudentList";
import { Button } from "../ui/button";

export default function Sheets({
  studentToGroupMap,
}: {
  studentToGroupMap: Record<string, Record<string, string>>;
}) {
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const students = Object.keys(studentToGroupMap);

  const generateICS = async (studentName: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentName }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate ICS');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${studentName.replace(/\s+/g, "_")}_schedule.ics`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StudentList
        students={students}
        onSelect={setSelected}
        selected={selected}
      />
      {selected && <Button onClick={() => generateICS(selected)} disabled={loading}>Generate ICS</Button>}
    </>
  );
}
