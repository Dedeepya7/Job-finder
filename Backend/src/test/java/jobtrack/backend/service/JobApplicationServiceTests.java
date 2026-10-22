package jobtrack.backend.service;

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

import jobtrack.backend.entity.ApplicationStatus;
import jobtrack.backend.entity.JobApplication;
import jobtrack.backend.repository.JobApplicationRepository;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTests {

	@Mock
	private JobApplicationRepository repository;

	@InjectMocks
	private JobApplicationService service;

	@Test
	void createClearsClientProvidedIdBeforeSaving() {
		JobApplication application = application();
		application.setId(77L);
		when(repository.save(application)).thenReturn(application);

		JobApplication result = service.create(application);

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

		JobApplication result = service.update(4L, changes);

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
		return application;
	}
}
