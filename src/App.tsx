import { Container, CssBaseline, ThemeProvider, Box, Paper } from '@mui/material';
import UserList from './components/user/UserList';
import theme from './theme';
import AppHeader from './components/common/AppHeader';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f7fa',
        }}
      >
        <AppHeader title="Smiline Timesheets" />
        <Container 
          maxWidth="lg" 
          sx={{ 
            flexGrow: 1, 
            py: { xs: 3, md: 5 },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, md: 4 },
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <UserList />
          </Paper>
        </Container>
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            textAlign: 'center', 
            color: 'text.secondary',
            fontSize: 14,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          © {new Date().getFullYear()} Smiline Dentistry. All rights reserved.
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
