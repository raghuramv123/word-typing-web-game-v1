package com.wordfall.web;

import com.wordfall.dto.Dtos.AuthResponse;
import com.wordfall.dto.Dtos.LoginRequest;
import com.wordfall.dto.Dtos.RegisterRequest;
import com.wordfall.entity.User;
import com.wordfall.repository.UserRepository;
import com.wordfall.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    /** Public registration always creates a PLAYER. Admins are created only by the server (see DataSeeder). */
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        String name = req.username().trim();
        if (users.existsByUsernameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        User u = new User();
        u.setUsername(name);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole("PLAYER");
        users.save(u);
        return new AuthResponse(jwt.generate(u.getUsername(), u.getRole()), u.getUsername(), u.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User u = users.findByUsernameIgnoreCase(req.username().trim())
                .filter(found -> encoder.matches(req.password(), found.getPasswordHash()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password"));
        return new AuthResponse(jwt.generate(u.getUsername(), u.getRole()), u.getUsername(), u.getRole());
    }
}
