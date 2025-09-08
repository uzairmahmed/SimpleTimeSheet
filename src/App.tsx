import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import UserList from "./components/user/UserList";
import theme from "./theme";
import AppHeader from "./components/common/AppHeader";
import CalendarView from "./components/user/CalendarView";
import { addDays } from "date-fns/addDays";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f7fa",
          height: "100vh", // Fixed height
          overflow: "hidden", // Prevent app-level scrolling
        }}
      >
        <AppHeader title="Smiline Timesheets" />
        <Box
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* <UserList /> */}
          <CalendarView
            startDate={new Date(2023, 5, 1)}
            endDate={new Date(2023, 5, 14)}
            events={[
              {
                id: "1",
                title: "Meeting",
                start: new Date(2023, 5, 3),
                end: new Date(2023, 5, 3),
              },
            ]}
            onDateClick={(date) => console.log("Date clicked:", date)}
          />
        </Box>

        <Box
          component="footer"
          sx={{
            py: 2,
            textAlign: "center",
            color: "text.secondary",
            fontSize: 14,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "transparent",
          }}
        >
          © {new Date().getFullYear()} Smiline Dentistry. All rights reserved.
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
