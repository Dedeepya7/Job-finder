package jobtrack.backend.applications;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.jobs.Job;
import jobtrack.backend.jobs.JobRepository;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRepository;
import jobtrack.backend.users.UserRole;

@Service
@Transactional
public class JobApplicationService {
	private final JobApplicationRepository repository;
	private final UserRepository userRepository;
	private final JobRepository jobRepository;

	public JobApplicationService(JobApplicationRepository repository, UserRepository userRepository,
			JobRepository jobRepository) {
		this.repository = repository;
		this.userRepository = userRepository;
		this.jobRepository = jobRepository;
	}

	@Transactional(readOnly = true)
	public List<JobApplication> findAll(Long candidateId) {
		return repository.findByCandidate_IdOrderByCreatedAtDesc(candidateId);
	}

	@Transactional(readOnly = true)
	public JobApplication findById(Long id) {
		return repository.findById(id).orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND, "Job application " + id + " was not found"));
	}

	@Transactional(readOnly = true)
	public JobApplication findByIdForCandidate(Long id, Long candidateId) {
		JobApplication application = findById(id);
		if (!application.getCandidate().getId().equals(candidateId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Job application " + id + " was not found");
		}
		return application;
	}

	public JobApplication create(Long candidateId, JobApplication application) {
		application.setId(null);
		application.setCandidate(findCandidate(candidateId));
		application.setJob(findJob(application.getJob().getId()));
		return repository.save(application);
	}

	public JobApplication update(Long id, Long candidateId, JobApplication changes) {
		JobApplication existing = findByIdForCandidate(id, candidateId);
		existing.setCompanyName(changes.getCompanyName());
		existing.setJobTitle(changes.getJobTitle());
		existing.setLocation(changes.getLocation());
		existing.setJobUrl(changes.getJobUrl());
		existing.setApplicationDate(changes.getApplicationDate());
		existing.setStatus(changes.getStatus());
		existing.setNotes(changes.getNotes());
		return repository.save(existing);
	}

	public void delete(Long id, Long candidateId) {
		repository.delete(findByIdForCandidate(id, candidateId));
	}

	private User findCandidate(Long id) {
		User candidate = userRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND, "Candidate " + id + " was not found"));
		if (candidate.getRole() != UserRole.CANDIDATE) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected user is not a candidate");
		}
		return candidate;
	}

	private Job findJob(Long id) {
		return jobRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND, "Job " + id + " was not found"));
	}
}
