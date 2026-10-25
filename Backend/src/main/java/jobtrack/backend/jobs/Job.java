package jobtrack.backend.jobs;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
import jobtrack.backend.users.User;

@Entity
@Table(name = "jobs")
public class Job {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	@NotBlank @Size(max = 150) @Column(nullable = false)
	private String title;
	@NotBlank @Size(max = 150) @Column(nullable = false)
	private String companyName;
	@Column(columnDefinition = "TEXT")
	private String description;
	@Size(max = 150)
	private String location;
	@Size(max = 2048)
	private String jobUrl;
	@NotNull @ManyToOne(optional = false) @JoinColumn(name = "recruiter_id", nullable = false)
	private User recruiter;
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
	public String getTitle() { return title; }
	public void setTitle(String title) { this.title = title; }
	public String getCompanyName() { return companyName; }
	public void setCompanyName(String companyName) { this.companyName = companyName; }
	public String getDescription() { return description; }
	public void setDescription(String description) { this.description = description; }
	public String getLocation() { return location; }
	public void setLocation(String location) { this.location = location; }
	public String getJobUrl() { return jobUrl; }
	public void setJobUrl(String jobUrl) { this.jobUrl = jobUrl; }
	public User getRecruiter() { return recruiter; }
	public void setRecruiter(User recruiter) { this.recruiter = recruiter; }
	public LocalDateTime getCreatedAt() { return createdAt; }
	public LocalDateTime getUpdatedAt() { return updatedAt; }
}
