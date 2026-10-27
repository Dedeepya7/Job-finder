import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { Link, useNavigate } from "react-router-dom";

import { loginUser, saveSession } from "../../services/authService.js";

function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser({ email, password });
      const actualRole = saveSession(result, role);

      if (actualRole !== role) {
        setError(
          `This account is registered as ${actualRole}. Please select the matching profile.`
        );
        return;
      }

      navigate(
        actualRole === "company"
          ? "/company/dashboard"
          : "/candidate/dashboard"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "We couldn't sign you in. Check your details and try again."
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
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "#F5F3F6"
      }}
    >
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          gap: { md: 5, lg: 7 },
          p: { md: 5, lg: 8 },
          borderRight: "1px solid #E4DFE6"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
          <Box
            sx={{
              bgcolor: "#2B2530",
              color: "#fff",
              width: 52,
              height: 52,
              borderRadius: "13px",
              display: "grid",
              placeItems: "center"
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 30 }} />
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: "2.6rem", letterSpacing: "-0.04em" }}>
            job
            <Box component="span" sx={{ color: "#A64C6E" }}>finder</Box>
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 680 }}>
          <Typography
            sx={{
              color: "#A64C6E",
              fontSize: "0.8rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              mb: 2
            }}
          >
            A more thoughtful job search
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontFamily: '"Fraunces", "Manrope", serif',
              fontSize: { md: "4.4rem", lg: "5.6rem" },
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              maxWidth: 680
            }}
          >
            Good work starts with the right opportunity.
          </Typography>

          <Typography
            sx={{
              mt: 3,
              color: "#6E6672",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              maxWidth: 480
            }}
          >
            Discover roles that fit your goals, keep your applications
            organised, and make your next move with confidence.
          </Typography>
        </Box>

        <Typography sx={{ fontSize: "0.75rem", color: "#8B8492" }}>
          Find your next step, at your own pace.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          p: { xs: 2, sm: 4 }
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 420 }}>
          <Box sx={{ display: { md: "none" }, mb: 5 }}>
            <Typography sx={{ fontSize: "2.6rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
              job
              <Box component="span" sx={{ color: "#A64C6E" }}>finder</Box>
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: '"Fraunces", "Manrope", serif',
              fontSize: "3.1rem",
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: "-0.02em"
            }}
          >
            Welcome{" "}
            <Box
              component="span"
              sx={{ fontStyle: "italic", color: "#A64C6E" }}
            >
              back
            </Box>
          </Typography>

          <Typography sx={{ mt: 1, mb: 3.5, color: "#6E6672" }}>
            Sign in to continue to your workspace.
          </Typography>

          <Card sx={{ bgcolor: "#FFFFFF" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: "grid", gap: 2.3 }}
              >
                <TextField
                  select
                  label="I am signing in as"
                  value={role}
                  onChange={(event) => setRole(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="candidate">Candidate</MenuItem>
                  <MenuItem value="company">Company / Recruiter</MenuItem>
                </TextField>

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
                  autoComplete="current-password"
                  required
                  fullWidth
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  endIcon={
                    loading ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <ArrowForwardRoundedIcon />
                    )
                  }
                  sx={{ mt: 0.5, py: 1.4 }}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Typography
            sx={{
              textAlign: "center",
              mt: 3,
              color: "#6E6672",
              fontSize: "0.85rem"
            }}
          >
            New to JobFinder?{" "}
            <Box
              component={Link}
              to="/register"
              sx={{ color: "#6E2A4E", fontWeight: 700 }}
            >
              Create an account
            </Box>
          </Typography>

          <Typography
            sx={{
              mt: 5,
              textAlign: "center",
              color: "#A29AA8",
              fontSize: "0.72rem"
            }}
          >
            By continuing, you agree to use JobFinder responsibly.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default LoginPage;