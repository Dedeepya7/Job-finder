package jobtrack.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import jobtrack.backend.entity.JobApplication;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
}
