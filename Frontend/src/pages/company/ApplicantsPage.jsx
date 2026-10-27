import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import PageHeader from "../../components/PageHeadder.jsx";
import {
  getJobs,
  getJobApplications
} from "../../services/jobService.js";
import { updateApplicationStatus } from "../../services/applicationService.js";

// Must match the backend ApplicationStatus enum exactly, or the API rejects it.
const applicationStatuses = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN"
];

function downloadCSV(rows) {
  const columns = [
    ["Candidate", "candidate"],
    ["Email", "email"],
    ["Job title", "jobTitle"],
    ["Applied date", "appliedDate"],
    ["Status", "status"]
  ];

  const cell = (value) => {
    let text = String(value ?? "");

    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    columns.map(([label]) => cell(label)).join(","),
    ...rows.map((row) =>
      columns.map(([, key]) => cell(row[key])).join(",")
    )
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "jobfinder-filtered-applicants.csv";
  anchor.click();

  URL.revokeObjectURL(url);
}

function ApplicantsPage() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function loadApplicants() {
      setLoading(true);
      setError("");

      try {
        const data = await getJobs();
        const jobList = Array.isArray(data) ? data : data.content || [];

        setJobs(jobList);

        const responses = await Promise.all(
          jobList.map(async (job) => {
            const jobId = job.id ?? job.jobId;

            if (jobId == null) return [];

            try {
              const result = await getJobApplications(jobId);
              const list = Array.isArray(result)
                ? result
                : result.content || [];

              return list.map((application) => ({
                ...application,
                jobId,
                jobTitle:
                  application.jobTitle ||
                  application.job?.title ||
                  job.title ||
                  job.jobTitle ||
                  "Job listing",
                appliedDate:
                  application.appliedDate ||
                  application.applicationDate ||
                  application.createdAt ||
                  "",
                candidate:
                  application.candidateName ||
                  application.userName ||
                  application.candidate?.name ||
                  application.user?.name ||
                  "Candidate",
                email:
                  application.candidateEmail ||
                  application.userEmail ||
                  application.candidate?.email ||
                  application.user?.email ||
                  ""
              }));
            } catch {
              return [];
            }
          })
        );

        setApplicants(responses.flat());
      } catch {
        setError(
          "Applicants couldn't be loaded. Check that your account can access its job listings."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplicants();
  }, []);

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return applicants.filter((person) => {
      const matchesSearch =
        !query ||
        String(person.candidate).toLowerCase().includes(query) ||
        String(person.email).toLowerCase().includes(query) ||
        String(person.jobTitle).toLowerCase().includes(query);

      const matchesJob =
        !jobFilter || String(person.jobId) === String(jobFilter);

      const matchesStatus =
        !statusFilter ||
        String(person.status || "").toUpperCase() === statusFilter;

      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applicants, search, jobFilter, statusFilter]);

  async function handleStatusChange(person, nextStatus) {
    const id = person.id ?? person.applicationId;
    const jobId = person.jobId;

    if (id == null || jobId == null) {
      setError(
        "This application is missing an ID or job reference and cannot be updated."
      );
      return;
    }

    const previousStatus = person.status;
    setError("");
    setNotice("");
    setUpdatingId(id);

    setApplicants((current) =>
      current.map((item) =>
        (item.id ?? item.applicationId) === id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    try {
      await updateApplicationStatus(jobId, id, nextStatus);
      setNotice("Application status updated.");
    } catch (err) {
      setApplicants((current) =>
        current.map((item) =>
          (item.id ?? item.applicationId) === id
            ? { ...item, status: previousStatus }
            : item
        )
      );

      setError(
        err.response?.data?.message ||
          "The status couldn't be updated. Your backend may use a different request format."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const distinctCandidates = new Set(
    filteredApplicants.map((item) => item.email || item.candidate)
  ).size;

  return (
    <Box>
      <PageHeader
        eyebrow="Hiring"
        title="Applicants"
        description="Review candidates across your listings and keep the process moving."
        action={
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DownloadOutlinedIcon />}
            onClick={() => downloadCSV(filteredApplicants)}
            disabled={filteredApplicants.length === 0}
          >
            Export filtered
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {notice && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {notice}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: "#6E6672", fontSize: "0.82rem" }}>
                Matching applications
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "-0.05em"
                }}
              >
                {loading ? "—" : filteredApplicants.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent sx={{ p: 2.5 }}>
              <Typography sx={{ color: "#6E6672", fontSize: "0.82rem" }}>
                Distinct candidates in results
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  letterSpacing: "-0.05em"
                }}
              >
                {loading ? "—" : distinctCandidates}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search candidates, email or job"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchRoundedIcon sx={{ color: "#8B8492", mr: 1 }} />
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Job listing"
                value={jobFilter}
                onChange={(event) => setJobFilter(event.target.value)}
              >
                <MenuItem value="">All my jobs</MenuItem>
                {jobs.map((job, index) => (
                  <MenuItem
                    key={job.id ?? job.jobId ?? index}
                    value={String(job.id ?? job.jobId)}
                  >
                    {job.title || job.jobTitle || "Untitled job"}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                select
                fullWidth
                size="small"
                label="Application status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="">All statuses</MenuItem>
                {applicationStatuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replaceAll("_", " ")}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Candidate</TableCell>
                  <TableCell>Job applied for</TableCell>
                  <TableCell>Date applied</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredApplicants.map((person, index) => {
                  const id = person.id ?? person.applicationId ?? index;

                  return (
                    <TableRow key={id} hover>
                      <TableCell sx={{ minWidth: 190 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: "0.83rem" }}
                        >
                          {person.candidate}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.4,
                            color: "#6E6672",
                            fontSize: "0.76rem",
                            overflowWrap: "anywhere"
                          }}
                        >
                          {person.email || "Email unavailable"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        {person.jobTitle}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {person.appliedDate || "—"}
                      </TableCell>

                      <TableCell sx={{ minWidth: 165 }}>
                        <TextField
                          select
                          size="small"
                          value={String(person.status || "PENDING").toUpperCase()}
                          disabled={updatingId === id}
                          onChange={(event) =>
                            handleStatusChange(person, event.target.value)
                          }
                          sx={{ minWidth: 150 }}
                        >
                          {applicationStatuses.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.replaceAll("_", " ")}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && filteredApplicants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          No applicants match these filters
                        </Typography>
                        <Typography
                          sx={{
                            mt: 1,
                            color: "#6E6672",
                            fontSize: "0.83rem"
                          }}
                        >
                          Try another search or select all job listings.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {loading && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Typography sx={{ py: 4, color: "#6E6672" }}>
                        Loading applicants...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography sx={{ mt: 2, color: "#8B8492", fontSize: "0.75rem" }}>
            Export includes only the applications currently shown by your
            search and filters.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ApplicantsPage;