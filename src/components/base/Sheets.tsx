"use client";

import { useState, useMemo } from "react";
import StudentList from "./StudentList";
import { Button } from "../ui/button";
import CalendarPreview from "./CalendarPreview";

export default function Sheets({
  studentToGroupMap,
}: {
  studentToGroupMap: Record<string, Record<string, string>>;
}) {
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [icsContent, setIcsContent] = useState<string | null>(null);

  const students = useMemo(() => Object.keys(studentToGroupMap).sort(), [studentToGroupMap]);

  const generateICS = async (studentName: string) => {
    setLoading(true);
    setIcsContent(null);
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
      const icsText = await blob.text();
      setIcsContent(icsText);
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
      {icsContent && <CalendarPreview icsContent={icsContent} />}
    </>
  );
}
