package jobtrack.backend.authentication.dto;

public record AuthResponse(String accessToken, String tokenType, UserResponse user) {
}
