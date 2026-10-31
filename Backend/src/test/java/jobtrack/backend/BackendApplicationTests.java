package jobtrack.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
		"app.jwt.secret=test-signing-secret-that-is-at-least-32-bytes",
		"spring.datasource.url=jdbc:h2:mem:jobtrack-test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.datasource.username=sa",
		"spring.datasource.password=",
		"spring.jpa.hibernate.ddl-auto=create-drop"
})
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
