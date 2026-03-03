package com.plantdisease.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "PREDICTION_HISTORY")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PredictionHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "pred_seq")
    @SequenceGenerator(name = "pred_seq", sequenceName = "PRED_SEQ", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "DISEASE_NAME", nullable = false, length = 100)
    private String diseaseName;

    @Column(name = "CONFIDENCE", nullable = false)
    private Double confidence;

    @Column(name = "IS_HEALTHY", nullable = false)
    private Boolean isHealthy;

    @Column(name = "REMEDY", length = 1000)
    private String remedy;

    @Column(name = "IMAGE_FILENAME", length = 255)
    private String imageFilename;

    @Column(name = "PREDICTED_AT", updatable = false)
    @Builder.Default
    private LocalDateTime predictedAt = LocalDateTime.now();
}