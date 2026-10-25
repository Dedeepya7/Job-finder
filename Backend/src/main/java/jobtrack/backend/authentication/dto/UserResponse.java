package jobtrack.backend.authentication.dto;

import java.time.LocalDateTime;

import jobtrack.backend.users.User;
import jobtrack.backend.users.UserRole;

public record UserResponse(Long id, String name, String email, UserRole role, LocalDateTime createdAt) {
	public static UserResponse from(User user) {
		return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getCreatedAt());
	}
}
