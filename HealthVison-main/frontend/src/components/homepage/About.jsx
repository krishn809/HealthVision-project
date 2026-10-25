/**
 * HealthVision — About Us Page
 * Stack: React + Tailwind CSS + Framer Motion + Lucide React
 *
 * Aesthetic Direction: "Organic Precision"
 * — Warm-tinted whites with deep teal authority and soft sage green accents.
 * — Playfair Display serif for headings (authoritative but human), 
 *   Nunito Sans for body (approachable and clear).
 * — Card-flip team interactions, SVG mesh background, floating molecular dots.
 * — Designed to feel like a premium private medical institution's digital presence.
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    Github, Linkedin, Shield, Brain, HeartHandshake, Microscope,
    Stethoscope, ArrowRight, CheckCircle, Globe, Award,
    ChevronRight, Mail, Sparkles, Users, TrendingUp,
} from "lucide-react";

// ─── Global Styles ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Nunito+Sans:wght@300;400;500;600;700&display=swap');

    :root {
      --teal:        #0F7173;
      --teal-light:  #1A9597;
      --teal-pale:   #E6F4F4;
      --sage:        #52796F;
      --sage-light:  #84A98C;
      --sage-pale:   #EAF2EC;
      --warm-white:  #F8FAF9;
      --cream:       #F0F4F2;
      --text-dark:   #1A2E2C;
      --text-mid:    #3D5A58;
      --text-muted:  #7A9A98;
      --gold:        #C9A84C;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: var(--warm-white);
      color: var(--text-dark);
      font-family: 'Nunito Sans', sans-serif;
      overflow-x: hidden;
      line-height: 1.6;
    }

    .font-display { font-family: 'Playfair Display', serif; }

    /* Dot grid texture */
    .dot-grid {
      background-image: radial-gradient(circle, rgba(15,113,115,0.12) 1px, transparent 1px);
      background-size: 28px 28px;
    }

    /* Organic blob shapes */
    .blob-1 {
      border-radius: 60% 40% 70% 30% / 50% 60% 40% 50%;
    }
    .blob-2 {
      border-radius: 40% 60% 30% 70% / 60% 40% 60% 40%;
    }

    /* Card flip */
    .flip-card { perspective: 1000px; }
    .flip-inner {
      transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      position: relative;
    }
    .flip-card:hover .flip-inner,
    .flip-card.flipped .flip-inner {
      transform: rotateY(180deg);
    }
    .flip-front, .flip-back {
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      position: absolute;
      inset: 0;
    }
    .flip-back {
      transform: rotateY(180deg);
    }

    /* Subtle card hover lift */
    .lift-card {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .lift-card:hover {
      transform: translateY(-6px);
      box-shadow: 0 24px 60px rgba(15,113,115,0.14);
    }

    /* Glow pulse on feature icons */
    @keyframes iconPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(15,113,115,0.2); }
      50%       { box-shadow: 0 0 0 10px rgba(15,113,115,0); }
    }
    .icon-pulse { animation: iconPulse 3s ease-in-out infinite; }

    /* Floating dots */
    @keyframes floatDot {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33%       { transform: translateY(-12px) rotate(120deg); }
      66%       { transform: translateY(6px) rotate(240deg); }
    }

    /* Gradient text */
    .gradient-text {
      background: linear-gradient(135deg, var(--teal) 0%, var(--sage) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    /* Section reveal line */
    .reveal-line {
      width: 48px;
      height: 3px;
      background: linear-gradient(90deg, var(--teal), var(--sage-light));
      border-radius: 2px;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--warm-white); }
    ::-webkit-scrollbar-thumb { background: var(--teal-pale); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--teal-light); }
  `}</style>
);

// ─── Animation Variants ───────────────────────────────────────────────────────
const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.06 } },
};
const fadeUp = {
    hidden: { opacity: 0, y: 32 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const fadeLeft = {
    hidden: { opacity: 0, x: -32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const fadeRight = {
    hidden: { opacity: 0, x: 32 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn = {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
const Section = ({ children, className = "", id, style }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    return (
        <motion.section
            id={id} ref={ref} style={style}
            variants={stagger} initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={className}
        >
            {children}
        </motion.section>
    );
};

// ─── Section Label ────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
    <motion.div variants={fadeUp} className="flex items-center justify-center gap-3 mb-4">
        <div className="reveal-line" />
        <span className="text-xs font-semibold tracking-[0.18em] uppercase"
            style={{ color: "var(--teal)" }}>
            {children}
        </span>
    </motion.div>
);

// ─── Team Data ────────────────────────────────────────────────────────────────
const teamMembers = [
    {
        name: "Akhil Pandey",
        role: "Backend Developer & ML",
        avatar: "AP",
        avatarBg: "#52796F",
        image: "/Akhil.jpeg",
        bio: "Specialized in backend development and Machine Learning.",
        detail: "Focused on bridging robust backend logic with chatbot services.",
        skills: ["Express Js", "Node Js", "WebRTC","Razorpay", "MongoDB", "Langchain", "Scikit Learn", "Framer Motion", "Tailwind CSS"],
        github: "https://github.com/akhil9648",
        linkedin: "https://www.linkedin.com/in/akhilpandey9",
        email: "akhilpandey494@gmail.com",
    },
    {
        name: "Aditya Pratap Singh",
        role: "Lead AI & ML Architect",
        avatar: "AS",
        avatarBg: "#C9A84C",
        image: "/Aditya.jpeg",
        bio: "Architect of the OCR + ML + LLM pipeline and the AI-powered HealthVision medical chatbot.",
        detail: "Designed end-to-end systems for automated report analysis and intelligent patient interaction.",
        skills: ["FastAPI", "Python", "OpenCV", "Scikit-Learn", "XGBoost", "OpenAI"],
        github: "https://github.com/aditya2005-code",
        linkedin: "https://www.linkedin.com/in/adityapratapsingh84",
        email: "2k23.csds2312133@gmail.com",
    },
    {
        name: "Rishi Tiwari",
        role: "Full Stack Architect & Lead Frontend",
        avatar: "R",
        avatarBg: "#0F7173",
        image: "/Rishi.jpeg",
        bio: "Made MERN foundation and engineered the real-time WebRTC consultation system and payment integration.",
        detail: "Specializes in bridging high-performance backend microservices with intuitive, responsive React 19 interfaces.",
        skills: ["MERN Stack", "WebRTC", "Socket.io", "Razorpay", "Cloudinary"],
        github: "https://github.com/rishi-tiwari023",
        linkedin: "https://www.linkedin.com/in/rishi-tiwari023",
        email: "umesh896073@gmail.com",
    },
];

const DeveloperCard = ({ member, index }) => {
    return (
        <motion.div variants={scaleIn} className="h-[680px] max-w-[360px] mx-auto w-full lift-card rounded-2xl overflow-hidden"
            style={{
                background: "#fff",
                border: "1px solid rgba(15,113,115,0.12)",
                boxShadow: "0 4px 24px rgba(15,113,115,0.07)",
            }}>
            {/* Top strip with Image */}
            <div className="h-[480px] relative overflow-hidden bg-cover bg-center"
                style={{
                    backgroundImage: `url(${member.image})`,
                }}>
                {/* Gradient Overlay for better contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                {/* Decorative dots (kept for aesthetic) */}
                <div className="absolute right-4 top-4 w-12 h-12 rounded-full opacity-20"
                    style={{ background: member.avatarBg }} />
            </div>

            {/* Content area */}
            <div className="flex flex-col items-center -mt-10 px-6 pb-6 pt-1">
                <div className="w-18 h-13 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg border-4 border-white z-10"
                    style={{ background: member.avatarBg }}>
                    {member.avatar}
                </div>
                <h3 className="font-display font-600 mt-3 text-lg text-center leading-tight"
                    style={{ color: "var(--text-dark)" }}>
                    {member.name}
                </h3>
                <span className="text-xs font-semibold mt-1 px-3 py-1 rounded-full"
                    style={{ background: "var(--teal-pale)", color: "var(--teal)" }}>
                    {member.role}
                </span>

                {/* Skills on Front */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                    {member.skills.map((s) => (
                        <span key={s} className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
                            style={{ background: "var(--teal-pale)", color: "var(--teal)", border: "1px solid rgba(15,113,115,0.1)" }}>
                            {s}
                        </span>
                    ))}
                </div>

                <p className="text-sm mt-4 text-center leading-relaxed"
                    style={{ color: "var(--text-muted)" }}>
                    {member.bio}
                </p>

                {/* Social links */}
                <div className="flex items-center gap-4 mt-5">
                    {[
                        { icon: Github, href: member.github, label: "GitHub", target: "_blank" },
                        { icon: Linkedin, href: member.linkedin, label: "LinkedIn", target: "_blank" },
                        { icon: Mail, href: `mailto:${member.email}`, label: "Email", target: "_self" },
                    ].map(({ icon: Icon, href, label, target }) => (
                        <a key={label} href={href} aria-label={label}
                            target={target} rel="noopener noreferrer"
                            className="text-text-muted hover:text-teal-600 transition-colors duration-200"
                            style={{ color: "var(--text-muted)" }}>
                            <Icon size={18} />
                        </a>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

// ─── Trust Card ───────────────────────────────────────────────────────────────
const TrustCard = ({ icon: Icon, title, desc, color, index }) => (
    <motion.div variants={fadeUp} className="lift-card rounded-2xl p-7 relative overflow-hidden"
        style={{
            background: "#fff",
            border: "1px solid rgba(15,113,115,0.10)",
            boxShadow: "0 2px 16px rgba(15,113,115,0.06)",
        }}>
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-5"
            style={{ background: color }} />

        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 icon-pulse"
            style={{ background: `${color}18` }}>
            <Icon size={22} style={{ color }} strokeWidth={1.8} />
        </div>
        <h3 className="font-display font-semibold text-lg mb-2" style={{ color: "var(--text-dark)" }}>
            {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{desc}</p>
    </motion.div>
);

// ─── Stat Pill ────────────────────────────────────────────────────────────────
const StatPill = ({ value, label, icon: Icon }) => (
    <motion.div variants={scaleIn}
        className="flex items-center gap-4 px-6 py-4 rounded-2xl"
        style={{
            background: "#fff",
            border: "1px solid rgba(15,113,115,0.12)",
            boxShadow: "0 2px 12px rgba(15,113,115,0.07)",
        }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--teal-pale)" }}>
            <Icon size={20} style={{ color: "var(--teal)" }} />
        </div>
        <div>
            <p className="font-display font-bold text-xl leading-none" style={{ color: "var(--teal)" }}>
                {value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
        </div>
    </motion.div>
);

// ─── Floating Background Dots ─────────────────────────────────────────────────
const FloatingDots = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[
            { size: 8, top: "15%", left: "8%", delay: 0, duration: 6 },
            { size: 5, top: "30%", right: "12%", delay: 1.5, duration: 8 },
            { size: 10, top: "65%", left: "5%", delay: 0.8, duration: 7 },
            { size: 6, top: "75%", right: "8%", delay: 2, duration: 5 },
            { size: 4, top: "45%", left: "50%", delay: 1, duration: 9 },
        ].map((dot, i) => (
            <motion.div key={i}
                animate={{ y: [0, -14, 0], rotate: [0, 120, 240, 360] }}
                transition={{ duration: dot.duration, repeat: Infinity, ease: "easeInOut", delay: dot.delay }}
                style={{
                    position: "absolute",
                    width: dot.size,
                    height: dot.size,
                    borderRadius: "50%",
                    background: "var(--teal)",
                    opacity: 0.12,
                    top: dot.top,
                    left: dot.left,
                    right: dot.right,
                }} />
        ))}
    </div>
);

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = () => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden dot-grid"
            style={{ background: "var(--warm-white)" }}>
            <FloatingDots />

            {/* Organic blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 blob-1 opacity-10"
                style={{ background: "var(--teal)" }} />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 blob-2 opacity-8"
                style={{ background: "var(--sage)" }} />

            {/* Navbar */}
            <header style={{
                position: "sticky", top: 0, zIndex: 50,
                transition: "background 0.3s, box-shadow 0.3s",
                background: scrolled ? "rgba(248,250,249,0.92)" : "transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                boxShadow: scrolled ? "0 1px 20px rgba(15,113,115,0.08)" : "none",
            }}>
                <div className="w-full px-4 md:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="HealthVision Logo" className="w-9 h-9 object-contain" />
                        <img src="/logo-text.png" alt="HealthVision" className="h-6 w-auto object-contain mt-0.5" />
                    </Link>
                    <nav className="flex items-center gap-4 md:gap-8">
                        {["Team"].map((l) => (
                            <a key={l} href={`#${l.toLowerCase()}`}
                                className="text-xs md:text-sm font-medium transition-colors duration-200 hover:text-teal-600"
                                style={{ color: "var(--text-mid)" }}>
                                {l}
                            </a>
                        ))}
                    </nav>
                    <a href="/"
                        className="flex items-center gap-2 text-[12px] md:text-[13px] font-bold uppercase tracking-[0.15em] px-8 md:px-14 py-4 md:py-6 rounded-full transition-all duration-300 border hover:scale-105 active:scale-95 shadow-sm hover:shadow-md"
                        style={{
                            borderColor: "rgba(15,113,115,0.2)",
                            background: "rgba(15,113,115,0.03)",
                            color: "var(--teal)"
                        }}>
                        Back to Home <ArrowRight size={16} strokeWidth={3} />
                    </a>
                </div>
            </header>

            {/* Hero content */}
            <motion.div variants={stagger} initial="hidden" animate="visible"
                className="flex-1 flex flex-col items-center justify-center text-center px-4 md:px-8 py-16 md:py-24 relative z-10">

                <motion.h1 variants={fadeUp} className="font-display font-bold leading-tight max-w-4xl"
                    style={{ fontSize: "clamp(2.6rem, 6.5vw, 5rem)", color: "var(--text-dark)" }}>
                    Healthcare, made{" "}
                    <span className="italic gradient-text">human</span>{" "}
                    and{" "}
                    <span className="italic gradient-text">intelligent.</span>
                </motion.h1>

                <motion.p variants={fadeUp}
                    className="mt-6 max-w-2xl text-lg leading-relaxed"
                    style={{ color: "var(--text-mid)" }}>
                    HealthVision was built on a single conviction: that every patient deserves clarity,
                    speed, and compassion — and every doctor deserves technology that works as hard as they do.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
                    <a href="#team"
                        className="flex items-center gap-2 px-12 md:px-16 py-5 md:py-7 rounded-full font-bold text-base md:text-lg transition-all duration-200 shadow-xl hover:shadow-teal-900/10 active:scale-95"
                        style={{
                            background: "var(--cream)", color: "var(--text-dark)",
                            border: "1px solid rgba(15,113,115,0.15)"
                        }}>
                        <Users size={20} /> Meet the Team
                    </a>
                </motion.div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                <span className="text-xs font-medium" style={{ color: "var(--teal)" }}>Scroll</span>
                <div className="w-px h-10" style={{ background: "var(--teal)" }} />
            </motion.div>
        </div>
    );
};


// ─── Team Section ─────────────────────────────────────────────────────────────
const TeamSection = () => (
    <Section id="team" className="py-16 md:py-28 px-4 md:px-8" style={{ background: "var(--cream)" }}>
        <div className="w-full">
            <div className="text-center mb-8 md:mb-12">
                <SectionLabel>Meet the Team</SectionLabel>
                <motion.h2 variants={fadeUp} className="font-display font-bold leading-tight text-center"
                    style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)", color: "var(--text-dark)" }}>
                    The people building{" "}
                    <span className="italic gradient-text text-center">tomorrow's healthcare.</span>
                </motion.h2>
                <motion.p variants={fadeUp} className="mt-4 w-full text-base text-center"
                    style={{ color: "var(--text-mid)" }}>
                    A cross-disciplinary team of doctors, engineers, and researchers united by a
                    shared obsession with better medicine.
                </motion.p>
            </div>

            <motion.div variants={stagger}
                className="flex flex-wrap justify-around gap-y-12 gap-x-6 mt-12">
                {teamMembers.map((member, i) => (
                    <DeveloperCard key={member.name} member={member} index={i} />
                ))}
            </motion.div>
        </div>
    </Section>
);


// ─── CTA Section ──────────────────────────────────────────────────────────────
const CTASection = () => (
    <Section className="py-16 md:py-20 mt-12 md:mt-20" style={{ background: "var(--cream)" }}>
        <div className="w-full">
            <motion.div variants={scaleIn}
                className="w-full p-12 md:p-16 text-center relative overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, var(--teal), #0a5254)",
                    boxShadow: "0 10px 40px rgba(15,113,115,0.15)",
                }}>
                {/* Decorative */}
                <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10"
                    style={{ background: "#fff" }} />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full opacity-8"
                    style={{ background: "#fff" }} />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
                        style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)" }}>
                        <Sparkles size={12} /> Start Your Health Journey
                    </div>
                    <h2 className="font-display font-bold text-white leading-tight mb-4 text-center"
                        style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                        Your health deserves the{" "}
                        <span className="italic text-center">best possible care.</span>
                    </h2>
                    <p className="text-white/70 text-base w-full mb-10 leading-relaxed text-center">
                        Join 10,000+ patients already benefiting from AI-powered insights,
                        specialist access, and a platform designed around you.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="/signup"
                            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 hover:opacity-90"
                            style={{ background: "#fff", color: "var(--teal)" }}>
                            Get Started Free <ArrowRight size={16} />
                        </a>
                        <a href="/doctors"
                            className="flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200"
                            style={{
                                background: "rgba(255,255,255,0.12)", color: "#fff",
                                border: "1px solid rgba(255,255,255,0.25)"
                            }}>
                            <Stethoscope size={16} /> Find a Doctor
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    </Section>
);

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
    <footer className="py-4 px-6 text-center border-t border-black/5" style={{ background: "var(--text-dark)" }}>
        <div className="w-full flex flex-col items-center justify-center">
            <p className="text-xs tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
                © {new Date().getFullYear()} HealthVision Inc. All rights reserved.
            </p>
        </div>
    </footer>
);

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <GlobalStyles />
            <HeroSection />
            <TeamSection />
            <CTASection />
            <Footer />
        </>
    );
}