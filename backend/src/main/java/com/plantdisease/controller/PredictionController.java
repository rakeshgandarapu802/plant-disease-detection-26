package com.plantdisease.controller;

import com.plantdisease.service.PredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    @PostMapping("/predict")
    public ResponseEntity<?> predict(
            @RequestParam("image") MultipartFile image,
            Principal principal) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Image file is empty"));
            }
            var result = predictionService.predict(image, principal.getName());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> history(Principal principal) {
        return ResponseEntity.ok(predictionService.getHistory(principal.getName()));
    }

    @GetMapping("/stats")
    public ResponseEntity<?> stats() {
        return ResponseEntity.ok(predictionService.getDiseaseStats());
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(Principal principal) {
        return ResponseEntity.ok(predictionService.getDashboardSummary(principal.getName()));
    }
}