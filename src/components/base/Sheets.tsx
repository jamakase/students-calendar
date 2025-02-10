"use client";

import { useState, useMemo, useEffect } from "react";
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

  // Automatically generate ICS when a student is selected.
  useEffect(() => {
    if (selected) {
      generateICS(selected);
    }
  }, [selected]);

  // Function to trigger download of the generated ICS file.
  const downloadICS = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.replace(/\s+/g, "_")}_schedule.ical`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Function to trigger adding the calendar to Google Calendar.
  const addToGoogleCalendar = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const blobUrl = window.URL.createObjectURL(blob);
    // Google Calendar supports adding calendars by URL via the 'cid' parameter.
    // Note: This might not work perfectly with a blob URL.
    const googleUrl = "https://calendar.google.com/calendar/render?cid=" + encodeURIComponent(blobUrl);
    window.open(googleUrl, "_blank");
  };
  
  // Function to trigger adding the calendar to Yandex Calendar.
  const addToYandexCalendar = () => {
    if (!icsContent) return;
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const blobUrl = window.URL.createObjectURL(blob);
    const yandexUrl = "https://calendar.yandex.com/import?url=" + encodeURIComponent(blobUrl);
    window.open(yandexUrl, "_blank");
  };

  return (
    <>
      <StudentList
        students={students}
        onSelect={setSelected}
        selected={selected}
      />
      {icsContent && (
        <>
          <CalendarPreview icsContent={icsContent} />
          <Button onClick={downloadICS}>Download ICS</Button>
          <Button onClick={addToGoogleCalendar}>Add to Google Calendar</Button>
          <Button onClick={addToYandexCalendar}>Add to Yandex Calendar</Button>
        </>
      )}
    </>
  );
}
