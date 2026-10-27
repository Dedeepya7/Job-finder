import api from "./api.js";

export async function getJobs() {
  const response = await api.get("/api/jobs");
  return response.data;
}

export async function getJobById(id) {
  const response = await api.get(`/api/jobs/${id}`);
  return response.data;
}

export async function createJob(jobData) {
  const response = await api.post("/api/jobs", jobData);
  return response.data;
}

export async function updateJob(id, jobData) {
  const response = await api.put(`/api/jobs/${id}`, jobData);
  return response.data;
}

export async function deleteJob(id) {
  const response = await api.delete(`/api/jobs/${id}`);
  return response.data;
}

export async function getJobApplications(jobId) {
  const response = await api.get(`/api/jobs/${jobId}/applications`);
  return response.data;
}