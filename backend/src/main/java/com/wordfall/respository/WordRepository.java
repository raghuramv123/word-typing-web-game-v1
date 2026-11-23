package com.wordfall.repository;

import com.wordfall.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WordRepository extends JpaRepository<Word, Long> {

    List<Word> findByRootIdOrderByTextAsc(Long rootId);

    long countByRootId(Long rootId);

    boolean existsByRootIdAndTextIgnoreCase(Long rootId, String text);

    void deleteByRootId(Long rootId);

    @Query(value = "SELECT * FROM words ORDER BY random() LIMIT :n", nativeQuery = true)
    List<Word> findRandom(@Param("n") int n);
}
