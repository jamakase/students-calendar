"use client";

import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import ICAL from "ical.js";
// Make sure to import FullCalendar's CSS (or import it globally)
// import "@fullcalendar/daygrid/main.css";

// Define the props interface with calendarUrl
export interface CalendarPreviewProps {
  calendarUrl: string;
}

const CalendarPreview: React.FC<CalendarPreviewProps> = ({ calendarUrl }) => {
  const [calendarData, setCalendarData] = useState<string>('');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(calendarUrl);
        const text = await res.text();
        setCalendarData(text);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [calendarUrl]);

  const events = useMemo(() => {
    try {
      const jcalData = ICAL.parse(calendarData);
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
  }, [calendarData]);

  return (
    <div className="rounded-lg overflow-hidden">
      {calendarData && (
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
            hour12: false,
          }}
        />
      )}
    </div>
  );
};

export default CalendarPreview; 