import {
  Avatar,
  Card,
  Typography,
  Stack,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import React, { useState } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";

const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const dummyUsers = [
    { id: 1, active: true, name: "Gurpreet Bhamrah" },
    { id: 2, active: true, name: "Carolina Meija" },
    { id: 3, active: true, name: "Syeda Ali" },
    { id: 4, active: true, name: "Uzair Ahmed" },
    { id: 5, active: false, name: "Shiza Ahmed" },
    { id: 6, active: false, name: "Syed Hussain" },
    { id: 7, active: false, name: "Fadi Matloub" },
    { id: 8, active: true, name: "Hina Ahmar" },
    { id: 9, active: false, name: "Samreen Ali" },
    { id: 10, active: true, name: "Uzma Jatoi" },
    { id: 11, active: false, name: "Aqleema Rehman" },
    { id: 12, active: true, name: "Keysa Fatima" },
    { id: 13, active: false, name: "Um E Rubab" },
    { id: 14, active: false, name: "Aiman Sohail" },
  ];

  const filteredUsers = dummyUsers.filter(
    (user) =>
      user.active && user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        px: { xs: 2, md: 4 },
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Select a User
        </Typography>


        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            width: "240px",
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              backgroundColor: "transparent",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{ color: "text.disabled", fontSize: "1.1rem" }}
                />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {filteredUsers.length > 0 ? (
          <Stack spacing={2} px={1} p={2}>
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                sx={{
                  px: 3,
                  py: 2,
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "background",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Avatar
                  alt={user.name}
                  src={`/static/images/avatar/${user.id}.jpg`}
                  sx={{
                    // bgcolor: `hsl(${user.id * 50}, 70%, 50%)`,
                    bgcolor: "secondary.main",
                    color: "white",
                    width: 42,
                    height: 42,
                    fontSize: 18,
                  }}
                >
                  {user.name[0]}
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{
                    ml: 2,
                    color: "text.primary",
                    fontWeight: 500,
                    flexGrow: 1,
                  }}
                >
                  {user.name}
                </Typography>
                <ArrowForwardIcon sx={{ color: "text.disabled" }} />
              </Card>
            ))}
          </Stack>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 8,
              opacity: 0.7,
            }}
          >
            <Box sx={{ fontSize: 60, mb: 2, color: "text.secondary" }}>👤</Box>
            <Typography variant="h6" sx={{ color: "text.secondary" }}>
              No users found
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserList;
