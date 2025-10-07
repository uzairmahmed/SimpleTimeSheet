import type { TimeSheetEntryNew } from "../types/user";

export const getUserTimesheetEntries: (
  userId: string
) => TimeSheetEntryNew[] = (userId) => {
  const entries: TimeSheetEntryNew[] = [
    {
      id: "1",
      userId: "1",
      date: new Date(2023, 5, 1),
      startTime: new Date(2023, 5, 1, 9, 0),
      endTime: new Date(2023, 5, 1, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "2",
      userId: "1",
      date: new Date(2023, 5, 3),
      startTime: new Date(2023, 5, 3, 9, 0),
      endTime: new Date(2023, 5, 3, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "3",
      userId: "1",
      date: new Date(2023, 5, 9),
      startTime: new Date(2023, 5, 9, 9, 0),
      endTime: new Date(2023, 5, 9, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "4",
      userId: "1",
      date: new Date(2023, 5, 10),
      startTime: new Date(2023, 5, 10, 10, 0),
      endTime: new Date(2023, 5, 10, 12, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
  ];

  return entries;
};

export const getAllUsersTimesheetEntries = (): TimeSheetEntryNew[] => {
  const entries: TimeSheetEntryNew[] = [
    {
      id: "1",
      userId: "1",
      date: new Date(2023, 6, 1),
      startTime: new Date(2023, 6, 1, 9, 0),
      endTime: new Date(2023, 6, 1, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "2",
      userId: "1",
      date: new Date(2023, 6, 3),
      startTime: new Date(2023, 6, 3, 9, 0),
      endTime: new Date(2023, 6, 3, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "3",
      userId: "1",
      date: new Date(2023, 6, 9),
      startTime: new Date(2023, 6, 9, 9, 0),
      endTime: new Date(2023, 6, 9, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "4",
      userId: "1",
      date: new Date(2023, 6, 10),
      startTime: new Date(2023, 6, 10, 10, 0),
      endTime: new Date(2023, 6, 10, 12, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "5",
      userId: "3",
      date: new Date(2023, 6, 3),
      startTime: new Date(2023, 6, 3, 9, 0),
      endTime: new Date(2023, 6, 3, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "6",
      userId: "2",
      date: new Date(2023, 6, 9),
      startTime: new Date(2023, 6, 9, 9, 0),
      endTime: new Date(2023, 6, 9, 17, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
    {
      id: "4",
      userId: "4",
      date: new Date(2023, 6, 10),
      startTime: new Date(2023, 6, 10, 10, 0),
      endTime: new Date(2023, 6, 10, 12, 0),
      breakMinutes: 60,
      totalHours: 7,
    },
  ];

  return entries;
};
