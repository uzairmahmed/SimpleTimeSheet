import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import UserList from "./components/user/UserList";
import theme from "./theme";
import AppHeader from "./components/common/AppHeader";

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
          overflow: "hidden" // Prevent app-level scrolling
        }}
      >
        <AppHeader title="Smiline Timesheets" />
        <Box sx={{ flexGrow: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <UserList />
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
