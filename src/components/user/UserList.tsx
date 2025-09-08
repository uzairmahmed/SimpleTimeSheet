import { Avatar, Card, Typography, Stack, Box, TextField, InputAdornment } from "@mui/material";
import React, { useState } from "react";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const dummyUsers = [
    { id: 1, name: "Gurpreet Bhamrah" },
    { id: 2, name: "Carolina Meija" },
    { id: 3, name: "Syeda Ali" },
    { id: 4, name: "Uzair Ahmed" },
    { id: 5, name: "Shiza Ahmed" },
    { id: 6, name: "Syed Hussain" },
    { id: 7, name: "Fadi Matloub" },
    { id: 8, name: "Hina Ahmar" },
    { id: 9, name: "Samreen Ali" },
    { id: 10, name: "Uzma Jatoi" },
    { id: 11, name: "Aqleema Rehman" },
    { id: 12, name: "Keysa Fatima" },
    { id: 13, name: "Um E Rubab" },
    { id: 14, name: "Aiman Sohail" },
  ];

  const filteredUsers = dummyUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
          Select a User
        </Typography>
      </Box>
      
      <TextField
        fullWidth
        placeholder="Search users..."
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ 
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: "white",
          }
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Box sx={{ color: 'action.active', fontSize: '1.2rem' }}>🔍</Box>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredUsers.length > 0 ? (
          <Stack spacing={2}>
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Avatar
                  alt={user.name}
                  src={`/static/images/avatar/${user.id}.jpg`}
                  sx={{
                    bgcolor: `hsl(${user.id * 50}, 70%, 50%)`,
                    color: "white",
                    width: 42,
                    height: 42,
                    fontSize: 18,
                  }}
                >
                  {user.name[0]}
                </Avatar>
                <Typography variant="body1" sx={{ ml: 2, color: "text.primary", fontWeight: 500, flexGrow: 1 }}>
                  {user.name}
                </Typography>
                <ArrowForwardIcon sx={{ color: 'text.disabled' }} />
              </Card>
            ))}
          </Stack>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8,
            opacity: 0.7
          }}>
            <Box sx={{ fontSize: 60, mb: 2, color: 'text.secondary' }}>👤</Box>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              No users found
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserList;