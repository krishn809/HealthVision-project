import React from "react";
import styles from "./biomarkerCard.module.css";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const BiomarkerCard = ({ biomarker }) => {
    const { name, result, unit, referenceRange, reportDate } = biomarker;
    const navigate = useNavigate();

    // Range and status calculations
    const min = referenceRange?.min ?? 0;
    const max = referenceRange?.max ?? 100;
    const margin = (max - min) * 0.25;
    const isInRange = result >= min && result <= max;
    const isClose = (result >= min - margin && result < min) || (result > max && result <= max + margin);

    const statusLabel = isInRange ? "Normal" : isClose ? "Borderline" : "Attention";
    const statusClass = isInRange 
        ? styles.status_normal 
        : isClose 
        ? styles.status_borderline 
        : styles.status_attention;

    const statusColor = isInRange ? "#10b981" : isClose ? "#f59e0b" : "#ef4444";

    // Progress bar positioning clamped between 4% and 96% so the knob doesn't overflow
    const rawPos = max > min ? ((result - min) / (max - min)) * 100 : 50;
    const position = Math.min(96, Math.max(4, rawPos));

    const handleCardClick = () => {
        navigate(`/reports/biomarker/${name.toLowerCase()}`);
    };

    return (
        <div className={styles.card} onClick={handleCardClick}>
            {/* Header with Title & Status Pill */}
            <div className={styles.header}>
                <h3 className={styles.title}>{name}</h3>
                <div className={`${styles.status_pill} ${statusClass}`}>
                    <div className={styles.status_dot} style={{ backgroundColor: statusColor }}></div>
                    <span>{statusLabel}</span>
                </div>
            </div>

            {/* Value display */}
            <div className={styles.value_row}>
                <span className={styles.value_number}>{result}</span>
                <span className={styles.value_unit}>{unit}</span>
            </div>

            {/* Spatial Range Visualizer with Sliding Knob */}
            <div className={styles.chartContainer}>
                <div className={styles.chart}>
                    <div className={styles.rangeBar}></div>
                    <div
                        className={styles.indicatorDot}
                        style={{
                            left: `${position}%`,
                            borderColor: statusColor,
                        }}
                    ></div>
                </div>
                <div className={styles.rangeLabels}>
                    <span>Min: {min}</span>
                    <span style={{ color: "var(--green-primary-hover)" }}>Normal Range</span>
                    <span>Max: {max}</span>
                </div>
            </div>

            {/* Footer with Date & Interactive Arrow */}
            <div className={styles.footer}>
                <p className={styles.updatedDate}>
                    {reportDate ? new Date(reportDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recorded"}
                </p>
                <div className={styles.arrow}>
                    <span>View Trends</span>
                    <FiArrowRight size={14} />
                </div>
            </div>
        </div>
    );
};

export default BiomarkerCard;
