package jobtrack.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.entity.JobApplication;
import jobtrack.backend.repository.JobApplicationRepository;

@Service
@Transactional
public class JobApplicationService {

	private final JobApplicationRepository repository;

	public JobApplicationService(JobApplicationRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<JobApplication> findAll() {
		return repository.findAll();
	}

	@Transactional(readOnly = true)
	public JobApplication findById(Long id) {
		return repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
						"Job application " + id + " was not found"));
	}

	public JobApplication create(JobApplication application) {
		application.setId(null);
		return repository.save(application);
	}

	public JobApplication update(Long id, JobApplication updatedApplication) {
		JobApplication existing = findById(id);
		existing.setCompanyName(updatedApplication.getCompanyName());
		existing.setJobTitle(updatedApplication.getJobTitle());
		existing.setLocation(updatedApplication.getLocation());
		existing.setJobUrl(updatedApplication.getJobUrl());
		existing.setApplicationDate(updatedApplication.getApplicationDate());
		existing.setStatus(updatedApplication.getStatus());
		existing.setNotes(updatedApplication.getNotes());
		return repository.save(existing);
	}

	public void delete(Long id) {
		JobApplication existing = findById(id);
		repository.delete(existing);
	}
}
