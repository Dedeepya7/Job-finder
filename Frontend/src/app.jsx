import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";

import CandidateDashboard from "./pages/candidate/CandidateDashboard.jsx";
import JobSearchPage from "./pages/candidate/JobSearchPage.jsx";
import MyApplicationsPage from "./pages/candidate/MyApplicationsPage.jsx";

import CompanyDashboard from "./pages/company/CompanyDashboard.jsx";
import ManageJobsPage from "./pages/company/ManageJobsPage.jsx";
import ApplicantsPage from "./pages/company/ApplicantsPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AppLayout />}>
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />
        <Route
          path="/candidate/jobs"
          element={<JobSearchPage />}
        />
        <Route
          path="/candidate/applications"
          element={<MyApplicationsPage />}
        />

        <Route
          path="/company/dashboard"
          element={<CompanyDashboard />}
        />
        <Route
          path="/company/jobs"
          element={<ManageJobsPage />}
        />
        <Route
          path="/company/applicants"
          element={<ApplicantsPage />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;