package com.wordfall.config;

import com.wordfall.entity.RootWord;
import com.wordfall.entity.User;
import com.wordfall.entity.Word;
import com.wordfall.repository.RootRepository;
import com.wordfall.repository.UserRepository;
import com.wordfall.repository.WordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/** Creates the admin account (from env vars) and a few sample words on first start. */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final RootRepository roots;
    private final WordRepository words;
    private final PasswordEncoder encoder;
    private final String adminUsername;
    private final String adminPassword;

    public DataSeeder(UserRepository users, RootRepository roots, WordRepository words,
                      PasswordEncoder encoder,
                      @Value("${ADMIN_USERNAME:admin}") String adminUsername,
                      @Value("${ADMIN_PASSWORD:admin12345}") String adminPassword) {
        this.users = users;
        this.roots = roots;
        this.words = words;
        this.encoder = encoder;
        this.adminUsername = adminUsername;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (!users.existsByUsernameIgnoreCase(adminUsername)) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setPasswordHash(encoder.encode(adminPassword));
            admin.setRole("ADMIN");
            users.save(admin);
            log.info("Created admin user '{}'", adminUsername);
            if ("admin12345".equals(adminPassword)) {
                log.warn("Admin is using the DEFAULT password - set ADMIN_PASSWORD in production!");
            }
        }

        if (roots.count() == 0) {
            seed("Fid", new String[][]{
                    {"confident", "feeling sure about yourself or something"},
                    {"fidelity", "faithfulness to a person, cause or belief"},
                    {"fiduciary", "a person who holds something in trust for another"},
                    {"diffident", "shy and lacking self-confidence"},
                    {"affidavit", "a written statement sworn to be true"},
                    {"infidel", "a person who has no faith in a religion"}});
            seed("Spec", new String[][]{
                    {"inspect", "to look at something carefully"},
                    {"spectator", "a person who watches an event"},
                    {"respect", "a feeling of admiration for someone"},
                    {"suspect", "to think someone may be guilty"},
                    {"perspective", "a particular way of viewing things"},
                    {"spectacle", "a visually striking performance or display"}});
            seed("Dict", new String[][]{
                    {"dictate", "to say words aloud for someone to write"},
                    {"predict", "to say what will happen in the future"},
                    {"verdict", "a decision made by a jury"},
                    {"contradict", "to say the opposite of what someone said"},
                    {"dictionary", "a book that lists words and their meanings"},
                    {"diction", "the choice and use of words in speech"}});
            log.info("Seeded sample roots and words");
        }
    }

    private void seed(String rootName, String[][] pairs) {
        RootWord root = new RootWord();
        root.setName(rootName);
        root = roots.save(root);
        for (String[] p : pairs) {
            Word w = new Word();
            w.setRoot(root);
            w.setText(p[0]);
            w.setMeaning(p[1]);
            words.save(w);
        }
    }
}
