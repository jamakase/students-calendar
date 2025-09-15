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
      if (!calendarData || calendarData.trim() === '') {
        return [];
      }
      
      const jcalData = ICAL.parse(calendarData);
      if (!jcalData) {
        console.error("Failed to parse ICS data");
        return [];
      }
      
      const vcalendar = new ICAL.Component(jcalData);
      if (!vcalendar) {
        console.error("Failed to create calendar component");
        return [];
      }
      
      const vevents = vcalendar.getAllSubcomponents("vevent");
      if (!vevents || !Array.isArray(vevents)) {
        console.error("No vevents found in calendar");
        return [];
      }

      return vevents
        .map((vevent) => {
          try {
            const event = new ICAL.Event(vevent);
            const startDate = event.startDate ? event.startDate.toJSDate() : null;
            const endDate = event.endDate ? event.endDate.toJSDate() : null;
            
            if (!startDate) {
              return null;
            }
            
            return {
              title: event.summary || "",
              start: startDate,
              end: endDate || startDate,
            };
          } catch (eventError) {
            console.error("Error processing event:", eventError);
            return null;
          }
        })
        .filter((e) => e !== null); // Filter out null values
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