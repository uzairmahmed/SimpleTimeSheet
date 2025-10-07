import { CssBaseline, ThemeProvider, Box } from "@mui/material";
import theme from "./theme";
import AppHeader from "./components/common/AppHeader";
import AppFooter from "./components/common/AppFooter";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import User from "./pages/User";
import Admin from "./pages/Admin";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f5f7fa",
            height: "100vh",
            overflow: "hidden",
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/user/:id" element={<User />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Box>
          <AppFooter />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
