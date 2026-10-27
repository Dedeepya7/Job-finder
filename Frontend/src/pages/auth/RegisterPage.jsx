import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { Link, useNavigate } from "react-router-dom";

import {
  registerUser,
  saveSession
} from "../../services/authService.js";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("candidate");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const payload = {
      name,
      email,
      password,
      role: role === "company" ? "RECRUITER" : "CANDIDATE"
    };

    try {
      const result = await registerUser(payload);
      const token = result.token || result.accessToken || result.jwt;

      if (token) {
        const actualRole = saveSession(result, role);

        navigate(
          actualRole === "company"
            ? "/company/dashboard"
            : "/candidate/dashboard"
        );
      } else {
        navigate("/login", {
          state: { message: "Account created. Please sign in." }
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We couldn't create your account. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 5,
        background:
          "radial-gradient(1100px 520px at 50% -12%, #FFFFFF 0%, #F5F3F6 60%)"
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 480 }}>
        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2, mb: 4 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              bgcolor: "#2B2530",
              color: "#fff",
              display: "grid",
              placeItems: "center"
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: "1.55rem", letterSpacing: "-0.04em" }}
          >
            job
            <Box component="span" sx={{ color: "#A64C6E" }}>
              finder
            </Box>
          </Typography>
        </Box>

        {/* Eyebrow */}
        <Box
          component="span"
          sx={{
            display: "inline-block",
            px: 1.4,
            py: 0.5,
            mb: 2,
            borderRadius: "999px",
            bgcolor: "#EFDFEA",
            color: "#6E2A4E",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase"
          }}
        >
          Welcome aboard
        </Box>

        {/* Heading */}
        <Typography
          component="h1"
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", sm: "3.1rem" },
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.06em",
            color: "#2B2530"
          }}
        >
          Create your{" "}
          <Box component="span" sx={{ color: "#A64C6E" }}>
            account
          </Box>
        </Typography>

        <Typography
          sx={{
            mt: 1.5,
            mb: 4,
            color: "#6E6672",
            fontSize: "1.02rem",
            lineHeight: 1.6
          }}
        >
          Let’s get you set up — it only takes a minute, and your next
          opportunity could be just around the corner.
        </Typography>

        {/* Accent bar + Card */}
        <Box
          sx={{
            height: 8,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            background: "linear-gradient(90deg, #A64C6E 0%, #6E2A4E 100%)"
          }}
        />
        <Card
          sx={{
            mt: "-1px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            border: "1px solid #E4DFE6",
            borderTop: "none",
            boxShadow: "0 24px 60px rgba(43, 37, 48, 0.12)"
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "grid", gap: 2.4 }}
            >
              <TextField
                select
                label="I’m joining as"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                fullWidth
              >
                <MenuItem value="candidate">Candidate</MenuItem>
                <MenuItem value="company">Company / Recruiter</MenuItem>
              </TextField>

              <TextField
                label={role === "company" ? "Your name" : "Full name"}
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                required
                fullWidth
              />

              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                fullWidth
              />

              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                helperText="Pick something only you know — at least 8 characters."
                required
                inputProps={{ minLength: 8 }}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                endIcon={<ArrowForwardRoundedIcon />}
                fullWidth
                sx={{
                  mt: 0.8,
                  py: 1.6,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2.5
                }}
              >
                {loading ? "Creating your account…" : "Create my account"}
              </Button>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.7,
                  mt: 0.5,
                  color: "#8B8492",
                  fontSize: "0.78rem"
                }}
              >
                <LockRoundedIcon sx={{ fontSize: 15 }} />
                Your details stay private. No spam, ever.
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Typography
          sx={{
            mt: 3.5,
            textAlign: "center",
            color: "#6E6672",
            fontSize: "0.92rem"
          }}
        >
          Already have an account?{" "}
          <Box
            component={Link}
            to="/login"
            sx={{ color: "#6E2A4E", fontWeight: 700, textDecoration: "none" }}
          >
            Sign in
          </Box>
        </Typography>
      </Box>
    </Box>
  );
}

export default RegisterPage;