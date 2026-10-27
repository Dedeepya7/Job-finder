import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import PageHeader from "../../components/PageHeadder.jsx";
import {
  createJob,
  deleteJob,
  getJobs,
  updateJob
} from "../../services/jobService.js";

const blankJob = {
  title: "",
  companyName: "",
  description: "",
  location: "",
  jobUrl: ""
};

function getJobList(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  return [];
}

function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [form, setForm] = useState(blankJob);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadJobs() {
    setLoading(true);
    setError("");

    try {
      const data = await getJobs();
      setJobs(getJobList(data));
    } catch {
      setError("Couldn't load job listings. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const title = String(
        job.title || job.jobTitle || ""
      ).toLowerCase();

      const location = String(job.location || "").toLowerCase();

      return (
        !query ||
        title.includes(query) ||
        location.includes(query)
      );
    });
  }, [jobs, search]);

  function openCreate() {
    setError("");
    setNotice("");
    setEditingJob(null);
    setForm({ ...blankJob });
    setDialogOpen(true);
  }

  function openEdit(job) {
    setError("");
    setNotice("");
    setEditingJob(job);

    setForm({
      title: job.title || job.jobTitle || "",
      companyName: job.companyName || job.company || "",
      description: job.description || "",
      location: job.location || "",
      jobUrl: job.jobUrl || job.applicationUrl || ""
    });

    setDialogOpen(true);
  }

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  async function handleSave(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const payload = {
        title: form.title.trim(),
        companyName: form.companyName.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        jobUrl: form.jobUrl.trim()
      };

      if (editingJob) {
        const id = editingJob.id ?? editingJob.jobId;

        if (id == null) {
          setError("This job has no ID, so it cannot be updated.");
          return;
        }

        await updateJob(id, payload);
        setNotice("Your job listing has been updated.");
      } else {
        await createJob(payload);
        setNotice("Your job listing has been created.");
      }

      setDialogOpen(false);
      await loadJobs();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We couldn't save this listing. Check the fields required by your backend."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(job) {
    const id = job.id ?? job.jobId;

    if (id == null) {
      setError("This job has no ID, so it cannot be deleted.");
      return;
    }

    if (deletingId !== null) {
      return;
    }

    const title = job.title || job.jobTitle || "this listing";

    if (!window.confirm(`Delete "${title}"?`)) {
      return;
    }

    setError("");
    setNotice("");
    setDeletingId(id);

    try {
      await deleteJob(id);

      setJobs((current) =>
        current.filter(
          (item) => (item.id ?? item.jobId) !== id
        )
      );

      setNotice("Job listing deleted.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "The listing couldn't be deleted. You may not have permission."
      );
    } finally {
      setDeletingId(null);
    }
  }

  let jobsContent;

  if (loading) {
    jobsContent = (
      <Typography sx={{ py: 4, color: "#6E6672" }}>
        Loading job listings...
      </Typography>
    );
  } else if (filteredJobs.length === 0) {
    jobsContent = (
      <Box sx={{ py: 5, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 700 }}>
          No listings found
        </Typography>

        <Typography
          sx={{ mt: 1, color: "#6E6672", fontSize: "0.84rem" }}
        >
          Create your first listing or try another search.
        </Typography>

        {search && (
          <Button onClick={() => setSearch("")} sx={{ mt: 1 }}>
            Clear search
          </Button>
        )}
      </Box>
    );
  } else {
    jobsContent = (
      <Stack spacing={1.5}>
        {filteredJobs.map((job, index) => {
          const id = job.id ?? job.jobId ?? index;
          const companyName = job.companyName || job.company || "";

          return (
            <Box
              key={id}
              sx={{
                p: 2,
                border: "1px solid #E4DFE6",
                borderRadius: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", sm: "center" },
                flexDirection: { xs: "column", sm: "row" },
                gap: 2
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    overflowWrap: "anywhere"
                  }}
                >
                  {job.title || job.jobTitle || "Untitled role"}
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    color: "#6E6672",
                    fontSize: "0.8rem"
                  }}
                >
                  {[companyName, job.location]
                    .filter(Boolean)
                    .join(" · ") || "Details not provided"}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    mt: 1.2
                  }}
                >
                  <Chip
                    size="small"
                    variant="outlined"
                    label={job.status || "Active"}
                  />
                </Box>
              </Box>

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<EditOutlinedIcon />}
                  onClick={() => openEdit(job)}
                  disabled={deletingId !== null}
                >
                  Edit
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteOutlineRoundedIcon />}
                  onClick={() => handleDelete(job)}
                  disabled={deletingId !== null}
                >
                  {deletingId === id ? "Deleting..." : "Delete"}
                </Button>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Hiring"
        title="Manage jobs"
        description="Keep your open roles accurate and up to date."
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openCreate}
          >
            Create job
          </Button>
        }
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

      {notice && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setNotice("")}
        >
          {notice}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <TextField
            fullWidth
            placeholder="Search by job title or location"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <SearchRoundedIcon
                  sx={{ color: "#8B8492", mr: 1 }}
                />
              )
            }}
            inputProps={{
              "aria-label": "Search job listings"
            }}
            sx={{ mb: 2.5 }}
          />

          {jobsContent}
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => {
          if (!saving) {
            setDialogOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingJob ? "Edit job listing" : "Create a job listing"}
          </DialogTitle>

          <DialogContent dividers>
            <Grid container spacing={2} sx={{ pt: 0.5 }}>
              <Grid item xs={12}>
                <TextField
                  label="Job title"
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Location"
                  value={form.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Company name"
                  value={form.companyName}
                  onChange={(event) =>
                    updateField("companyName", event.target.value)
                  }
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Job URL (optional)"
                  type="url"
                  value={form.jobUrl}
                  onChange={(event) =>
                    updateField("jobUrl", event.target.value)
                  }
                  placeholder="https://..."
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Job description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  required
                  multiline
                  minRows={5}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              color="inherit"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingJob
                  ? "Save changes"
                  : "Publish job"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default ManageJobsPage;
