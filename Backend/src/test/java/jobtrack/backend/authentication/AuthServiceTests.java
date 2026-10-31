package jobtrack.backend.authentication;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.authentication.dto.LoginRequest;
import jobtrack.backend.authentication.dto.RegisterRequest;
import jobtrack.backend.authentication.dto.UserResponse;
import jobtrack.backend.authentication.service.AuthService;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRole;
import jobtrack.backend.users.UserRepository;

@ExtendWith(MockitoExtension.class)
class AuthServiceTests {
	@Mock private UserRepository userRepository;
	@Mock private JwtEncoder jwtEncoder;
	private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
	private AuthService service;

	@BeforeEach
	void setUp() { service = new AuthService(userRepository, passwordEncoder, jwtEncoder); }

	@Test
	void registerNormalizesEmailHashesPasswordAndReturnsSafeResponse() {
		RegisterRequest request = new RegisterRequest("Candidate Name", "  Candidate@Example.com ",
				"Correct-horse-battery1!", UserRole.CANDIDATE);
		when(userRepository.existsByEmailIgnoreCase("candidate@example.com")).thenReturn(false);
		when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
			User user = invocation.getArgument(0);
			user.setId(8L);
			return user;
		});
		UserResponse result = service.register(request);
		ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
		verify(userRepository).save(userCaptor.capture());
		User saved = userCaptor.getValue();
		assertEquals("candidate@example.com", saved.getEmail());
		assertNotEquals("Correct-horse-battery1!", saved.getPasswordHash());
		assertTrue(passwordEncoder.matches("Correct-horse-battery1!", saved.getPasswordHash()));
		assertEquals(UserRole.CANDIDATE, result.role());
		assertEquals("candidate@example.com", result.email());
	}

	@Test
	void registerRejectsAnAlreadyUsedEmail() {
		when(userRepository.existsByEmailIgnoreCase("candidate@example.com")).thenReturn(true);
		RegisterRequest request = new RegisterRequest("Candidate", "candidate@example.com",
				"Correct-horse-battery1!", UserRole.CANDIDATE);
		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.register(request));
		assertEquals(409, exception.getStatusCode().value());
	}

	@Test
	void loginReturnsSignedBearerTokenAfterPasswordMatches() {
		User user = new User();
		user.setId(8L);
		user.setName("Recruiter");
		user.setEmail("recruiter@example.com");
		user.setPasswordHash(passwordEncoder.encode("Correct-horse-battery1!"));
		user.setRole(UserRole.RECRUITER);
		when(userRepository.findByEmailIgnoreCase("recruiter@example.com")).thenReturn(Optional.of(user));
		when(jwtEncoder.encode(any(JwtEncoderParameters.class))).thenAnswer(invocation -> {
			Instant now = Instant.now();
			return Jwt.withTokenValue("signed-token").header("alg", "HS256")
					.issuedAt(now).expiresAt(now.plusSeconds(3600)).build();
		});
		var result = service.login(new LoginRequest("Recruiter@Example.com", "Correct-horse-battery1!"));
		assertEquals("signed-token", result.accessToken());
		assertEquals("Bearer", result.tokenType());
		assertEquals(UserRole.RECRUITER, result.user().role());
	}

	@Test
	void loginRejectsWrongPasswordWithGenericUnauthorizedError() {
		User user = new User();
		user.setPasswordHash(passwordEncoder.encode("Correct-horse-battery1!"));
		when(userRepository.findByEmailIgnoreCase("candidate@example.com")).thenReturn(Optional.of(user));
		ResponseStatusException exception = assertThrows(ResponseStatusException.class,
				() -> service.login(new LoginRequest("candidate@example.com", "wrong-password")));
		assertEquals(401, exception.getStatusCode().value());
	}
}
