package jobtrack.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "app.jwt.secret=test-signing-secret-that-is-at-least-32-bytes")
class BackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
