package com.wordfall.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

/** Always answers with {"message": "..."} so the frontend can show it directly. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream().findFirst()
                .map(f -> f.getField() + " " + f.getDefaultMessage())
                .orElse("Invalid request");
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        String msg = e.getReason() == null ? "Request failed" : e.getReason();
        return ResponseEntity.status(e.getStatusCode()).body(Map.of("message", msg));
    }
}
