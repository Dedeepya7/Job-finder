import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeadder.jsx";
import { getJobs } from "../../services/jobService.js";

function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getJobs()
      .then((data) => {
        setJobs(Array.isArray(data) ? data : data.content || []);
      })
      .catch(() => {
        setError("We couldn't load your job listings.");
      })
      .finally(() => setLoading(false));
  }, []);

  const distinctLocations = new Set(
    jobs
      .map((job) => String(job.location || "").trim())
      .filter(Boolean)
  ).size;

  const recentlyAdded = jobs.filter((job) => {
    if (!job.createdAt) return false;
    const created = new Date(job.createdAt).getTime();
    return Date.now() - created <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <Box>
      <PageHeader
        eyebrow="Company workspace"
        title="Your hiring overview"
        description="Manage your openings and keep an eye on your applicant pipeline."
        action={
          <Button
            component={Link}
            to="/company/jobs"
            variant="contained"
            startIcon={<AddRoundedIcon />}
          >
            Post a job
          </Button>
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} Ensure your account has permission to view company jobs.
        </Alert>
      )}

      <Grid container spacing={2}>
        {[
          {
            label: "Total listings",
            value: jobs.length,
            icon: <BusinessCenterOutlinedIcon />,
            accent: "#6E2A4E",
            tint: "linear-gradient(135deg, #F3E7EF 0%, #E7D3E1 100%)"
          },
          {
            label: "Locations covered",
            value: distinctLocations,
            icon: <PlaceOutlinedIcon />,
            accent: "#A64C6E",
            tint: "linear-gradient(135deg, #F8E7EE 0%, #F0D3DF 100%)"
          },
          {
            label: "Added this week",
            value: recentlyAdded,
            icon: <PeopleOutlineRoundedIcon />,
            accent: "#4F6B57",
            tint: "linear-gradient(135deg, #E9F1EA 0%, #D6E6D8 100%)"
          }
        ].map((item) => (
          <Grid item xs={12} sm={6} lg={4} key={item.label}>
            <Card
              sx={{
                position: "relative",
                overflow: "hidden",
                height: "100%"
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: 4,
                  bgcolor: item.accent
                }}
              />
              <CardContent sx={{ p: 2.75 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#8B8492",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase"
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1.5,
                        fontSize: "2.5rem",
                        lineHeight: 1,
                        fontWeight: 800,
                        letterSpacing: "-0.04em",
                        color: "#2B2530"
                      }}
                    >
                      {loading ? "—" : item.value}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 50,
                      height: 50,
                      borderRadius: "15px",
                      display: "grid",
                      placeItems: "center",
                      color: item.accent,
                      background: item.tint,
                      boxShadow: "inset 0 0 0 1px rgba(43, 37, 48, 0.05)",
                      "& .MuiSvgIcon-root": { fontSize: 24 }
                    }}
                  >
                    {item.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h3">Hiring at a glance</Typography>
          <Typography sx={{ mt: 1, color: "#6E6672", fontSize: "0.85rem" }}>
            Keep your listings current and review candidates as applications
            arrive.
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2.5,
                  border: "1px solid #E4DFE6",
                  borderRadius: 2
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Manage your openings
                </Typography>
                <Typography
                  sx={{ mt: 0.7, color: "#6E6672", fontSize: "0.82rem" }}
                >
                  Create new roles, update descriptions, and remove closed
                  positions.
                </Typography>
                <Button
                  component={Link}
                  to="/company/jobs"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 1, px: 0 }}
                >
                  View listings
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                sx={{
                  p: 2.5,
                  border: "1px solid #E4DFE6",
                  borderRadius: 2
                }}
              >
                <Typography sx={{ fontWeight: 700 }}>
                  Review applicants
                </Typography>
                <Typography
                  sx={{ mt: 0.7, color: "#6E6672", fontSize: "0.82rem" }}
                >
                  Search candidates, narrow the list by status, and export
                  filtered results.
                </Typography>
                <Button
                  component={Link}
                  to="/company/applicants"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ mt: 1, px: 0 }}
                >
                  View applicants
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}

export default CompanyDashboard;