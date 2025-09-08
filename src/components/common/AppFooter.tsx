import React from 'react';
import { Box } from '@mui/material';

const AppFooter: React.FC = () => {
    return (
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
    );
};

export default AppFooter;