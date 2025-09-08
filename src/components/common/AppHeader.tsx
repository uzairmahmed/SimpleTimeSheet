import React from 'react';
import { AppBar, Toolbar, Typography, Box, Container, Button, Divider, Avatar } from '@mui/material';
import LogoLightHorizontal from '../../../src/assets/LogoLightHorizontal.svg';

interface AppHeaderProps {
    title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = 'Smiline Timesheets' }) => {
    return (
        <AppBar 
            position="sticky" 
            color="default" 
            elevation={0} 
            sx={{ 
                backgroundColor: 'white',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Container maxWidth="lg">
                <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                            component="img" 
                            src={LogoLightHorizontal} 
                            alt="Smiline Logo" 
                            sx={{ height: 40, mr: 2 }} 
                        />
                        <Divider orientation="vertical" flexItem sx={{ mx: 2, display: { xs: 'none', sm: 'block' } }} />
                        <Typography 
                            variant="h6" 
                            component="div" 
                            sx={{ 
                                fontWeight: 600,
                                color: 'primary.main',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            {title}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button 
                            color="inherit" 
                            sx={{ 
                                fontWeight: 500,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            Help
                        </Button>
                        <Button 
                            color="inherit" 
                            sx={{ 
                                fontWeight: 500,
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            About
                        </Button>
                        <Avatar 
                            sx={{ 
                                width: 36, 
                                height: 36,
                                bgcolor: 'primary.main',
                                color: 'white',
                                ml: 1,
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: 'bold'
                            }}
                        >
                            AD
                        </Avatar>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default AppHeader;