package jobtrack.backend.applications;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
	List<JobApplication> findByCandidate_IdOrderByCreatedAtDesc(Long candidateId);
	List<JobApplication> findByJob_Id(Long jobId);
	boolean existsByCandidate_IdAndJob_Id(Long candidateId, Long jobId);
}
