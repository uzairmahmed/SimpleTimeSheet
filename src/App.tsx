import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import UserList from "./components/user/UserList";
import theme from "./theme";
import AppHeader from "./components/common/AppHeader";
import CalendarView from "./components/user/CalendarView";
import AppFooter from "./components/common/AppFooter";

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
          <CalendarView />
        </Box>

        <AppFooter />
      </Box>
    </ThemeProvider>
  );
}

export default App;
