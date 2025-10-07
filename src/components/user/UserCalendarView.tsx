import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import CalendarComponent from "../common/CalendarComponent";
import CalendarTimeEntryModal from "./UserCalendarModal";

import { getUserTimesheetEntries } from "../../api/timesheet";
import type { TimeSheetEntryNew } from "../../types/user";
import { format } from "date-fns";

const UserCalendarView: React.FC<{ userId: string }> = ({ userId }) => {
  // Hardcoded start and end dates (memoized)
  const startDate = useMemo(() => new Date(2023, 5, 1), []); // June 1, 2023
  const endDate = useMemo(() => new Date(2023, 5, 14), []); // June 14, 2023

  const [entries, setEntries] = useState<TimeSheetEntryNew[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    setLoading(true);
    // Simulate async fetch
    setTimeout(() => {
      setEntries(getUserTimesheetEntries(userId));
      setLoading(false);
    }, 1200);
  }, [startDate, endDate, userId]);

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
