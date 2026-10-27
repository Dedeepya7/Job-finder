import api from "./api.js";

export async function getMyApplications() {
  const response = await api.get("/api/applications");
  return response.data;
}


export async function getApplicationById(id) {
  const response = await api.get(`/api/applications/${id}`);
  return response.data;
}


export async function applyForJob(applicationData) {
  const response = await api.post("/api/applications", applicationData);
  return response.data;
}


export async function updateApplication(id, applicationData) {
  const response = await api.put(
    `/api/applications/${id}`,
    applicationData
  );

  return response.data;
}

export async function deleteApplication(id) {
  const response = await api.delete(`/api/applications/${id}`);
  return response.data;
}

// Recruiter-side: move an applicant through the hiring pipeline.
// Job-scoped so the backend permits the RECRUITER role and verifies ownership.
export async function updateApplicationStatus(jobId, applicationId, status) {
  const response = await api.patch(
    `/api/jobs/${jobId}/applications/${applicationId}/status`,
    { status }
  );
  return response.data;
}