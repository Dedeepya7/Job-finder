package jobtrack.backend.jobs;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import jakarta.validation.Valid;
import jobtrack.backend.applications.JobApplication;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/jobs")
@Validated
public class JobController {
	private final JobService service;

	public JobController(JobService service) { this.service = service; }

	@PostMapping
	public ResponseEntity<Job> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Job job) {
		Job created = service.create(Long.valueOf(jwt.getSubject()), job);
		URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
				.buildAndExpand(created.getId()).toUri();
		return ResponseEntity.created(location).body(created);
	}

	@GetMapping
	public List<Job> findAll(@RequestParam(required = false) Long recruiterId) {
		return service.findAll(recruiterId);
	}

	@GetMapping("/{id}")
	public Job findById(@PathVariable Long id) { return service.findById(id); }

	@PutMapping("/{id}")
	public Job update(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt, @Valid @RequestBody Job job) {
		return service.update(id, Long.valueOf(jwt.getSubject()), job);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
		service.delete(id, Long.valueOf(jwt.getSubject()));
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/{id}/applications")
	public List<JobApplication> findApplicants(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
		return service.findApplicants(id, Long.valueOf(jwt.getSubject()));
	}
}
