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
import type { User } from "../../types/user";

const UserList: React.FC<{ users: User[] }> = ({ users }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(
    (user) =>
      user.active && `${user.first_name} ${user.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
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
                  alt={user.first_name + " " + user.last_name}
                  src={`/static/images/avatar/${user.username}.jpg`}
                  sx={{
                    // bgcolor: `hsl(${user.id * 50}, 70%, 50%)`,
                    bgcolor: "secondary.main",
                    color: "white",
                    width: 42,
                    height: 42,
                    fontSize: 18,
                  }}
                >
                  {user.first_name[0] + user.last_name[0]}
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
                  {user.first_name + " " + user.last_name}
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
