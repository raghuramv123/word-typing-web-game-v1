package com.wordfall.repository;

import com.wordfall.entity.Score;
import com.wordfall.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findTop100ByUserOrderByCreatedAtDesc(User user);
}
