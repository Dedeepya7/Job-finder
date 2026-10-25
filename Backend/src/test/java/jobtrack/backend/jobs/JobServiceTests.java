package jobtrack.backend.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.applications.JobApplicationRepository;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRepository;
import jobtrack.backend.users.UserRole;

@ExtendWith(MockitoExtension.class)
class JobServiceTests {
	@Mock private JobRepository jobRepository;
	@Mock private JobApplicationRepository applicationRepository;
	@Mock private UserRepository userRepository;
	@InjectMocks private JobService service;

	@Test
	void createAssignsTheRecruiterToTheJob() {
		User recruiter = recruiter(1L);
		Job job = new Job();
		when(userRepository.findById(1L)).thenReturn(Optional.of(recruiter));
		when(jobRepository.save(job)).thenReturn(job);
		Job result = service.create(1L, job);
		assertSame(job, result);
		assertSame(recruiter, result.getRecruiter());
		verify(jobRepository).save(job);
	}

	@Test
	void updateRejectsAJobOwnedByAnotherRecruiter() {
		Job existing = new Job();
		existing.setId(10L);
		existing.setRecruiter(recruiter(1L));
		when(jobRepository.findById(10L)).thenReturn(Optional.of(existing));
		when(userRepository.findById(2L)).thenReturn(Optional.of(recruiter(2L)));
		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.update(10L, 2L, new Job()));
		assertEquals(403, exception.getStatusCode().value());
	}

	private User recruiter(Long id) {
		User recruiter = new User();
		recruiter.setId(id);
		recruiter.setRole(UserRole.RECRUITER);
		return recruiter;
	}
}
