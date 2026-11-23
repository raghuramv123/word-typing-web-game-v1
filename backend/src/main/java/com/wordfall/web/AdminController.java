package com.wordfall.web;

import com.wordfall.dto.Dtos.BulkWordRequest;
import com.wordfall.dto.Dtos.RootDto;
import com.wordfall.dto.Dtos.RootRequest;
import com.wordfall.dto.Dtos.WordDto;
import com.wordfall.dto.Dtos.WordRequest;
import com.wordfall.entity.RootWord;
import com.wordfall.entity.Word;
import com.wordfall.repository.RootRepository;
import com.wordfall.repository.WordRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Admin only (enforced in SecurityConfig: /api/admin/** needs ROLE_ADMIN). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    // "word | meaning", "word: meaning", "word = meaning" or "word - meaning"
    private static final Pattern LINE = Pattern.compile("^(\\S+?)\\s*(?:[|:=]|\\s-\\s)\\s*(.+)$");

    private final RootRepository roots;
    private final WordRepository words;

    public AdminController(RootRepository roots, WordRepository words) {
        this.roots = roots;
        this.words = words;
    }

    @GetMapping("/roots")
    public List<RootDto> roots() {
        return roots.findAll().stream()
                .map(r -> new RootDto(r.getId(), r.getName(), words.countByRootId(r.getId())))
                .sorted((a, b) -> a.name().compareToIgnoreCase(b.name()))
                .toList();
    }

    @PostMapping("/roots")
    public RootDto addRoot(@Valid @RequestBody RootRequest req) {
        String name = req.name().trim();
        if (roots.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Root already exists");
        }
        RootWord r = new RootWord();
        r.setName(name);
        r = roots.save(r);
        return new RootDto(r.getId(), r.getName(), 0);
    }

    @DeleteMapping("/roots/{id}")
    @Transactional
    public void deleteRoot(@PathVariable Long id) {
        if (!roots.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Root not found");
        }
        words.deleteByRootId(id);
        roots.deleteById(id);
    }

    @GetMapping("/words")
    public List<WordDto> allWords() {
        return words.findAll().stream().map(GameController::toDto).toList();
    }

    @PostMapping("/words")
    public WordDto addWord(@Valid @RequestBody WordRequest req) {
        RootWord root = roots.findById(req.rootId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Root not found"));
        String text = req.text().trim();
        if (words.existsByRootIdAndTextIgnoreCase(root.getId(), text)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Word already exists under this root");
        }
        return GameController.toDto(words.save(build(root, text, req.meaning().trim())));
    }

    /** One word per line: "word | meaning". Returns how many were added / skipped. */
    @PostMapping("/words/bulk")
    public Map<String, Integer> bulk(@Valid @RequestBody BulkWordRequest req) {
        RootWord root = roots.findById(req.rootId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Root not found"));
        int added = 0;
        int skipped = 0;
        for (String raw : req.lines().split("\\R")) {
            String line = raw.trim();
            if (line.isEmpty()) continue;
            Matcher m = LINE.matcher(line);
            if (!m.matches() || m.group(1).length() > 40 || m.group(2).trim().length() > 300
                    || words.existsByRootIdAndTextIgnoreCase(root.getId(), m.group(1))) {
                skipped++;
                continue;
            }
            words.save(build(root, m.group(1), m.group(2).trim()));
            added++;
        }
        return Map.of("added", added, "skipped", skipped);
    }

    @DeleteMapping("/words/{id}")
    public void deleteWord(@PathVariable Long id) {
        if (!words.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Word not found");
        }
        words.deleteById(id);
    }

    private static Word build(RootWord root, String text, String meaning) {
        Word w = new Word();
        w.setRoot(root);
        w.setText(text);
        w.setMeaning(meaning);
        return w;
    }
}
