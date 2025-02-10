"use client";

import React from "react";
import { Button } from "../ui/button";

interface IcsPreviewProps {
  icsContent: string;
  studentName: string;
}

export default function IcsPreview({ icsContent, studentName }: IcsPreviewProps) {
  const downloadICS = () => {
    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${studentName.replace(/\s+/g, "_")}_schedule.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2">ICS Preview</h2>
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-80 whitespace-pre-wrap">
        {icsContent}
      </pre>
      <Button onClick={downloadICS} className="mt-2">
        Download ICS
      </Button>
    </div>
  );
} 