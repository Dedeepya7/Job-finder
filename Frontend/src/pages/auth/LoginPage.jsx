import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import { Link, useNavigate } from "react-router-dom";

import { loginUser, saveSession } from "../../services/authService.js";

function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("candidate");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
          gap: { md: 4, lg: 5 },
          p: { md: 5, lg: 8 },
          position: "relative",
          overflow: "hidden",
          color: "#FFFFFF",
          background:
            "radial-gradient(circle at 15% 15%, rgba(166,76,110,0.42), transparent 34%), linear-gradient(145deg, #211B25 0%, #382637 52%, #592B48 100%)"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.6 }}>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.12)",
              color: "#fff",
              width: 52,
              height: 52,
              borderRadius: "13px",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.16)"
            }}
          >
            <WorkOutlineRoundedIcon sx={{ fontSize: 30 }} />
          </Box>

          <Typography sx={{ fontWeight: 800, fontSize: "2.6rem", letterSpacing: "-0.04em" }}>
            job
            <Box component="span" sx={{ color: "#E8AFC7" }}>finder</Box>
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 680 }}>
          <Typography
            sx={{
              color: "#E8AFC7",
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
              fontSize: { md: "3.8rem", lg: "5rem" },
              lineHeight: 1.04,
              letterSpacing: "-0.02em",
              fontWeight: 600,
              maxWidth: 620,
              color: "#FFFFFF"
            }}
          >
            Good work starts with the right opportunity.
          </Typography>

          <Typography
            sx={{
              mt: 3,
              color: "rgba(255,255,255,0.72)",
              fontSize: "1.05rem",
              lineHeight: 1.8,
              maxWidth: 480
            }}
          >
            Discover roles that fit your goals, keep your applications
            organised, and make your next move with confidence.
          </Typography>
        </Box>

        <Box
          sx={{
            maxWidth: 510,
            p: 2.5,
            borderRadius: 3,
            border: "1px solid rgba(255,255,255,0.15)",
            bgcolor: "rgba(255,255,255,0.07)",
            backdropFilter: "blur(10px)"
          }}
        >
          <Typography sx={{ fontSize: "0.88rem", lineHeight: 1.7, color: "rgba(255,255,255,0.86)" }}>
            “The right opportunity can change everything. Keep your search
            focused and your next step within reach.”
          </Typography>
          <Typography sx={{ mt: 1.5, fontSize: "0.72rem", color: "#E8AFC7", fontWeight: 700 }}>
            YOUR CAREER, YOUR NEXT CHAPTER
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.62)" }}>
          <LockOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography sx={{ fontSize: "0.75rem" }}>A secure space for your job search</Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          p: { xs: 2, sm: 4 }
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Box sx={{ display: { md: "none" }, mb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.1 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "11px", bgcolor: "#2B2530", color: "#fff", display: "grid", placeItems: "center" }}>
                <WorkOutlineRoundedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography sx={{ fontSize: "1.65rem", fontWeight: 800, letterSpacing: "-0.04em" }}>
                job<Box component="span" sx={{ color: "#A64C6E" }}>finder</Box>
              </Typography>
            </Box>
          </Box>

          <Typography sx={{ mb: 1, color: "#A64C6E", fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            Welcome to JobFinder
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Fraunces", "Manrope", serif',
              fontSize: { xs: "2.65rem", sm: "3.1rem" },
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

          <Typography sx={{ mt: 1, mb: 3.5, color: "#6E6672", lineHeight: 1.65 }}>
            Sign in to pick up where you left off and move your career forward.
          </Typography>

          <Card sx={{ bgcolor: "#FFFFFF", border: "1px solid #E9E4EA", borderRadius: 3, boxShadow: "0 20px 55px rgba(43, 37, 48, 0.09)" }}>
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((visible) => !visible)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOffRoundedIcon /> : <VisibilityRoundedIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
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
                  sx={{ mt: 0.5, py: 1.5, borderRadius: 2, fontWeight: 700, textTransform: "none", fontSize: "1rem" }}
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