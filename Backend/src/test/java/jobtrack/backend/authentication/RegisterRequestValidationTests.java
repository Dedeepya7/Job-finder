package jobtrack.backend.authentication;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jobtrack.backend.authentication.dto.RegisterRequest;
import jobtrack.backend.users.UserRole;

class RegisterRequestValidationTests {
	private ValidatorFactory validatorFactory;
	private Validator validator;

	@BeforeEach
	void setUp() {
		validatorFactory = Validation.buildDefaultValidatorFactory();
		validator = validatorFactory.getValidator();
	}

	@Test
	void acceptsPasswordWithAllRequiredCharacterTypes() {
		RegisterRequest request = new RegisterRequest("Candidate", "candidate@example.com",
				"Strong-pass1!", UserRole.CANDIDATE);

		assertTrue(validator.validate(request).isEmpty());
		validatorFactory.close();
	}

	@Test
	void rejectsPasswordsMissingRequiredCharacterTypesOrContainingSpaces() {
		for (String password : Set.of(
				"lowercase1!",
				"UPPERCASE1!",
				"NoNumber!!",
				"NoSpecial1",
				"Has Space1!")) {
			RegisterRequest request = new RegisterRequest("Candidate", "candidate@example.com",
					password, UserRole.CANDIDATE);

			assertTrue(validator.validate(request).stream()
					.anyMatch(violation -> violation.getPropertyPath().toString().equals("password")),
					"Expected password validation to reject: " + password);
		}
		validatorFactory.close();
	}
}
