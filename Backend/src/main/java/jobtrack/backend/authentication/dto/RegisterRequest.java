package jobtrack.backend.authentication.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jobtrack.backend.users.UserRole;

public record RegisterRequest(
		@NotBlank @Size(max = 150) String name,
		@NotBlank @Email @Size(max = 254) String email,
		@NotBlank
		@Size(min = 8, max = 72)
		@Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,72}$",
				message = "Password must include an uppercase letter, a lowercase letter, a number, and a special character, with no spaces")
		String password,
		@NotNull UserRole role) {
}
