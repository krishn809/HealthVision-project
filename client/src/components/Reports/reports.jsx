import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./reports.module.css";
import { FiArrowLeft, FiPlus, FiArrowRight, FiActivity, FiLogOut } from "react-icons/fi";

const Reports = () => {
    const navigate = useNavigate();

    const handleAddNew = () => {
        navigate("/reports/add");
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const home = () => {
        navigate("/");
    };

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
                        <button className={styles.white_btn} onClick={home}>
                            <FiArrowLeft size={16} />
                            <span>Dashboard</span>
                        </button>
                        <button className={styles.white_btn} onClick={handleLogout}>
                            <FiLogOut size={15} />
                            <span>Logout</span>
                        </button>
                    </div>
                </nav>
            </header>

            <main className={styles.reports_container}>
                <div className={styles.header}>
                    <div className={styles.icon_badge}>
                        <img src="/images/labreports.svg" alt="Lab Tests" />
                    </div>
                    <h1>Lab Reports & Results</h1>
                    <p>Review uploaded laboratory tests, AI-extracted biomarkers, and longitudinal health metrics.</p>
                </div>

                <div className={styles.buttons_container}>
                    {/* Lab Reports Card */}
                    <div
                        className={styles.button_card}
                        onClick={() => navigate("/reports/labreports")}
                    >
                        <div className={styles.card_content}>
                            <div className={styles.card_text}>
                                <h3>Lab Reports</h3>
                                <p>Access original test PDFs, upload dates, and diagnostic history.</p>
                            </div>
                            <div className={styles.card_image_container}>
                                <img src="/images/lab-test.png" alt="Lab Tests Icon" className={styles.card_image} />
                            </div>
                        </div>
                        <div className={styles.card_footer_action}>
                            <span className={styles.footer_text}>
                                Browse uploaded reports
                            </span>
                            <FiArrowRight size={16} />
                        </div>
                    </div>

                    {/* View Results / Biomarkers Card */}
                    <div
                        className={styles.button_card}
                        onClick={() => navigate("/reports/results")}
                    >
                        <div className={styles.card_content}>
                            <div className={styles.card_text}>
                                <h3>Biomarker Results</h3>
                                <p>Track vital blood markers, ranges, and AI normal/abnormal evaluations.</p>
                            </div>
                            <div className={styles.card_image_container}>
                                <img src="/images/results.png" alt="View Results Icon" className={styles.card_image} />
                            </div>
                        </div>
                        <div className={styles.card_footer_action}>
                            <span className={styles.footer_text}>
                                Monitor biomarker indicators
                            </span>
                            <FiArrowRight size={16} />
                        </div>
                    </div>
                </div>

                {/* Spatial Add New Button */}
                <button className={styles.add_new_btn} onClick={handleAddNew}>
                    <FiPlus size={20} />
                    <span>Upload New Report</span>
                </button>
            </main>
        </div>
    );
};

export default Reports;
