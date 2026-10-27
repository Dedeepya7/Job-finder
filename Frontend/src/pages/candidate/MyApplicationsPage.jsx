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

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";

import PageHeader from "../../components/PageHeadder.jsx";
import { getMyApplications } from "../../services/applicationService.js";

const STORAGE_KEY = "jobfinder_external_applications";

const statuses = [
  "Saved",
  "Applied",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
  "Withdrawn"
];

const emptyForm = {
  title: "",
  company: "",
  location: "",
  source: "Company website",
  applicationUrl: "",
  appliedDate: new Date().toISOString().slice(0, 10),
  followUpDate: "",
  status: "Applied",
  notes: ""
};

function readExternalApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function getStatusColor(status) {
  switch (String(status || "").toLowerCase()) {
    case "offer":
      return { color: "#4F6B57", background: "#E9F0E9" };
    case "interview":
      return { color: "#6E2A4E", background: "#EFDFEA" };
    case "rejected":
      return { color: "#B23A48", background: "#F8ECEE" };
    case "assessment":
      return { color: "#9A6B34", background: "#F6EFE2" };
    default:
      return { color: "#6E6672", background: "#EDE8EF" };
  }
}

function exportCSV(rows) {
  const columns = [
    ["Job title", "title"],
    ["Company", "company"],
    ["Location", "location"],
    ["Source", "source"],
    ["Applied date", "appliedDate"],
    ["Follow-up date", "followUpDate"],
    ["Status", "status"],
    ["Job URL", "applicationUrl"],
    ["Notes", "notes"]
  ];

  const escapeCell = (value) => {
    let text = String(value ?? "");

    // Prevent spreadsheet formulas from being interpreted as formulas.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = `'${text}`;
    }

    return `"${text.replace(/"/g, '""')}"`;
  };

  const csv = [
    columns.map(([label]) => escapeCell(label)).join(","),
    ...rows.map((row) =>
      columns.map(([, key]) => escapeCell(row[key])).join(",")
    )
  ].join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "jobfinder-applications.csv";
  anchor.click();

  URL.revokeObjectURL(url);
}

function MyApplicationsPage() {
  const [platformApplications, setPlatformApplications] = useState([]);
  const [externalApplications, setExternalApplications] = useState(
    readExternalApplications
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyApplications()
      .then((data) => {
        const records = Array.isArray(data) ? data : data.content || [];

        setPlatformApplications(
          records.map((item, index) => ({
            id: `platform-${item.id ?? index}`,
            title:
              item.jobTitle || item.title || item.job?.title || "Job application",
            company:
              item.companyName ||
              item.company ||
              item.job?.companyName ||
              "Company",
            location: item.location || item.job?.location || "",
            source: "JobFinder",
            status: item.status || "Applied",
            appliedDate:
              item.appliedDate || item.applicationDate || item.createdAt || "",
            followUpDate: "",
            applicationUrl: item.applicationUrl || "",
            notes: item.notes || "",
            origin: "platform"
          }))
        );
      })
      .catch(() => {
        setError(
          "JobFinder applications could not be loaded. Your external tracker remains available."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(externalApplications)
    );
  }, [externalApplications]);

  const allApplications = useMemo(
    () => [
      ...platformApplications,
      ...externalApplications.map((item) => ({
        ...item,
        origin: "external"
      }))
    ],
    [platformApplications, externalApplications]
  );

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allApplications.filter((item) => {
      const matchesSearch =
        !query ||
        String(item.title || "").toLowerCase().includes(query) ||
        String(item.company || "").toLowerCase().includes(query) ||
        String(item.location || "").toLowerCase().includes(query);

      const matchesStatus =
        !statusFilter ||
        String(item.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      const matchesSource =
        !sourceFilter ||
        (sourceFilter === "JobFinder"
          ? item.origin === "platform"
          : item.origin === "external");

      return matchesSearch && matchesStatus && matchesSource;
    });
  }, [allApplications, search, statusFilter, sourceFilter]);

  function openAddDialog() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setDialogOpen(true);
  }

  function openEditDialog(item) {
    setEditingId(item.id);
    setForm({
      title: item.title || "",
      company: item.company || "",
      location: item.location || "",
      source: item.source || "Company website",
      applicationUrl: item.applicationUrl || "",
      appliedDate: item.appliedDate || "",
      followUpDate: item.followUpDate || "",
      status: item.status || "Applied",
      notes: item.notes || ""
    });
    setDialogOpen(true);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleSave(event) {
    event.preventDefault();

    const record = {
      ...form,
      id: editingId || `external-${Date.now()}`,
      origin: "external"
    };

    if (editingId) {
      setExternalApplications((current) =>
        current.map((item) =>
          item.id === editingId ? record : item
        )
      );
    } else {
      setExternalApplications((current) => [record, ...current]);
    }

    setDialogOpen(false);
  }

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Remove this external application from your tracker?"
    );

    if (confirmed) {
      setExternalApplications((current) =>
        current.filter((item) => item.id !== id)
      );
    }
  }

  function handleStatusChange(id, status) {
    setExternalApplications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  return (
    <Box>
      <PageHeader
        eyebrow="Your job search"
        title="My applications"
        description="Keep track of every opportunity, including applications made outside JobFinder."
        action={
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={openAddDialog}
          >
            Add external application
          </Button>
        }
      />

      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["All applications", allApplications.length],
          [
            "In progress",
            allApplications.filter((item) =>
              ["applied", "assessment", "interview"].includes(
                String(item.status).toLowerCase()
              )
            ).length
          ],
          [
            "Offers",
            allApplications.filter(
              (item) => String(item.status).toLowerCase() === "offer"
            ).length
          ]
        ].map(([label, value]) => (
          <Grid item xs={12} sm={4} key={label}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography sx={{ color: "#6E6672", fontSize: "0.82rem" }}>
                  {label}
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    fontWeight: 700,
                    fontSize: "1.8rem",
                    letterSpacing: "-0.05em"
                  }}
                >
                  {value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
          <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by job or company"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Grid>

            <Grid item xs={6} md={2.5}>
              <TextField
                fullWidth
                size="small"
                select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="">All statuses</MenuItem>
                {statuses.map((status) => (
                  <MenuItem value={status} key={status}>
                    {status}
                  </MenuItem>
                ))}
                <MenuItem value="PENDING">Pending</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={6} md={2}>
              <TextField
                fullWidth
                size="small"
                select
                label="Source"
                value={sourceFilter}
                onChange={(event) => setSourceFilter(event.target.value)}
              >
                <MenuItem value="">All sources</MenuItem>
                <MenuItem value="JobFinder">JobFinder</MenuItem>
                <MenuItem value="External">External</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} md={2.5}>
              <Button
                fullWidth
                variant="outlined"
                color="inherit"
                startIcon={<DownloadOutlinedIcon />}
                onClick={() => exportCSV(filteredApplications)}
                disabled={filteredApplications.length === 0}
                sx={{ height: 40 }}
              >
                Export filtered
              </Button>
            </Grid>
          </Grid>

          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Applied</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Follow-up</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredApplications.map((item) => {
                  const editable = item.origin === "external";
                  const statusStyle = getStatusColor(item.status);

                  return (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ minWidth: 190 }}>
                        <Typography
                          sx={{ fontWeight: 700, fontSize: "0.84rem" }}
                        >
                          {item.title}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.4,
                            color: "#6E6672",
                            fontSize: "0.76rem"
                          }}
                        >
                          {item.company}
                        </Typography>
                        {item.location && (
                          <Typography
                            sx={{
                              color: "#8B8492",
                              fontSize: "0.73rem"
                            }}
                          >
                            {item.location}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={editable ? "External" : "JobFinder"}
                        />
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.appliedDate || "—"}
                      </TableCell>

                      <TableCell sx={{ minWidth: 140 }}>
                        {editable ? (
                          <TextField
                            select
                            size="small"
                            variant="standard"
                            value={item.status}
                            onChange={(event) =>
                              handleStatusChange(item.id, event.target.value)
                            }
                            SelectProps={{ disableUnderline: true }}
                            sx={{
                              minWidth: 110,
                              "& .MuiSelect-select": {
                                px: 1,
                                py: 0.6,
                                borderRadius: 1,
                                background: statusStyle.background,
                                color: statusStyle.color,
                                fontSize: "0.76rem",
                                fontWeight: 700
                              }
                            }}
                          >
                            {statuses.map((status) => (
                              <MenuItem key={status} value={status}>
                                {status}
                              </MenuItem>
                            ))}
                          </TextField>
                        ) : (
                          <Chip
                            size="small"
                            label={String(item.status || "Applied").replaceAll(
                              "_",
                              " "
                            )}
                            sx={{
                              color: statusStyle.color,
                              bgcolor: statusStyle.background
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {item.followUpDate || "—"}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0}
                          justifyContent="flex-end"
                        >
                          {item.applicationUrl && (
                            <Button
                              size="small"
                              component="a"
                              href={item.applicationUrl}
                              target="_blank"
                              rel="noreferrer"
                              aria-label="Open application link"
                              sx={{ minWidth: 34, px: 0.5 }}
                            >
                              <OpenInNewRoundedIcon fontSize="small" />
                            </Button>
                          )}

                          {editable && (
                            <>
                              <Button
                                size="small"
                                aria-label="Edit application"
                                onClick={() => openEditDialog(item)}
                                sx={{ minWidth: 34, px: 0.5 }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                aria-label="Delete application"
                                onClick={() => handleDelete(item.id)}
                                sx={{ minWidth: 34, px: 0.5 }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {!loading && filteredApplications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Box sx={{ py: 5, textAlign: "center" }}>
                        <Typography sx={{ fontWeight: 700 }}>
                          Nothing to show yet
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.8,
                            fontSize: "0.83rem",
                            color: "#6E6672"
                          }}
                        >
                          Add an external application or apply for a job to
                          start building your tracker.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography
            sx={{ mt: 2, color: "#8B8492", fontSize: "0.75rem" }}
          >
            {filteredApplications.length} of {allApplications.length} applications
          </Typography>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingId ? "Edit external application" : "Add external application"}
          </DialogTitle>

          <DialogContent dividers>
            <Typography
              sx={{ mb: 2.5, color: "#6E6672", fontSize: "0.83rem" }}
            >
              Keep a private record of applications submitted through other
              job portals or company websites.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Job title"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Company"
                  value={form.company}
                  onChange={(e) => updateField("company", e.target.value)}
                  required
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Application source"
                  value={form.source}
                  onChange={(e) => updateField("source", e.target.value)}
                  fullWidth
                >
                  <MenuItem value="Company website">Company website</MenuItem>
                  <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                  <MenuItem value="Job portal">Other job portal</MenuItem>
                  <MenuItem value="Referral">Referral</MenuItem>
                  <MenuItem value="Recruiter">Recruiter</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Original job link"
                  type="url"
                  placeholder="https://..."
                  value={form.applicationUrl}
                  onChange={(e) =>
                    updateField("applicationUrl", e.target.value)
                  }
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date applied"
                  type="date"
                  value={form.appliedDate}
                  onChange={(e) => updateField("appliedDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Follow-up date"
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) =>
                    updateField("followUpDate", e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  select
                  label="Current status"
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  fullWidth
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  placeholder="Interview details, contact person, or anything to remember"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              color="inherit"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              {editingId ? "Save changes" : "Add application"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

export default MyApplicationsPage;