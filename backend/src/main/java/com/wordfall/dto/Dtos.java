package com.wordfall.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;

public final class Dtos {

    private Dtos() {}

    public record RegisterRequest(
            @NotBlank @Pattern(regexp = "^[A-Za-z0-9_]{3,30}$",
                    message = "must be 3-30 letters, digits or underscore") String username,
            @NotBlank @Size(min = 6, max = 100, message = "must be 6-100 characters") String password) {}

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    public record AuthResponse(String token, String username, String role) {}

    public record RootDto(Long id, String name, long wordCount) {}

    public record WordDto(Long id, String text, String meaning, Long rootId, String rootName) {}

    public record RootRequest(@NotBlank @Size(max = 60) String name) {}

    public record WordRequest(
            @NotBlank @Pattern(regexp = "^\\S{1,40}$", message = "must be a single word (no spaces)") String text,
            @NotBlank @Size(max = 300) String meaning,
            @NotNull Long rootId) {}

    public record BulkWordRequest(@NotNull Long rootId, @NotBlank String lines) {}

    public record ScoreRequest(
            @NotBlank String game,
            @Min(0) @Max(100000) int score,
            @Min(0) @Max(100000) int correct,
            @Min(0) @Max(100000) int missed,
            Long rootId) {}

    public record ScoreDto(Long id, String game, int score, int correct, int missed,
                           String rootName, Instant createdAt) {}
}
