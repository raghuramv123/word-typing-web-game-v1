package com.wordfall.repository;

import com.wordfall.entity.RootWord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RootRepository extends JpaRepository<RootWord, Long> {
    boolean existsByNameIgnoreCase(String name);
}
