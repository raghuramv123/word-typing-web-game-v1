package com.wordfall.web;

import com.wordfall.dto.Dtos.RootDto;
import com.wordfall.dto.Dtos.WordDto;
import com.wordfall.entity.Word;
import com.wordfall.repository.RootRepository;
import com.wordfall.repository.WordRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Read-only endpoints used by both games (any logged-in user). */
@RestController
@RequestMapping("/api")
public class GameController {

    private final RootRepository roots;
    private final WordRepository words;

    public GameController(RootRepository roots, WordRepository words) {
        this.roots = roots;
        this.words = words;
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "ok");
    }

    @GetMapping("/roots")
    public List<RootDto> roots() {
        return roots.findAll().stream()
                .map(r -> new RootDto(r.getId(), r.getName(), words.countByRootId(r.getId())))
                .filter(r -> r.wordCount() > 0)
                .sorted((a, b) -> a.name().compareToIgnoreCase(b.name()))
                .toList();
    }

    /** Random words for the falling-block game (text only is used by the client). */
    @GetMapping("/words/random")
    public List<WordDto> random(@RequestParam(defaultValue = "60") int count) {
        int n = Math.max(1, Math.min(count, 200));
        return words.findRandom(n).stream().map(GameController::toDto).toList();
    }

    /** All words + meanings of one root for the meaning game. */
    @GetMapping("/words/root/{rootId}")
    public List<WordDto> byRoot(@PathVariable Long rootId) {
        return words.findByRootIdOrderByTextAsc(rootId).stream().map(GameController::toDto).toList();
    }

    static WordDto toDto(Word w) {
        return new WordDto(w.getId(), w.getText(), w.getMeaning(), w.getRoot().getId(), w.getRoot().getName());
    }
}
