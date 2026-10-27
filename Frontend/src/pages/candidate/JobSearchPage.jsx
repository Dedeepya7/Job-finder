import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";

import PageHeader from "../../components/PageHeadder.jsx";
import { getJobs } from "../../services/jobService.js";
import { applyForJob, getMyApplications, deleteApplication } from "../../services/applicationService.js";

function getJobList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}

function JobSearchPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [decliningId, setDecliningId] = useState(null);
  const [appliedMap, setAppliedMap] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    async function loadJobs() {
      try {
        const data = await getJobs();

        if (active) {
          setJobs(getJobList(data));
        }
      } catch {
        if (active) {
          setError("Jobs couldn't be loaded. Please check your connection.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadJobs();

    async function loadApplied() {
      try {
        const apps = await getMyApplications();
        const list = Array.isArray(apps) ? apps : apps?.content || [];

        if (active) {
          const map = {};

          list.forEach((app) => {
            const jobId = app.job?.id ?? app.jobId ?? app.job?.jobId;

            if (jobId != null && app.id != null) {
              map[String(jobId)] = app.id;
            }
          });

          setAppliedMap(map);
        }
      } catch {
        // Best-effort: if history can't be read, buttons stay enabled.
      }
    }

    loadApplied();

    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    const place = location.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = String(
        job.title || job.jobTitle || ""
      ).toLowerCase();

      const company = String(
        job.companyName || job.company || job.recruiterName || ""
      ).toLowerCase();

      const description = String(
        job.description || ""
      ).toLowerCase();

      const skills = Array.isArray(job.skills)
        ? job.skills.join(" ").toLowerCase()
        : String(job.skills || "").toLowerCase();

      const jobLocation = String(
        job.location || ""
      ).toLowerCase();

      const matchesQuery =
        !query ||
        [title, company, description, skills].some((value) =>
          value.includes(query)
        );

      const matchesLocation =
        !place || jobLocation.includes(place);

      return matchesQuery && matchesLocation;
    });
  }, [jobs, search, location]);

  async function handleApply(job) {
    const jobId = job.id ?? job.jobId;

    if (jobId == null) {
      setError("This job has no ID, so an application cannot be submitted.");
      return;
    }

    if (appliedMap[String(jobId)] != null) {
      return;
    }

    setError("");
    setMessage("");
    setApplyingId(jobId);

    try {
      const applicationPayload = {
        job: { id: jobId },
        jobTitle: job.title || job.jobTitle || "Application",
        companyName: job.companyName || job.company || "Company",
        location: job.location || "",
        jobUrl: job.jobUrl || job.applicationUrl || "",
        applicationDate: new Date().toISOString().slice(0, 10),
        status: "APPLIED",
        notes: ""
      };

      const created = await applyForJob(applicationPayload);

      setAppliedMap((current) => ({
        ...current,
        [String(jobId)]: created?.id ?? Date.now()
      }));

      setMessage("Your application has been submitted.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We couldn't submit your application. Please try again."
      );
    } finally {
      setApplyingId(null);
    }
  }

  async function handleDecline(job) {
    const jobId = job.id ?? job.jobId;
    const applicationId = appliedMap[String(jobId)];

    if (applicationId == null) {
      return;
    }

    if (!window.confirm("Withdraw your application for this job?")) {
      return;
    }

    setError("");
    setMessage("");
    setDecliningId(jobId);

    try {
      await deleteApplication(applicationId);

      setAppliedMap((current) => {
        const next = { ...current };
        delete next[String(jobId)];
        return next;
      });

      setMessage("Your application has been withdrawn.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We couldn't withdraw your application. Please try again."
      );
    } finally {
      setDecliningId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setLocation("");
  }

  function renderJobCard(job, index) {
    const id = job.id ?? job.jobId ?? index;

    const title = job.title || job.jobTitle || "Untitled role";

    const company =
      job.companyName ||
      job.company ||
      job.recruiterName ||
      "Company";

    const isApplied = appliedMap[String(id)] != null;
    const isApplying = applyingId === id;
    const isDeclining = decliningId === id;

    return (
      <Card key={id}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 2
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: 1.8,
                minWidth: 0,
                flex: 1
              }}
            >
              <Box
                aria-hidden="true"
                sx={{
                  flexShrink: 0,
                  width: 46,
                  height: 46,
                  borderRadius: "13px",
                  background:
                    "linear-gradient(135deg, #6E2A4E 0%, #A64C6E 100%)",
                  color: "#FFFFFF",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  boxShadow: "0 6px 14px rgba(110, 42, 78, 0.22)"
                }}
              >
                {company.charAt(0).toUpperCase()}
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    overflowWrap: "anywhere"
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.3,
                    color: "#6E6672",
                    fontSize: "0.82rem"
                  }}
                >
                  {company}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.8,
                    mt: 1.4
                  }}
                >
                  {job.location && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label={job.location}
                    />
                  )}
                </Box>
              </Box>
            </Box>

            {isApplied ? (
              <Button
                variant="outlined"
                color="error"
                disabled={isDeclining}
                onClick={() => handleDecline(job)}
                sx={{ flexShrink: 0 }}
              >
                {isDeclining ? "Withdrawing..." : "Decline"}
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                disabled={isApplying}
                onClick={() => handleApply(job)}
                sx={{ flexShrink: 0 }}
              >
                {isApplying ? "Applying..." : "Apply"}
              </Button>
            )}
          </Box>

          {job.description && (
            <Typography
              sx={{
                mt: 2,
                color: "#6E6672",
                fontSize: "0.84rem",
                lineHeight: 1.8,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}
            >
              {job.description}
            </Typography>
          )}

          {(job.jobUrl || job.applicationUrl) && (
            <Button
              component="a"
              href={job.jobUrl || job.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              color="inherit"
              endIcon={<OpenInNewRoundedIcon />}
              sx={{ mt: 1.2, px: 0 }}
            >
              View original listing
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  let jobsContent;

  if (loading) {
    jobsContent = (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          py: 8
        }}
      >
        <CircularProgress size={26} />
      </Box>
    );
  } else if (filteredJobs.length === 0) {
    jobsContent = (
      <Card>
        <CardContent sx={{ textAlign: "center", py: 7 }}>
          <Typography variant="h3">
            No matching jobs yet
          </Typography>

          <Typography sx={{ mt: 1, color: "#6E6672" }}>
            Try another title or widen your location filters.
          </Typography>

          <Button onClick={clearFilters} sx={{ mt: 2 }}>
            Reset search
          </Button>
        </CardContent>
      </Card>
    );
  } else {
    jobsContent = (
      <Stack spacing={1.5}>
        {filteredJobs.map((job, index) =>
          renderJobCard(job, index)
        )}
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Opportunities"
        title="Find work that fits."
        description="Search openings, compare roles, and find your next step."
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {message && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setMessage("")}
        >
          {message}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Job title, company or skill"
                InputProps={{
                  startAdornment: (
                    <SearchRoundedIcon
                      sx={{ color: "#8B8492", mr: 1 }}
                    />
                  )
                }}
                inputProps={{
                  "aria-label": "Search jobs"
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Location"
                InputProps={{
                  startAdornment: (
                    <PlaceOutlinedIcon
                      sx={{ color: "#8B8492", mr: 1 }}
                    />
                  )
                }}
                inputProps={{
                  "aria-label": "Filter by location"
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                onClick={clearFilters}
                sx={{ height: 48 }}
              >
                Clear filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2
        }}
      >
        <Typography
          sx={{
            fontSize: "0.85rem",
            color: "#6E6672"
          }}
        >
          {loading
            ? "Loading opportunities..."
            : `${filteredJobs.length} jobs found`}
        </Typography>
      </Box>

      {jobsContent}
    </Box>
  );
}

export default JobSearchPage;
