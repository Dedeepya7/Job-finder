import api from "./api.js";

export async function loginUser(credentials) {
  const response = await api.post("/api/auth/login", credentials);
  return response.data;
}

export async function registerUser(userData) {
  const response = await api.post("/api/auth/register", userData);
  return response.data;
}

export function saveSession(data, selectedRole) {
  const token = data.token || data.accessToken || data.jwt;

  if (!token) {
    throw new Error("The login response did not contain a JWT token.");
  }

  const user = data.user || data;

  const backendRole = String(
    user.role || data.role || selectedRole
  ).toUpperCase();

  const frontendRole =
    backendRole === "RECRUITER" || backendRole === "COMPANY"
      ? "company"
      : "candidate";

  localStorage.setItem("jobfinder_token", token);
  localStorage.setItem("jobfinder_role", frontendRole);
  localStorage.setItem(
    "jobfinder_user",
    JSON.stringify({
      id: user.id,
      name: user.name || user.fullName || user.username || "",
      email: user.email || "",
      role: backendRole
    })
  );

  return frontendRole;
}

export function logoutUser() {
  localStorage.removeItem("jobfinder_token");
  localStorage.removeItem("jobfinder_role");
  localStorage.removeItem("jobfinder_user");
}

