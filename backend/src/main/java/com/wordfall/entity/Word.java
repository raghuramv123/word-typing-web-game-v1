package com.wordfall.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "words")
@Getter
@Setter
@NoArgsConstructor
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "word_text", nullable = false, length = 60)
    private String text;

    @Column(nullable = false, length = 400)
    private String meaning;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "root_id")
    private RootWord root;
}
