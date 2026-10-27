import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Typography
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";

import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeadder.jsx";
import { getJobs } from "../../services/jobService.js";
import { getMyApplications } from "../../services/applicationService.js";

function CandidateDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        const [jobResult, applicationResult] = await Promise.allSettled([
          getJobs(),
          getMyApplications()
        ]);

        if (!isMounted) return;

        if (jobResult.status === "fulfilled") {
          const jobData = jobResult.value;

          const jobList = Array.isArray(jobData)
            ? jobData
            : Array.isArray(jobData?.content)
              ? jobData.content
              : [];

          setJobs(jobList);
        } else {
          setError("Available jobs could not be loaded.");
        }

        if (applicationResult.status === "fulfilled") {
          const applicationData = applicationResult.value;

          const applicationList = Array.isArray(applicationData)
            ? applicationData
            : Array.isArray(applicationData?.content)
              ? applicationData.content
              : [];

          setApplications(applicationList);
        } else {
          setError((currentError) =>
            currentError
              ? `${currentError} Your applications could not be loaded.`
              : "Your applications could not be loaded."
          );
        }
      } catch {
        if (isMounted) {
          setError("Dashboard information could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const firstName = (() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("jobfinder_user") || "{}"
      );

      const name = user.name || user.fullName || "there";

      return name.trim().split(/\s+/)[0] || "there";
    } catch {
      return "there";
    }
  })();

  const pending = applications.filter((app) =>
    ["APPLIED", "PENDING", "SUBMITTED", "UNDER_REVIEW"].includes(
      String(app.status || "").toUpperCase()
    )
  ).length;

  const stats = [
    {
      label: "Available jobs",
      value: jobs.length,
      icon: <WorkOutlineRoundedIcon />,
      accent: "#6E2A4E",
      tint: "linear-gradient(135deg, #F3E7EF 0%, #E7D3E1 100%)"
    },
    {
      label: "Applications sent",
      value: applications.length,
      icon: <AssignmentOutlinedIcon />,
      accent: "#A64C6E",
      tint: "linear-gradient(135deg, #F8E7EE 0%, #F0D3DF 100%)"
    },
    {
      label: "Awaiting a response",
      value: pending,
      icon: <EventOutlinedIcon />,
      accent: "#4F6B57",
      tint: "linear-gradient(135deg, #E9F1EA 0%, #D6E6D8 100%)"
    }
  ];

  let recentApplicationsContent;

  if (loading) {
    recentApplicationsContent = (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  } else if (applications.length === 0) {
    recentApplicationsContent = (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 600 }}>
          Your next opportunity starts here.
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: "#6E6672",
            fontSize: "0.84rem"
          }}
        >
          Applications you submit or track will appear here.
        </Typography>

        <Button
          component={Link}
          to="/candidate/jobs"
          sx={{ mt: 2 }}
        >
          Browse jobs
        </Button>
      </Box>
    );
  } else {
    recentApplicationsContent = (
      <Box>
        {applications.slice(0, 5).map((app, index) => (
          <Box
            key={app.id ?? app.applicationId ?? index}
            sx={{
              py: 1.8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              borderBottom:
                index === Math.min(applications.length, 5) - 1
                  ? "none"
                  : "1px solid #E4DFE6"
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  overflowWrap: "anywhere"
                }}
              >
                {app.jobTitle ||
                  app.title ||
                  app.job?.title ||
                  "Job application"}
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  color: "#6E6672",
                  fontSize: "0.78rem"
                }}
              >
                {app.companyName ||
                  app.company ||
                  app.job?.companyName ||
                  "Company"}
              </Typography>
            </Box>

            <Chip
              label={String(app.status || "Applied").replaceAll("_", " ")}
              size="small"
              variant="outlined"
              sx={{ flexShrink: 0 }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Your workspace"
        title={`Good to see you, ${firstName}.`}
        description="Here's where things stand with your job search."
        action={
          <Button
            component={Link}
            to="/candidate/jobs"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
          >
            Explore jobs
          </Button>
        }
      />

      {error && (
        <Box
          role="alert"
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "#F8ECEE",
            border: "1px solid #E4D2DE",
            borderRadius: 2,
            color: "#B23A48",
            fontSize: "0.85rem"
          }}
        >
          {error} Check that your backend is running and you are signed in.
        </Box>
      )}

      <Grid container spacing={2}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} lg={4} key={stat.label}>
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
                  bgcolor: stat.accent
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
                      {stat.label}
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
                      {loading ? "—" : stat.value}
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
                      color: stat.accent,
                      background: stat.tint,
                      boxShadow: "inset 0 0 0 1px rgba(43, 37, 48, 0.05)",
                      "& .MuiSvgIcon-root": { fontSize: 24 }
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} lg={7}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  mb: 2.5
                }}
              >
                <Typography variant="h3">
                  Recent applications
                </Typography>

                <Button
                  component={Link}
                  to="/candidate/applications"
                  color="inherit"
                  size="small"
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  View all
                </Button>
              </Box>

              {recentApplicationsContent}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h3">
                A few useful next steps
              </Typography>

              <Box sx={{ mt: 2.5, display: "grid", gap: 2 }}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.88rem"
                    }}
                  >
                    Keep your search moving
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#6E6672",
                      fontSize: "0.82rem"
                    }}
                  >
                    Explore openings and narrow them down by location or work
                    arrangement.
                  </Typography>

                  <Button
                    component={Link}
                    to="/candidate/jobs"
                    size="small"
                    sx={{ mt: 0.7, px: 0 }}
                  >
                    Find jobs
                  </Button>
                </Box>

                <Box
                  sx={{
                    borderTop: "1px solid #E4DFE6",
                    pt: 2
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.88rem"
                    }}
                  >
                    Keep every application in one place
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: "#6E6672",
                      fontSize: "0.82rem"
                    }}
                  >
                    Add applications from external career sites to your
                    personal tracker.
                  </Typography>

                  <Button
                    component={Link}
                    to="/candidate/applications"
                    size="small"
                    sx={{ mt: 0.7, px: 0 }}
                  >
                    Open tracker
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default CandidateDashboard;