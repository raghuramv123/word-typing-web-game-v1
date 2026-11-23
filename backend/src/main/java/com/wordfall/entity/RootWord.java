package com.wordfall.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A word root such as "Fid" – groups words that share the root. */
@Entity
@Table(name = "word_roots")
@Getter
@Setter
@NoArgsConstructor
public class RootWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;
}
