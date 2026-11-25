package com.wordfall.web;

import com.wordfall.dto.Dtos.ScoreDto;
import com.wordfall.dto.Dtos.ScoreRequest;
import com.wordfall.entity.Score;
import com.wordfall.entity.User;
import com.wordfall.repository.RootRepository;
import com.wordfall.repository.ScoreRepository;
import com.wordfall.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    private final ScoreRepository scores;
    private final UserRepository users;
    private final RootRepository roots;

    public ScoreController(ScoreRepository scores, UserRepository users, RootRepository roots) {
        this.scores = scores;
        this.users = users;
        this.roots = roots;
    }

    @PostMapping
    public ScoreDto save(Authentication auth, @Valid @RequestBody ScoreRequest req) {
        if (!req.game().equals("FALL") && !req.game().equals("MEANING")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "game must be FALL or MEANING");
        }
        User user = currentUser(auth);
        Score s = new Score();
        s.setUser(user);
        s.setGame(req.game());
        s.setScore(req.score());
        s.setCorrect(req.correct());
        s.setMissed(req.missed());
        if (req.rootId() != null) {
            roots.findById(req.rootId()).ifPresent(r -> s.setRootName(r.getName()));
        }
        return toDto(scores.save(s));
    }

    @GetMapping("/me")
    public List<ScoreDto> mine(Authentication auth) {
        return scores.findTop100ByUserOrderByCreatedAtDesc(currentUser(auth)).stream()
                .map(ScoreController::toDto).toList();
    }

    private User currentUser(Authentication auth) {
        return users.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unknown user"));
    }

    private static ScoreDto toDto(Score s) {
        return new ScoreDto(s.getId(), s.getGame(), s.getScore(), s.getCorrect(), s.getMissed(),
                s.getRootName(), s.getCreatedAt());
    }
}
