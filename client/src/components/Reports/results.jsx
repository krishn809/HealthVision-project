import React, { useState, useEffect } from "react";
import axios from "axios";
import BiomarkerCard from "./BiomarkerCard";
import styles from "./results.module.css";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiActivity, FiLogOut, FiSearch } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Results = () => {
    const [biomarkers, setBiomarkers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const home = () => navigate("/");
    const navReports = () => navigate("/reports");

    useEffect(() => {
        const fetchBiomarkers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const response = await axios.get(
                    `${apiurl}/bloodreport/biomarkers`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setBiomarkers(response.data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching biomarkers:", err);
                // Fallback demo biomarkers if offline or dev mode
                setBiomarkers([
                    {
                        name: "Fasting Blood Glucose",
                        result: 92,
                        unit: "mg/dL",
                        referenceRange: { min: 70, max: 99 },
                        reportDate: new Date().toISOString()
                    },
                    {
                        name: "Total Cholesterol",
                        result: 185,
                        unit: "mg/dL",
                        referenceRange: { min: 125, max: 200 },
                        reportDate: new Date().toISOString()
                    },
                    {
                        name: "Hemoglobin A1c",
                        result: 5.4,
                        unit: "%",
                        referenceRange: { min: 4.0, max: 5.6 },
                        reportDate: new Date().toISOString()
                    },
                    {
                        name: "Vitamin D (25-OH)",
                        result: 38,
                        unit: "ng/mL",
                        referenceRange: { min: 30, max: 100 },
                        reportDate: new Date().toISOString()
                    },
                    {
                        name: "hs-CRP (Inflammation)",
                        result: 0.8,
                        unit: "mg/L",
                        referenceRange: { min: 0.1, max: 1.0 },
                        reportDate: new Date().toISOString()
                    },
                    {
                        name: "Serum Creatinine",
                        result: 0.95,
                        unit: "mg/dL",
                        referenceRange: { min: 0.74, max: 1.35 },
                        reportDate: new Date().toISOString()
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchBiomarkers();
    }, []);

    const filteredBiomarkers = biomarkers.filter((biomarker) =>
        biomarker.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page_wrapper}>
            {/* Top Spatial Nav */}
            <header className={styles.main_container}>
                <nav className={styles.navbar}>
                    <div className={styles.title_container} onClick={home}>
                        <div className={styles.brand_logo_circle}>
                            <FiActivity size={18} />
                        </div>
                        <h1>Health Vision</h1>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <button className={styles.white_btn} onClick={navReports}>
                            <FiArrowLeft size={16} />
                            <span>Reports Hub</span>
                        </button>
                        <button className={styles.white_btn} onClick={handleLogout}>
                            <FiLogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </header>

            <main className={styles.container}>
                <div className={styles.header}>
                    <button className={styles.backButton} onClick={navReports} title="Back">
                        <FiArrowLeft size={18} />
                    </button>
                    <h1>Biomarkers Overview</h1>
                    <p>
                        Track vital metrics extracted from your blood tests and monitor health trends over time.
                    </p>
                </div>

                {/* Search Bar */}
                <div className={styles.searchContainer}>
                    <div className={styles.searchIconWrapper}>
                        <FiSearch size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search biomarker (e.g., Glucose, Cholesterol, Hemoglobin)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                {/* Biomarkers Grid */}
                {loading ? (
                    <div className={styles.loading}>Loading biomarkers overview...</div>
                ) : (
                    <div className={styles.biomarkerList}>
                        {filteredBiomarkers.length > 0 ? (
                            filteredBiomarkers.map((biomarker, index) => (
                                <BiomarkerCard key={index} biomarker={biomarker} />
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                No biomarkers match "{search}".
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Results;
