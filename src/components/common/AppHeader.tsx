import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, Divider } from '@mui/material';
import LogoLightHorizontal from '../../../src/assets/LogoLightHorizontal.svg';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';

interface AppHeaderProps {
    title?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ title = 'Smiline Timesheets' }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isHome = location.pathname === '/';

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <AppBar 
            position="sticky" 
            color="default" 
            elevation={0} 
            sx={{ 
                backgroundColor: 'transparent',
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', py: 1, px: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {!isHome && (
                        <IconButton color="default" onClick={handleBack} sx={{ mr: 1 }}>
                            <ArrowBackIcon />
                        </IconButton>
                    )}
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
                    <IconButton color="default">
                        <CalendarMonthIcon sx={{ color: 'text.disabled' }} />
                    </IconButton>
                    <IconButton color="default">
                        <AdminPanelSettingsIcon sx={{ color: 'text.disabled' }} />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default AppHeader;