import styles from "./styles.module.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { 
    FiHome, 
    FiMessageSquare, 
    FiFileText, 
    FiUser, 
    FiArrowRight, 
    FiActivity, 
    FiShield, 
    FiPlus,
    FiTrendingUp,
    FiLogOut
} from "react-icons/fi";

function Main() {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({ progress: 85 });
    const [activeFilter, setActiveFilter] = useState("all");
    const apiurl = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    let data = null;
                    try {
                        const response = await axios.get(`${apiurl}/users/profile/${token}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        data = response.data;
                    } catch (e) {
                        const fallbackRes = await axios.get(`${apiurl}/profile`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        data = fallbackRes.data;
                    }

                    if (data) {
                        const totalFields = 5;
                        const completedFields = ["age", "height", "weight", "ethnicity", "sex"].filter(
                            (k) => data[k] !== undefined && data[k] !== null && data[k] !== ""
                        ).length;
                        const progress = Math.round((completedFields / totalFields) * 100);
                        setProfileData({ ...data, progress: progress || data.progress || 85 });
                    }
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setProfileData({ firstName: "Krishn", lastName: "Kushwaha", progress: 100 });
            }
        };

        fetchProfileData();
    }, [apiurl]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    const chat = () => navigate("/chat");
    const reports = () => navigate("/reports");
    const profile = () => navigate("/profile");
    const addReport = () => navigate("/reports/add");
    const results = () => navigate("/reports/results");

    // Dynamic progress calculation for SVG circular dial
    const progressVal = Math.min(100, Math.max(0, profileData.progress || 85));
    const circumference = 2 * Math.PI * 24; // r = 24
    const strokeDashoffset = circumference - (progressVal / 100) * circumference;

    return (
        <div className={styles.main_wrapper}>
            {/* SVG Gradient definitions for spatial dials */}
            <svg width="0" height="0" style={{ position: "absolute" }}>
                <defs>
                    <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Floating Top Spatial Header */}
            <header className={styles.main_container}>
                <nav className={styles.navbar}>
                    <div className={styles.title_container} onClick={() => navigate("/")}>
                        <div className={styles.brand_logo_circle}>
                            <FiActivity size={18} />
                        </div>
                        <h1>
                            Health Vision <span className={styles.brand_tag}>Diagnostics</span>
                        </h1>
                    </div>

                    <div className={styles.header_center_pill}>
                        <div className={styles.live_dot}></div>
                        <span>Biomarker Engine Active</span>
                    </div>

                    <button className={styles.white_btn} onClick={handleLogout} title="Sign Out">
                        <FiLogOut size={15} />
                        <span>Logout</span>
                    </button>
                </nav>
            </header>

            <main className={styles.dashboard_container}>
                {/* Spatial Profile Header Widget (Inspired by Reference Circular Dial) */}
                <div className={styles.dashboard_header} onClick={profile}>
                    <div className={styles.profile_summary}>
                        <div className={styles.welcome_text_wrap}>
                            <h2>Welcome back{profileData.firstName ? `, ${profileData.firstName}` : ", Krishn"}</h2>
                            <p className={styles.welcome_subtitle}>
                                Your personal AI biomarker & preventive healthcare suite
                            </p>
                            <div className={styles.welcome_pills}>
                                <div className={styles.info_mini_pill}>
                                    <FiShield size={12} style={{ color: "#10b981" }} />
                                    <span>Encrypted Health Record</span>
                                </div>
                                <div className={styles.info_mini_pill}>
                                    <FiTrendingUp size={12} style={{ color: "#10b981" }} />
                                    <span>Normality Range: Optimal</span>
                                </div>
                            </div>
                        </div>

                        {/* Neomorphic Circular Ring Dial */}
                        <div className={styles.progress_container}>
                            <div className={styles.circular_dial_wrapper}>
                                <svg className={styles.circular_dial_svg} viewBox="0 0 60 60">
                                    <circle
                                        className={styles.dial_bg_track}
                                        cx="30"
                                        cy="30"
                                        r="24"
                                    />
                                    <circle
                                        className={styles.dial_fill_progress}
                                        cx="30"
                                        cy="30"
                                        r="24"
                                        style={{
                                            strokeDasharray: circumference,
                                            strokeDashoffset: strokeDashoffset,
                                        }}
                                    />
                                </svg>
                                <div className={styles.dial_score_text}>
                                    {progressVal}%
                                </div>
                            </div>
                            <div className={styles.progress_labels}>
                                <span>Health Profile</span>
                                <small>Tap to review vitals &rarr;</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter / Category Pills (Inspired by Living Room / Kitchen / Bedroom chips) */}
                <div className={styles.filter_pills_container}>
                    <div 
                        className={`${styles.filter_pill} ${activeFilter === "all" ? styles.filter_pill_active : ""}`}
                        onClick={() => setActiveFilter("all")}
                    >
                        <span>All Services</span>
                        <span className={styles.filter_pill_badge}>03</span>
                    </div>
                    <div 
                        className={`${styles.filter_pill} ${activeFilter === "ai" ? styles.filter_pill_active : ""}`}
                        onClick={() => { setActiveFilter("ai"); chat(); }}
                    >
                        <span>AI Consultation</span>
                        <span className={styles.filter_pill_badge}>Active</span>
                    </div>
                    <div 
                        className={`${styles.filter_pill} ${activeFilter === "reports" ? styles.filter_pill_active : ""}`}
                        onClick={() => { setActiveFilter("reports"); reports(); }}
                    >
                        <span>Lab Reports</span>
                        <span className={styles.filter_pill_badge}>Cloud</span>
                    </div>
                    <div 
                        className={`${styles.filter_pill} ${activeFilter === "results" ? styles.filter_pill_active : ""}`}
                        onClick={() => { setActiveFilter("results"); results(); }}
                    >
                        <span>Biomarker Trends</span>
                        <span className={styles.filter_pill_badge}>Live</span>
                    </div>
                </div>

                {/* Dashboard Grid of Spatial Cards */}
                <div className={styles.dashboard_grid}>
                    {/* Hero Card 1: Chat with AI Doctor (Reference deep dark emerald card style) */}
                    <div className={`${styles.card} ${styles.chatdoctor}`} onClick={chat}>
                        <div className={styles.card_content}>
                            <div>
                                <div className={styles.card_top_row}>
                                    <div className={styles.hero_badge_pill}>
                                        <div className={styles.live_dot}></div>
                                        <span>Turbo AI</span>
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
                                        RAG v2.4
                                    </span>
                                </div>
                                <div className={styles.card_text}>
                                    <h3>Chat with AI</h3>
                                    <p>Get instant clinical insights, biomarker explanations & guidance</p>
                                </div>
                            </div>

                            <div className={styles.card_image_container}>
                                <img 
                                    src="/images/ai_doctor.webp" 
                                    alt="Chat with AI Doctor" 
                                    className={styles.card_image} 
                                    onError={(e) => { e.target.src = "/images/ai_doctor.jpeg"; }}
                                />
                            </div>

                            <div className={styles.card_action_footer}>
                                <span className={styles.action_text}>
                                    Ask health questions
                                </span>
                                <div className={styles.card_round_icon_btn}>
                                    <FiArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Lab Reports */}
                    <div className={`${styles.card} ${styles.labtests}`} onClick={reports}>
                        <div className={styles.card_content}>
                            <div>
                                <div className={styles.card_top_row}>
                                    <div className={styles.coral_badge_pill}>
                                        <span>Diagnostic Hub</span>
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        PDF • OCR
                                    </span>
                                </div>
                                <div className={styles.card_text}>
                                    <h3>Lab Reports</h3>
                                    <p>Upload blood tests and review biomarker values with smart trends</p>
                                </div>
                            </div>

                            <div className={styles.card_image_container}>
                                <img 
                                    src="/images/lab_tests.webp" 
                                    alt="Lab Tests" 
                                    className={styles.card_image} 
                                />
                            </div>

                            <div className={styles.card_action_footer}>
                                <span className={styles.action_text}>
                                    View & upload reports
                                </span>
                                <div className={styles.card_round_icon_btn}>
                                    <FiArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Consult Top Doctors */}
                    <div className={`${styles.card} ${styles.consultation}`}>
                        <div className={styles.card_content}>
                            <div>
                                <div className={styles.card_top_row}>
                                    <div className={styles.info_mini_pill} style={{ margin: 0 }}>
                                        <span>Upcoming Feature</span>
                                    </div>
                                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        Global MDs
                                    </span>
                                </div>
                                <div className={styles.card_text}>
                                    <h3>Consult Top Doctors</h3>
                                    <p>Online 1-on-1 consultations with verified medical specialists</p>
                                </div>
                            </div>

                            <div className={styles.card_image_container}>
                                <img 
                                    src="/images/online.webp" 
                                    alt="Consult Top Doctors" 
                                    className={styles.card_image} 
                                />
                            </div>

                            <div className={styles.card_action_footer}>
                                <span className={styles.action_text} style={{ color: "var(--text-muted)" }}>
                                    Join priority waitlist
                                </span>
                                <div className={styles.card_round_icon_btn} style={{ background: "rgba(0,0,0,0.05)", color: "var(--text-muted)" }}>
                                    <FiArrowRight size={16} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Spatial Floating Bottom Navigation Dock (Inspired directly by reference image dock) */}
            <div className={styles.spatial_dock_bar}>
                <div 
                    className={`${styles.dock_item} ${styles.dock_item_active}`} 
                    onClick={() => navigate("/")}
                    title="Home"
                >
                    <FiHome />
                    <span>Home</span>
                </div>

                <div 
                    className={styles.dock_item} 
                    onClick={chat}
                    title="AI Chat"
                >
                    <FiMessageSquare />
                    <span>Chat</span>
                </div>

                {/* Center Floating Action Button */}
                <div 
                    className={styles.dock_center_action} 
                    onClick={addReport} 
                    title="Upload New Report"
                >
                    <FiPlus size={22} />
                </div>

                <div 
                    className={styles.dock_item} 
                    onClick={reports}
                    title="Reports"
                >
                    <FiFileText />
                    <span>Reports</span>
                </div>

                <div 
                    className={styles.dock_item} 
                    onClick={profile}
                    title="Profile"
                >
                    <FiUser />
                    <span>Profile</span>
                </div>
            </div>
        </div>
    );
}

export default Main;
