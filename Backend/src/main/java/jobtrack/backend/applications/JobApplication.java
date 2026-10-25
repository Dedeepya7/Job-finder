package jobtrack.backend.applications;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jobtrack.backend.jobs.Job;
import jobtrack.backend.users.User;

@Entity
@Table(name = "job_applications")
public class JobApplication {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@NotBlank(message = "Company name is required")
	@Size(max = 150, message = "Company name cannot exceed 150 characters")
	@Column(nullable = false)
	private String companyName;
	@NotBlank(message = "Job title is required")
	@Size(max = 150, message = "Job title cannot exceed 150 characters")
	@Column(nullable = false)
	private String jobTitle;
	@Size(max = 150, message = "Location cannot exceed 150 characters")
	private String location;
	@Size(max = 2048, message = "Job URL cannot exceed 2048 characters")
	private String jobUrl;
	@NotNull(message = "Application date is required")
	@Column(nullable = false)
	private LocalDate applicationDate;
	@NotNull(message = "Application status is required")
	@Enumerated(EnumType.STRING)
	@Column(nullable = false)
	private ApplicationStatus status = ApplicationStatus.APPLIED;
	@ManyToOne(optional = false)
	@JoinColumn(name = "candidate_id", nullable = false)
	private User candidate;
	@NotNull(message = "Job is required")
	@ManyToOne(optional = false)
	@JoinColumn(name = "job_id", nullable = false)
	private Job job;
	@Column(columnDefinition = "TEXT")
	private String notes;
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;
	@Column(nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	void onCreate() {
		LocalDateTime now = LocalDateTime.now();
		createdAt = now;
		updatedAt = now;
	}
	@PreUpdate
	void onUpdate() { updatedAt = LocalDateTime.now(); }

	public Long getId() { return id; }
	public void setId(Long id) { this.id = id; }
	public String getCompanyName() { return companyName; }
	public void setCompanyName(String companyName) { this.companyName = companyName; }
	public String getJobTitle() { return jobTitle; }
	public void setJobTitle(String jobTitle) { this.jobTitle = jobTitle; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public String getJobUrl() { return jobUrl; }
	public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
	public LocalDate getApplicationDate() { return applicationDate; }
	public void setApplicationDate(LocalDate applicationDate) { this.applicationDate = applicationDate; }
	public ApplicationStatus getStatus() { return status; }
	public void setStatus(ApplicationStatus status) { this.status = status; }
	public User getCandidate() { return candidate; }
	public void setCandidate(User candidate) { this.candidate = candidate; }
	public Job getJob() { return job; }
	public void setJob(Job job) { this.job = job; }
	public String getNotes() { return notes; }
	public void setNotes(String notes) { this.notes = notes; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
}
