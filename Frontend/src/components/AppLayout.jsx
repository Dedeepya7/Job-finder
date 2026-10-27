import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { Outlet } from "react-router-dom";

import Sidebar, { drawerWidth } from "./Sidebar.jsx";

function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const storedUser = localStorage.getItem("jobfinder_user");
  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    user = {};
  }

  const displayName = user.name || user.fullName || user.email || "My account";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "#F5F3F6" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          ml: { xs: 0, md: `${drawerWidth}px` }
        }}
      >
        <Box
          component="header"
          sx={{
            height: 66,
            px: { xs: 2, md: 4 },
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "#F5F3F6",
            borderBottom: "1px solid #E4DFE6"
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
              aria-label="Open navigation"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Typography
              sx={{
                color: "#6E6672",
                fontSize: "0.8rem",
                display: { xs: "none", sm: "block" }
              }}
            >
              Workspace
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              size="small"
              aria-label="Notifications"
              sx={{ color: "#6E6672" }}
            >
              <NotificationsNoneRoundedIcon />
            </IconButton>

            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                bgcolor: "#E4D2DE",
                display: "grid",
                placeItems: "center",
                color: "#6E2A4E",
                fontSize: "0.78rem",
                fontWeight: 700
              }}
            >
              {displayName.trim().charAt(0).toUpperCase()}
            </Box>

            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                display: { xs: "none", sm: "block" },
                maxWidth: 180,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {displayName}
            </Typography>
          </Box>
        </Box>

        <Box
          component="main"
          sx={{
            width: "100%",
            maxWidth: 1600,
            ml: 0,
            mr: "auto",
            p: { xs: 2, sm: 3, lg: 4 },
            minHeight: "calc(100vh - 66px)"
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;