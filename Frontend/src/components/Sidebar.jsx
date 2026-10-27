import {
  Box,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";

import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import BookmarkBorderRoundedIcon from "@mui/icons-material/BookmarkBorderRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import { NavLink, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 244;

function Sidebar({ mobileOpen = false, onClose = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();

  const role = localStorage.getItem("jobfinder_role") || "candidate";
  const isCompany = role === "company" || role === "RECRUITER";

  const links = isCompany
    ? [
        {
          label: "Overview",
          path: "/company/dashboard",
          icon: <DashboardOutlinedIcon />
        },
        {
          label: "Manage jobs",
          path: "/company/jobs",
          icon: <BusinessCenterOutlinedIcon />
        },
        {
          label: "Applicants",
          path: "/company/applicants",
          icon: <PeopleOutlineRoundedIcon />
        }
      ]
    : [
        {
          label: "Overview",
          path: "/candidate/dashboard",
          icon: <DashboardOutlinedIcon />
        },
        {
          label: "Find jobs",
          path: "/candidate/jobs",
          icon: <WorkOutlineRoundedIcon />
        },
        {
          label: "My applications",
          path: "/candidate/applications",
          icon: <AssignmentOutlinedIcon />
        }
      ];

  const handleLogout = () => {
    localStorage.removeItem("jobfinder_token");
    localStorage.removeItem("jobfinder_role");
    localStorage.removeItem("jobfinder_user");
    navigate("/login");
  };

  const sidebarContent = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "#FAF8FB"
      }}
    >
      <Box sx={{ px: 3, py: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "9px",
              bgcolor: "#2B2530",
              color: "#FFFFFF",
              display: "grid",
              placeItems: "center"
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 19 }} />
          </Box>

          <Typography
            sx={{
              fontSize: "1.12rem",
              fontWeight: 800,
              letterSpacing: "-0.055em"
            }}
          >
            jobfinder
          </Typography>
        </Box>

        <Typography
          sx={{
            mt: 1,
            ml: 0.2,
            color: "#8B8492",
            fontSize: "0.73rem"
          }}
        >
          {isCompany ? "Company workspace" : "Your career workspace"}
        </Typography>
      </Box>

      <Divider sx={{ borderColor: "#E4DFE6" }} />

      <Box sx={{ px: 2, pt: 3, pb: 1 }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1.2,
            fontSize: "0.68rem",
            letterSpacing: "0.12em",
            fontWeight: 700,
            color: "#948C9A",
            textTransform: "uppercase"
          }}
        >
          Workspace
        </Typography>

        <List disablePadding>
          {links.map((link) => {
            const selected = location.pathname === link.path;

            return (
              <ListItemButton
                key={link.path}
                component={NavLink}
                to={link.path}
                onClick={onClose}
                sx={{
                  mb: 0.5,
                  minHeight: 44,
                  borderRadius: "10px",
                  position: "relative",
                  overflow: "hidden",
                  color: selected ? "#6E2A4E" : "#6E6672",
                  bgcolor: selected ? "#F0E4EC" : "transparent",
                  "&:hover": {
                    bgcolor: selected ? "#F0E4EC" : "#EFE9F1"
                  },
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 3,
                    height: selected ? 22 : 0,
                    bgcolor: "#6E2A4E",
                    borderTopRightRadius: 3,
                    borderBottomRightRadius: 3,
                    transition: "height .18s ease"
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 38,
                    color: "inherit",
                    "& .MuiSvgIcon-root": { fontSize: 20 }
                  }}
                >
                  {link.icon}
                </ListItemIcon>

                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontSize: "0.84rem",
                    fontWeight: selected ? 700 : 500
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ borderColor: "#E4DFE6" }} />

        <Box sx={{ px: 2, py: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: "8px",
              minHeight: 42,
              color: "#6E6672",
              "&:hover": { bgcolor: "#EFE9F1" }
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              <LogoutRoundedIcon sx={{ fontSize: 19 }} />
            </ListItemIcon>
            <ListItemText
              primary="Sign out"
              primaryTypographyProps={{ fontSize: "0.84rem" }}
            />
          </ListItemButton>
        </Box>

        <Box sx={{ px: 3, pb: 3 }}>
          <Typography sx={{ color: "#A29AA8", fontSize: "0.7rem" }}>
            JobFinder · Find your next step
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0
        }}
      >
        <Box
          sx={{
            position: "fixed",
            inset: "0 auto 0 0",
            width: drawerWidth,
            borderRight: "1px solid #E4DFE6"
          }}
        >
          {sidebarContent}
        </Box>
      </Box>

      <Drawer
        open={mobileOpen}
        onClose={onClose}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            borderRight: "1px solid #E4DFE6"
          }
        }}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
}

export default Sidebar;
export { drawerWidth };