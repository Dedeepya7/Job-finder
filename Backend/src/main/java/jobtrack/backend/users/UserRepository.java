package jobtrack.backend.users;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
	boolean existsByEmailIgnoreCase(String email);
	Optional<User> findByEmailIgnoreCase(String email);
}
