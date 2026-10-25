package jobtrack.backend.jobs;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.applications.JobApplication;
import jobtrack.backend.applications.JobApplicationRepository;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRepository;
import jobtrack.backend.users.UserRole;

@Service
@Transactional
public class JobService {
	private final JobRepository jobRepository;
	private final JobApplicationRepository applicationRepository;
	private final UserRepository userRepository;

	public JobService(JobRepository jobRepository, JobApplicationRepository applicationRepository,
			UserRepository userRepository) {
		this.jobRepository = jobRepository;
		this.applicationRepository = applicationRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public List<Job> findAll(Long recruiterId) {
		return recruiterId == null ? jobRepository.findAll() : jobRepository.findByRecruiter_Id(recruiterId);
	}

	@Transactional(readOnly = true)
	public Job findById(Long id) {
		return jobRepository.findById(id).orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND, "Job " + id + " was not found"));
	}

	public Job create(Long recruiterId, Job job) {
		job.setId(null);
		job.setRecruiter(findRecruiter(recruiterId));
		return jobRepository.save(job);
	}

	public Job update(Long id, Long recruiterId, Job changes) {
		Job existing = findOwnedJob(id, recruiterId);
		existing.setTitle(changes.getTitle());
		existing.setCompanyName(changes.getCompanyName());
		existing.setDescription(changes.getDescription());
		existing.setLocation(changes.getLocation());
		existing.setJobUrl(changes.getJobUrl());
		return jobRepository.save(existing);
	}

	public void delete(Long id, Long recruiterId) {
		jobRepository.delete(findOwnedJob(id, recruiterId));
	}

	@Transactional(readOnly = true)
	public List<JobApplication> findApplicants(Long jobId, Long recruiterId) {
		findOwnedJob(jobId, recruiterId);
		return applicationRepository.findByJob_Id(jobId);
	}

	private Job findOwnedJob(Long id, Long recruiterId) {
		Job job = findById(id);
		findRecruiter(recruiterId);
		if (!job.getRecruiter().getId().equals(recruiterId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Recruiters can only manage their own jobs");
		}
		return job;
	}

	private User findRecruiter(Long recruiterId) {
		User recruiter = userRepository.findById(recruiterId).orElseThrow(() -> new ResponseStatusException(
				HttpStatus.NOT_FOUND, "Recruiter " + recruiterId + " was not found"));
		if (recruiter.getRole() != UserRole.RECRUITER) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The selected user is not a recruiter");
		}
		return recruiter;
	}
}
