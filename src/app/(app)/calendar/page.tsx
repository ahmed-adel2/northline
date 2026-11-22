"use client";

import { useState } from "react";
import "@/app/(app)/internal.css";
import { demoAppointments, demoPatients, demoDoctors, TODAY } from "@/lib/demo-data";

const HOURS = Array.from({ length: 11 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);

function getWeekDates(anchor: string) {
  const d = new Date(`${anchor}T00:00:00Z`);
  const day = d.getUTCDay(); // 0=Sun
  const offset = day === 0 ? 0 : -day;
  return Array.from({ length: 7 }, (_, i) => {
    const nd = new Date(d);
    nd.setUTCDate(d.getUTCDate() + offset + i);
    return nd.toISOString().slice(0, 10);
  });
}

function formatWeekDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return {
    day: d.toLocaleDateString("en-GB", { weekday: "short", timeZone: "UTC" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }),
  };
}

function slotTop(time: string) {
  const [h, m] = time.split(":").map(Number);
  return ((h - 8) * 60 + m) * (4.5 / 60); // 4.5rem per hour
}

function slotHeight(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh - sh) * 60 + (em - sm);
  return mins * (4.5 / 60);
}

export default function Calendar() {
  const [anchor, setAnchor] = useState(TODAY);
  const weekDates = getWeekDates(anchor);

  const prev = () => {
    const d = new Date(`${anchor}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - 7);
    setAnchor(d.toISOString().slice(0, 10));
  };
  const next = () => {
    const d = new Date(`${anchor}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 7);
    setAnchor(d.toISOString().slice(0, 10));
  };

  return (
    <div className="calendar-wrap">
      <div className="page-header">
        <div>
          <h1>Calendar</h1>
          <p className="calendar-demo-note">Week of {weekDates[0]} – {weekDates[6]} · synthetic demo data</p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <div className="calendar-controls" style={{ marginTop: 0 }}>
            <button className="button button-secondary" onClick={prev} type="button" aria-label="Previous week">
              ←
            </button>
            <button className="button button-secondary" onClick={() => setAnchor(TODAY)} type="button">
              Today
            </button>
            <button className="button button-secondary" onClick={next} type="button" aria-label="Next week">
              →
            </button>
          </div>
          <button className="button button-primary" type="button">+ Book appointment</button>
        </div>
      </div>

      {/* Doctor filter */}
      <div className="filter-chips" style={{ marginBottom: "1rem" }}>
        <button className="filter-chip filter-chip-active">All doctors</button>
        {demoDoctors.map((d) => (
          <button key={d.id} className="filter-chip" style={{ "--doctor-color": d.color } as React.CSSProperties}>
            {d.name.replace("Dr. ", "")}
          </button>
        ))}
      </div>

      <div className="calendar-grid" aria-label="Weekly appointment calendar">
        {/* Time axis */}
        <div className="time-axis">
          <div className="time-label time-label-header" />
          {HOURS.map((h) => (
            <div key={h} className="time-label">{h}</div>
          ))}
        </div>

        {/* Day columns */}
        {weekDates.map((date) => {
          const { day, date: dateLabel } = formatWeekDay(date);
          const isToday = date === TODAY;
          const dayAppts = demoAppointments.filter((a) => a.date === date);
          return (
            <div key={date} className={`day-column${isToday ? " day-today" : ""}`}>
              <div className="day-header">
                <span className="day-name">{day}</span>
                <span className={`day-date${isToday ? " day-date-today" : ""}`}>{dateLabel}</span>
              </div>
              <div className="day-slots">
                {HOURS.map((h) => (
                  <div key={h} className="time-slot" />
                ))}
                {dayAppts.map((appt) => (
                  <div
                    key={appt.id}
                    className={`appointment-block appt-block-${appt.status.replace(/-/g, "")}`}
                    style={{
                      top: `${3 + slotTop(appt.startTime)}rem`,
                      height: `${slotHeight(appt.startTime, appt.endTime)}rem`,
                    }}
                    title={`${appt.patientName} — ${appt.procedure} (${appt.startTime}–${appt.endTime})`}
                    role="button"
                    tabIndex={0}
                  >
                    <span className="appt-patient">{appt.patientName.split(" ")[0]}</span>
                    <span className="appt-procedure">{appt.procedure}</span>
                    <span className="appt-block-time">{appt.startTime}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        {[
          { status: "scheduled", label: "Scheduled" },
          { status: "confirmed", label: "Confirmed" },
          { status: "checkedin", label: "Checked in" },
          { status: "inprogress", label: "In progress" },
          { status: "completed", label: "Completed" },
          { status: "noshow", label: "No-show" },
        ].map(({ status, label }) => (
          <span key={status} className="legend-item">
            <span className={`legend-dot appt-block-${status}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
