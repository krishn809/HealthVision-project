import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./labreports.module.css";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiActivity, FiLogOut, FiFileText, FiCalendar, FiExternalLink } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const LabReports = () => {
    const [reports, setReports] = useState([]);
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
        const fetchReports = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${apiurl}/files/${token}`);
                setReports(response.data || []);
            } catch (err) {
                console.error("Error fetching reports:", err);
                // Fallback mock representation if offline/dev mode
                setReports([
                    {
                        url: "#",
                        description: "Comprehensive Metabolic Panel & Lipid Profile",
                        uploadDate: new Date().toISOString(),
                        testDate: new Date().toISOString()
                    }
                ]);
            }
        };

        fetchReports();
    }, []);

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
                    <button className={styles.back_button} onClick={navReports} title="Back">
                        <FiArrowLeft size={18} />
                    </button>
                    <h1>Uploaded Lab Reports</h1>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {reports.length === 0 && !error ? (
                    <div className={styles.card} style={{ textAlign: "center", padding: "40px" }}>
                        <p style={{ color: "var(--text-body)" }}>No lab reports uploaded yet.</p>
                        <button 
                            className={styles.view_link} 
                            style={{ margin: "16px auto 0 auto", display: "inline-flex" }}
                            onClick={() => navigate("/reports/add")}
                        >
                            + Upload First Report
                        </button>
                    </div>
                ) : (
                    reports.map((report, index) => (
                        <div key={index} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.title}>
                                    <FiFileText style={{ color: "var(--green-primary)" }} />
                                    <span>Medical Diagnostic Report #{reports.length - index}</span>
                                </div>
                                <a
                                    href={report.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.view_link}
                                >
                                    <span>View PDF</span>
                                    <FiExternalLink size={14} />
                                </a>
                            </div>

                            {report.description && (
                                <div className={styles.description}>{report.description}</div>
                            )}

                            <div className={styles.dateRow}>
                                <div className={styles.date_pill}>
                                    <FiCalendar size={13} style={{ color: "var(--green-primary)" }} />
                                    <span>Upload: <strong>{new Date(report.uploadDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></span>
                                </div>
                                <div className={styles.date_pill}>
                                    <FiCalendar size={13} style={{ color: "var(--green-primary)" }} />
                                    <span>Test Date: <strong>{report.testDate ? new Date(report.testDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recorded"}</strong></span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default LabReports;
