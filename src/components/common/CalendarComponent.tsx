import React from "react";
import {
  Box,
  Paper,
  Typography,
  styled,
  useTheme,
  darken,
  lighten,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { format, addDays, isToday, isSameDay, parseISO } from "date-fns";
import type { TimeSheetEntryNew } from "../../types/user";

// CalendarComponent receives startDate, endDate, events, and onDateClick as props and renders the calendar grid
interface CalendarComponentProps {
  startDate: Date | string;
  endDate: Date | string;
  entries?: TimeSheetEntryNew[];
  onDateClick?: (date: Date) => void;
}

const CalendarCell = styled(Paper)(({ theme }) => ({
  height: "100%",
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

const CalendarComponent: React.FC<CalendarComponentProps> = ({
  startDate,
  endDate,
  entries = [],
  onDateClick,
}) => {

  const theme = useTheme();
  const parseDate = (date: Date | string): Date =>
    typeof date === "string" ? parseISO(date) : date;
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const dateRange = getDatesInRange(start, end);

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) => {
      const entryStart = parseDate(entry.startTime);
      return isSameDay(date, entryStart);
    });
  };

  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "none",
        mb: 2,
        gap: 1,
      }}
    >
      <Grid container spacing={1}>
        {/* Day header row */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <Grid
            size={12 / 7}
            key={day}
          >
            <Typography align="center" fontWeight="bold">
              {day}
            </Typography>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={1} height={"100%"}>
        {/* Calendar days */}
        {dateRange.map((date) => {
          const dayEntries = getEntriesForDate(date);
          console.log("Entries for date", date, dayEntries);
          const CellComponent = isToday(date) ? TodayCell : CalendarCell;
          return (
            <Grid size={12 / 7} key={date.toString()}>
              <CellComponent onClick={() => handleDateClick(date)}>
                <DateLabel>{format(date, "d")}</DateLabel>
                {dayEntries.map((entry) => (
                  <Event
                    key={entry.id}
                    sx={{
                      bgcolor: theme.palette.primary.light,
                      color: theme.palette.getContrastText(
                        theme.palette.primary.light
                      ),
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {entry.userId}
                    </Typography>
                    <Typography variant="caption">
                      {format(parseDate(entry.startTime), "HH:mm")} -{" "}
                      {format(parseDate(entry.endTime), "HH:mm")}
                    </Typography>
                  </Event>
                ))}
              </CellComponent>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default CalendarComponent;
