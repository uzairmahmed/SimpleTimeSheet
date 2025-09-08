import { Typography, Container, Box } from '@mui/material';

function App() {

  return (
    <>
      <Container maxWidth="sm">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Hello World
          </Typography>
          <Typography variant="body1">
            Welcome to my MUI applications
          </Typography>
        </Box>
      </Container>
    </>
  )
}

export default App
