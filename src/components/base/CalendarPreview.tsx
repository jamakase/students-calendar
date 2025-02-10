"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ICAL from "ical.js";
// Make sure to import FullCalendar's CSS (or import it globally)
// import "@fullcalendar/daygrid/main.css";

interface CalendarPreviewProps {
  icsContent: string;
}

export default function CalendarPreview({ icsContent }: CalendarPreviewProps) {
  const events = useMemo(() => {
    try {
      const jcalData = ICAL.parse(icsContent);
      const vcalendar = new ICAL.Component(jcalData);
      const vevents = vcalendar.getAllSubcomponents("vevent");

      return vevents
        .map((vevent) => {
          const event = new ICAL.Event(vevent);
          return {
            title: event.summary || "",
            start: event.startDate ? event.startDate.toJSDate() : "",
            end: event.endDate ? event.endDate.toJSDate() : "",
          };
        })
        .filter((e) => e.start); // Ensure we only include events with a valid start
    } catch (error) {
      console.error("Error parsing ICS:", error);
      return [];
    }
  }, [icsContent]);

  return (
    <div className="rounded-lg overflow-hidden">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        firstDay={1}
        events={events}
        height="auto"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        buttonText={{
          today: 'Today',
          month: 'Month',
          week: 'Week'
        }}
        dayMaxEvents={true}
        eventDisplay="block"
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
      />
    </div>
  );
} 