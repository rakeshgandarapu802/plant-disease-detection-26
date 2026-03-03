package com.plantdisease.service;

import com.plantdisease.model.PredictionHistory;
import com.plantdisease.model.User;
import com.plantdisease.repository.PredictionRepository;
import com.plantdisease.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PredictionService {

    @Value("${flask.service.url}")
    private String flaskServiceUrl;

    private final RestTemplate restTemplate;
    private final PredictionRepository predictionRepository;
    private final UserRepository userRepository;

    @SuppressWarnings({ "unchecked", "null", "rawtypes" })
    public Map<String, Object> predict(MultipartFile image, String username) throws Exception {
        log.info("Running prediction for user: {} on file: {}", username, image.getOriginalFilename());

        // Build multipart request for Flask
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        });

        HttpEntity<LinkedMultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                flaskServiceUrl + "/predict", entity, Map.class
        );

        Map<String, Object> result = response.getBody();
        if (result == null) throw new RuntimeException("Empty response from ML service");

        // Persist to database
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PredictionHistory record = PredictionHistory.builder()
                .user(user)
                .diseaseName((String) result.get("disease"))
                .confidence(((Number) result.get("confidence")).doubleValue())
                .isHealthy((Boolean) result.get("is_healthy"))
                .remedy((String) result.get("remedy"))
                .imageFilename(image.getOriginalFilename())
                .build();

        predictionRepository.save(record);
        log.info("Prediction saved: {} ({:.2f}%)", result.get("disease"), result.get("confidence"));

        return result;
    }

    public List<PredictionHistory> getHistory(String username) {
        return predictionRepository.findByUserUsernameOrderByPredictedAtDesc(username);
    }

    public List<Map<String, Object>> getDiseaseStats() {
        return predictionRepository.getDiseaseFrequency();
    }

    public Map<String, Object> getDashboardSummary(String username) {
        long total     = predictionRepository.countByUsername(username);
        long diseased  = predictionRepository.countDiseased();
        return Map.of(
                "totalPredictions", total,
                "diseasedCount",    diseased,
                "healthyCount",     total - diseased
        );
    }
}
