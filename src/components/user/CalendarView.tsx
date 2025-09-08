import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  styled,
  useTheme,
  darken,
  lighten,
} from "@mui/material";
// Make sure to install date-fns with: npm install date-fns
import { format, addDays, isToday, isSameDay, parseISO } from "date-fns";

interface CalendarViewProps {
  startDate: Date | string; // The start date of the two-week period
  endDate: Date | string; // The end date of the two-week period
  events?: Array<{
    id: string;
    title: string;
    start: Date | string;
    end: Date | string;
    color?: string;
  }>;
  onDateClick?: (date: Date) => void;
}

const CalendarCell = styled(Paper)(({ theme }) => ({
  height: "120px",
  padding: theme.spacing(1),
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? lighten(theme.palette.background.paper, 0.1)
        : darken(theme.palette.background.paper, 0.05),
  },
  overflow: "hidden",
}));

const TodayCell = styled(CalendarCell)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
}));

const DateLabel = styled(Typography)(({ theme }) => ({
  fontWeight: "bold",
  marginBottom: theme.spacing(1),
}));

const Event = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0.5),
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  fontSize: "0.75rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const getDatesInRange = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = start;

  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

const CalendarView: React.FC<CalendarViewProps> = ({
  startDate,
  endDate,
  events = [],
  onDateClick,
}) => {
  const theme = useTheme();
  const [dateRange, setDateRange] = useState<Date[]>([]);

  // Parse dates if they're strings
  const parseDate = (date: Date | string): Date => {
    return typeof date === "string" ? parseISO(date) : date;
  };

  // Initialize the date range
  useEffect(() => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    setDateRange(getDatesInRange(start, end));
  }, [startDate, endDate]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventStart = parseDate(event.start);
      return isSameDay(date, eventStart);
    });
  };

  // Handle date cell click
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
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
          Two-Week Calendar:{" "}
          {dateRange.length > 0 &&
            `${format(dateRange[0], "MMM d")} - ${format(
              dateRange[dateRange.length - 1],
              "MMM d, yyyy"
            )}`}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        <Grid container spacing={1}>
          {/* Day header row */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Grid size={12/7} key={day}>
              <Typography align="center" fontWeight="bold">
                {day}
              </Typography>
            </Grid>
          ))}

          {/* Calendar days */}
          {dateRange.map((date) => {
            const dayEvents = getEventsForDate(date);
            const CellComponent = isToday(date) ? TodayCell : CalendarCell;

            return (
              <Grid size={12/7} key={date.toString()}>
                <CellComponent onClick={() => handleDateClick(date)}>
                  <DateLabel>{format(date, "d")}</DateLabel>
                  {dayEvents.map((event) => (
                    <Event
                      key={event.id}
                      sx={{
                        bgcolor: event.color || theme.palette.primary.light,
                        color: theme.palette.getContrastText(
                          event.color || theme.palette.primary.light
                        ),
                      }}
                    >
                      {event.title}
                    </Event>
                  ))}
                </CellComponent>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};

export default CalendarView;
