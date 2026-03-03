package com.plantdisease.repository;

import com.plantdisease.model.PredictionHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface PredictionRepository extends JpaRepository<PredictionHistory, Long> {

    List<PredictionHistory> findByUserUsernameOrderByPredictedAtDesc(String username);

    @Query("SELECT p.diseaseName AS disease, COUNT(p) AS count " +
           "FROM PredictionHistory p " +
           "GROUP BY p.diseaseName " +
           "ORDER BY count DESC")
    List<Map<String, Object>> getDiseaseFrequency();

    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.user.username = :username")
    Long countByUsername(String username);

    @Query("SELECT COUNT(p) FROM PredictionHistory p WHERE p.isHealthy = false")
    Long countDiseased();
}
