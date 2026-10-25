package jobtrack.backend.authentication.service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import jobtrack.backend.authentication.dto.AuthResponse;
import jobtrack.backend.authentication.dto.LoginRequest;
import jobtrack.backend.authentication.dto.RegisterRequest;
import jobtrack.backend.authentication.dto.UserResponse;
import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRepository;

@Service
public class AuthService {
	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtEncoder jwtEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtEncoder = jwtEncoder;
	}

	@Transactional
	public UserResponse register(RegisterRequest request) {
		String email = normalizeEmail(request.email());
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
		}
		if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Password must be no more than 72 UTF-8 bytes for BCrypt");
		}
		User user = new User();
		user.setName(request.name().trim());
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setRole(request.role());
		return UserResponse.from(userRepository.save(user));
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		User user = userRepository.findByEmailIgnoreCase(normalizeEmail(request.email()))
				.filter(found -> passwordEncoder.matches(request.password(), found.getPasswordHash()))
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
						"Invalid email or password"));
		Instant issuedAt = Instant.now();
		JwtClaimsSet claims = JwtClaimsSet.builder()
				.issuer("jobtrack")
				.issuedAt(issuedAt)
				.expiresAt(issuedAt.plus(1, ChronoUnit.HOURS))
				.subject(user.getId().toString())
				.claim("role", user.getRole().name())
				.claim("email", user.getEmail())
				.build();
		JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).type("JWT").build();
		String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
		return new AuthResponse(token, "Bearer", UserResponse.from(user));
	}

	private String normalizeEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }
}
