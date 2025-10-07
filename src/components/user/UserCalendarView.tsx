import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { format, addDays, setHours, setMinutes } from "date-fns";
import CalendarComponent from "../common/CalendarComponent";
import CalendarTimeEntryModal from "./UserCalendarModal";

// Timesheet entry type
interface TimesheetEntry {
  id: string;
  name: string;
  start: Date;
  end: Date;
}

const names = ["John", "Snow", "Beta", "Dorothy"];

const getTimesheetEntriesForRange = (start: Date, end: Date): TimesheetEntry[] => {
  const entries: TimesheetEntry[] = [];
  let current = new Date(start);
  let id = 1;
  while (current <= end) {
    if (current.getDay() === 1 || current.getDay() === 3) {
      // Example: Each day has 1-2 random entries
      const numEntries = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < numEntries; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        // Random start between 8:00-10:00, end between 16:00-18:00
        const startTime = setMinutes(setHours(new Date(current), 8 + Math.floor(Math.random() * 3)), 0);
        const endTime = setMinutes(setHours(new Date(current), 16 + Math.floor(Math.random() * 3)), 0);
        entries.push({
          id: `${id}`,
          name,
          start: startTime,
          end: endTime,
        });
        id++;
      }
    }
    current = addDays(current, 1);
  }
  return entries;
};

const UserCalendarView: React.FC = () => {
  // Hardcoded start and end dates (memoized)
  const startDate = useMemo(() => new Date(2023, 5, 1), []); // June 1, 2023
  const endDate = useMemo(() => new Date(2023, 5, 14), []); // June 14, 2023

  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate async fetch
    setTimeout(() => {
      setEntries(getTimesheetEntriesForRange(startDate, endDate));
      setLoading(false);
    }, 1200);
  }, [startDate, endDate]);

  const onDateClick = (date: Date) => {
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setSelectedDate(null);
  };

  // Optionally handle submit here
  const handleSubmit = (data: { date: Date; startTime: string; endTime: string }) => {
    // ...handle submission logic...
    setModalOpen(false);
    setSelectedDate(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, md: 4 },
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Two-Week Calendar: {format(startDate, "MMM d")} -{" "}
          {format(endDate, "MMM d, yyyy")}
        </Typography>
      </Box>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <CalendarComponent
          startDate={startDate}
          endDate={endDate}
          entries={entries}
          onDateClick={onDateClick}
        />
      )}

      <CalendarTimeEntryModal
        open={modalOpen}
        date={selectedDate}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default UserCalendarView;
