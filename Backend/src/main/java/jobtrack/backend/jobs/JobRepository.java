package jobtrack.backend.jobs;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
	List<Job> findByRecruiter_Id(Long recruiterId);
}
