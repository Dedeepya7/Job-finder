package jobtrack.backend.applications;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.jobs.Job;
import jobtrack.backend.jobs.JobRepository;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRepository;
import jobtrack.backend.users.UserRole;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTests {
	@Mock private JobApplicationRepository repository;
	@Mock private UserRepository userRepository;
	@Mock private JobRepository jobRepository;
	@InjectMocks private JobApplicationService service;

	@Test
	void createClearsClientProvidedIdBeforeSaving() {
		JobApplication application = application();
		when(userRepository.findById(1L)).thenReturn(Optional.of(candidate()));
		when(jobRepository.findById(2L)).thenReturn(Optional.of(job()));
		application.setId(77L);
		when(repository.save(application)).thenReturn(application);
		JobApplication result = service.create(1L, application);
		assertSame(application, result);
		assertNull(result.getId());
		verify(repository).save(application);
	}

	@Test
	void updateCopiesEditableFieldsToExistingApplication() {
		JobApplication existing = application();
		existing.setId(4L);
		JobApplication changes = application();
		changes.setCompanyName("Updated company");
		changes.setJobTitle("Senior Engineer");
		changes.setStatus(ApplicationStatus.INTERVIEW);
		when(repository.findById(4L)).thenReturn(Optional.of(existing));
		when(repository.save(existing)).thenReturn(existing);
		JobApplication result = service.update(4L, 1L, changes);
		assertSame(existing, result);
		assertEquals("Updated company", result.getCompanyName());
		assertEquals("Senior Engineer", result.getJobTitle());
		assertEquals(ApplicationStatus.INTERVIEW, result.getStatus());
		verify(repository).save(existing);
	}

	@Test
	void findByIdReturnsNotFoundWhenApplicationDoesNotExist() {
		when(repository.findById(999L)).thenReturn(Optional.empty());
		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.findById(999L));
		assertEquals(404, exception.getStatusCode().value());
	}

	private JobApplication application() {
		JobApplication application = new JobApplication();
		application.setCompanyName("Example Inc.");
		application.setJobTitle("Software Engineer");
		application.setApplicationDate(LocalDate.of(2026, 10, 16));
		application.setStatus(ApplicationStatus.APPLIED);
		application.setCandidate(candidate());
		application.setJob(job());
		return application;
	}

	private User candidate() {
		User candidate = new User();
		candidate.setId(1L);
		candidate.setRole(UserRole.CANDIDATE);
		return candidate;
	}

	private Job job() {
		Job job = new Job();
		job.setId(2L);
		return job;
	}
}
