package jobtrack.backend.applications;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/applications")
@Validated
public class JobApplicationController {
	private final JobApplicationService service;

	public JobApplicationController(JobApplicationService service) { this.service = service; }

	@PostMapping
	public ResponseEntity<JobApplication> create(@AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody JobApplication application) {
		JobApplication created = service.create(Long.valueOf(jwt.getSubject()), application);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
				.buildAndExpand(created.getId()).toUri();
		return ResponseEntity.created(location).body(created);
	}

	@GetMapping
	public List<JobApplication> findAll(@AuthenticationPrincipal Jwt jwt) {
		return service.findAll(Long.valueOf(jwt.getSubject()));
	}

	@GetMapping("/{id}")
	public JobApplication findById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
		return service.findByIdForCandidate(id, Long.valueOf(jwt.getSubject()));
	}

	@PutMapping("/{id}")
	public JobApplication update(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt,
			@Valid @RequestBody JobApplication application) {
		return service.update(id, Long.valueOf(jwt.getSubject()), application);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
		service.delete(id, Long.valueOf(jwt.getSubject()));
		return ResponseEntity.noContent().build();
	}
}
