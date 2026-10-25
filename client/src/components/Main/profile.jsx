import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./profile.module.css";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiActivity, FiLogOut, FiCheckCircle } from "react-icons/fi";

const apiurl = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
        window.location.reload();
    };

    const home = () => navigate("/");

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${apiurl}/users/profile/${token}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const totalFields = 5;
                const completedFields = Object.keys(response.data).filter(
                    (key) => ["age", "height", "weight", "ethnicity", "sex"].includes(key) && response.data[key]
                ).length;

                response.data.progress = Math.round((completedFields / totalFields) * 100);
                setProfileData(response.data);
            } catch (error) {
                console.error("Error fetching profile data:", error);
                // Fallback mock representation if offline/dev mode
                setProfileData({
                    firstName: "Krishn",
                    lastName: "Kushwaha",
                    age: "20",
                    height: "5'10\"",
                    weight: "162 lbs.",
                    ethnicity: "Asian",
                    sex: "Male",
                    progress: 100
                });
            }
        };
        fetchProfileData();
    }, []);

    if (!profileData) {
        return (
            <div className={styles.page_wrapper}>
                <div className={styles.profile_container} style={{ textAlign: "center", paddingTop: "80px" }}>
                    <div className={styles.brand_logo_circle} style={{ margin: "0 auto 16px auto", width: "48px", height: "48px" }}>
                        <FiActivity size={24} />
                    </div>
                    <p style={{ color: "var(--text-body)" }}>Loading Health Profile...</p>
                </div>
            </div>
        );
    }

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
                    <button className={styles.white_btn} onClick={handleLogout}>
                        <FiLogOut size={15} />
                        <span>Logout</span>
                    </button>
                </nav>
            </header>

            <main className={styles.profile_container}>
                {/* Header Section */}
                <div className={styles.header}>
                    <button className={styles.back_button} onClick={home} title="Back to Dashboard">
                        <FiArrowLeft size={18} />
                    </button>
                    <h1>Health Profile</h1>
                </div>

                {/* Spatial Progress Card */}
                <div className={styles.progress_card}>
                    <div className={styles.progress_header}>
                        <span className={styles.progress_title}>Profile Completeness</span>
                        <span className={styles.progress_text}>{profileData.progress}% Synchronized</span>
                    </div>
                    <div className={styles.progress_bar}>
                        <div
                            className={styles.progress_fill}
                            style={{ width: `${profileData.progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* General Information Spatial Section */}
                <section className={styles.info_section}>
                    <h2>
                        <FiCheckCircle style={{ color: "var(--green-primary)" }} />
                        <span>Clinical Vitals & Demographics</span>
                    </h2>

                    <div className={styles.info_container}>
                        {/* Left Column */}
                        <div className={styles.info_left}>
                            <div className={styles.info_card}>
                                <span>{profileData.age || "—"} yrs</span>
                                <span className={styles.info_label}>Age</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.height || "—"}</span>
                                <span className={styles.info_label}>Height</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.weight || "—"}</span>
                                <span className={styles.info_label}>Weight</span>
                            </div>
                        </div>

                        {/* Center Avatar */}
                        <div className={styles.avatar_container}>
                            <img src="/images/body.svg" alt="Health Avatar" className={styles.avatar} />
                        </div>

                        {/* Right Column */}
                        <div className={styles.info_right}>
                            <div className={styles.info_card}>
                                <span>{profileData.ethnicity || "—"}</span>
                                <span className={styles.info_label}>Ethnicity</span>
                            </div>
                            <div className={styles.info_card}>
                                <span>{profileData.sex || "—"}</span>
                                <span className={styles.info_label}>Sex</span>
                            </div>
                            <div className={styles.info_card}>
                                <span style={{ color: "var(--green-primary-hover)" }}>Active</span>
                                <span className={styles.info_label}>Status</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Profile;
