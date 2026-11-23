package com.wordfall.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "scores")
@Getter
@Setter
@NoArgsConstructor
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    /** FALL or MEANING */
    @Column(nullable = false, length = 20)
    private String game;

    private int score;
    private int correct;
    private int missed;

    /** Only set for the meaning game */
    @Column(length = 60)
    private String rootName;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}
