package jobtrack.backend.authentication.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import jobtrack.backend.authentication.dto.AuthResponse;
import jobtrack.backend.authentication.dto.LoginRequest;
import jobtrack.backend.authentication.dto.RegisterRequest;
import jobtrack.backend.authentication.dto.UserResponse;
import jobtrack.backend.authentication.service.AuthService;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/auth")
@Validated
public class AuthController {
	private final AuthService authService;

	public AuthController(AuthService authService) { this.authService = authService; }

	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}
}
