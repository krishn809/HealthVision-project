/**
 * HealthVision — Public Marketing Homepage
 * Stack: React + Tailwind CSS + Framer Motion + Lucide React
 *
 * Aesthetic: "Clinical Luxury" — Crisp white surfaces, deep navy authority,
 * electric cyan accents, refined serif display font paired with clean sans-serif.
 * Feels like a premium private clinic, not a generic SaaS.
 */

import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  Brain,
  MessageCircle,
  CalendarCheck,
  Video,
  CreditCard,
  LayoutDashboard,
  ArrowRight,
  Shield,
  Star,
  ChevronDown,
  Activity,
  Users,
  Clock,
  CheckCircle2,
  HeartPulse,
  Sparkles,
  Upload,
  UserSearch,
  Stethoscope,
  Menu,
  X,
  Play,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";

// ─── Design Tokens ────────────────────────────────────────────────────────────
// Injected as a <style> tag so Tailwind arbitrary values stay clean.
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; }

    :root {
      --navy:   #0B1D3A;
      --navy-2: #112347;
      --cyan:   #00C8FF;
      --cyan-2: #00A8D6;
      --white:  #FAFCFF;
      --muted:  #8A9BBB;
      --glass:  rgba(255,255,255,0.06);
      --glass-border: rgba(255,255,255,0.12);
    }

    html { scroll-behavior: smooth; }

    body {
      background: var(--white);
      color: var(--navy);
      font-family: 'DM Sans', sans-serif;
      overflow-x: hidden;
    }

    .font-display { font-family: 'DM Serif Display', serif; }

    /* Noise texture overlay for hero */
    .noise::after {
      content: '';
      position: absolute;
      inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      pointer-events: none;
      z-index: 1;
    }

    /* Gradient mesh for hero */
    .hero-mesh {
      background:
        radial-gradient(ellipse 80% 60% at 20% 40%, rgba(0,200,255,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 60% 80% at 80% 20%, rgba(11,29,58,0.8) 0%, transparent 70%),
        linear-gradient(135deg, #0B1D3A 0%, #0D2451 50%, #071628 100%);
    }

    /* Glassmorphism card */
    .glass-card {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Feature card light mode */
    .feature-card {
      background: #fff;
      border: 1px solid #E8EDF5;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .feature-card:hover {
      border-color: var(--cyan-2);
      box-shadow: 0 20px 60px rgba(0,168,214,0.12);
    }

    /* Stat counter glow */
    .stat-glow { text-shadow: 0 0 40px rgba(0,200,255,0.4); }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--white); }
    ::-webkit-scrollbar-thumb { background: #C8D4E8; border-radius: 3px; }
  `}</style>
);

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.08 },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated section wrapper — triggers animation when scrolled into view */
const Section = ({ children, className = "", id }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={`scroll-mt-16 ${className}`}
    >
      {children}
    </motion.section>
  );
};

/** Pill badge */
const Badge = ({ children, dark = false }) => (
  <span
    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase
      ${dark
        ? "bg-cyan-400/10 text-cyan-300 border border-cyan-400/20"
        : "bg-[#EBF4FF] text-[#2563EB] border border-[#BFDBFE]"
      }`}
  >
    {children}
  </span>
);

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0)", "rgba(255,255,255,1)"]);
  const blur = useTransform(scrollY, [0, 80], ["blur(0px)", "blur(16px)"]);
  const shadow = useTransform(scrollY, [0, 80], ["0 0 0 rgba(0,0,0,0)", "0 2px 16px rgba(11,29,58,0.08)"]);
  const buttonColor = useTransform(scrollY, [0, 80], ["rgba(255,255,255,0.9)", "rgba(11,29,58,0.7)"]);
  const buttonHoverColor = useTransform(scrollY, [0, 80], ["#FFF", "#0B1D3A"]);

  const links = [
    { label: "Features", anchor: "#features" },
    { label: "How It Works", anchor: "#how-it-works" },
    { label: "About Us", to: "/about" },
  ];

  return (
    <motion.header
      style={{ backgroundColor: bg, backdropFilter: blur, boxShadow: shadow }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-black/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <motion.img
            src="/logo.png"
            alt="HealthVision Logo"
            whileHover={{ scale: 1.08 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-8 w-auto object-contain"
          />
          <motion.img
            src="/logo-text.png"
            alt="HealthVision"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-6 w-auto object-contain"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) =>
            l.to ? (
              <Link
                key={l.label}
                to={l.to}
                className="text-sm text-[#556A8B] hover:text-[#0B1D3A] font-medium transition-colors duration-200"
              >
                {l.label}
              </Link>
            ) : (
              <a
                key={l.label}
                href={l.anchor}
                className="text-sm text-[#556A8B] hover:text-[#0B1D3A] font-medium transition-colors duration-200"
              >
                {l.label}
              </a>
            )
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-[#556A8B] hover:text-[#0B1D3A] font-medium transition-colors px-4 py-2"
          >
            Sign in
          </Link>
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="text-sm font-medium bg-[#0B1D3A] text-white px-5 py-2.5 rounded-full hover:bg-[#112347] transition-colors"
            >
              Get Started
            </motion.button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <motion.button
          style={{ color: buttonColor }}
          className="md:hidden transition-colors"
          onClick={() => setOpen(!open)}
          whileHover={{ color: buttonHoverColor }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </motion.button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden bg-white border-t border-black/5"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((l) =>
                l.to ? (
                  <Link
                    key={l.label}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className="text-[#556A8B] hover:text-[#0B1D3A] font-medium text-sm py-1"
                  >
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.anchor}
                    onClick={() => setOpen(false)}
                    className="text-[#556A8B] hover:text-[#0B1D3A] font-medium text-sm py-1"
                  >
                    {l.label}
                  </a>
                )
              )}
              <Link to="/signup" onClick={() => setOpen(false)}>
                <button className="w-full mt-2 bg-cyan-400 text-[#0B1D3A] text-sm font-medium py-3 rounded-full">
                  Get Started Free
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = () => {
  const navigate = useNavigate();
  const handleAuthNavigation = (e, path, message) => {
    e.preventDefault();
    if (message) toast(message, { icon: '👋', duration: 2000 });
    setTimeout(() => navigate(path), 800);
  };

  // Floating orb animation
  const floatVariants = {
    animate: {
      y: [0, -18, 0],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="relative min-h-screen hero-mesh noise flex flex-col overflow-hidden">
      {/* Decorative rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[600, 800, 1050].map((size, i) => (
          <motion.div
            key={size}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.2, duration: 1.2 }}
            className="absolute rounded-full border border-white/5"
            style={{ width: size, height: size }}
          />
        ))}
      </div>

      {/* Cyan glow blob */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.18, 0.28, 0.18] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,200,255,0.35) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-28 pb-16">
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <Badge dark>
            <Sparkles size={11} />
            AI-Powered Healthcare Platform
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="font-display text-white mt-6 leading-none tracking-tight"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)" }}
        >
          Your Health,{" "}
          <span className="italic text-cyan-400">Reimagined</span>
          <br />
          by Intelligence.
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="mt-6 max-w-xl text-white/55 text-lg leading-relaxed"
        >
          Connect with top specialists, get instant AI analysis on your reports,
          and manage your entire health journey — all in one beautifully secure platform.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(0,200,255,0.4)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-cyan-400 text-[#0B1D3A] font-semibold px-8 py-4 rounded-full text-base transition-all"
            >
              Get Started Free
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
          </Link>
          <motion.button
            onClick={(e) => handleAuthNavigation(e, '/login', 'Please login to find and book appointments with octors')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="glass-card flex items-center gap-2 text-white/80 hover:text-white font-medium px-8 py-4 rounded-full text-base transition-colors cursor-pointer"
          >
            <UserSearch size={18} />
            Find a Doctor
          </motion.button>
        </motion.div>

        {/* Trust badges row */}

      </div>

      {/* Floating stat cards */}
      <div className="relative z-10 max-w-5xl mx-auto w-full px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Users, value: "Coming Soon...", label: "Patients Helped", delay: 0.6 },
            { icon: Stethoscope, value: "Coming soon...", label: "Specialist Doctors", delay: 0.75 },
            { icon: Clock, value: "24/7", label: "AI Support", delay: 0.9 },
          ].map(({ icon: Icon, value, label, delay }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="glass-card rounded-2xl px-6 py-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-400/10 flex items-center justify-center shrink-0">
                <Icon size={20} className="text-cyan-400" />
              </div>
              <div>
                <p className="text-white font-display text-2xl leading-none stat-glow">{value}</p>
                <p className="text-white/40 text-xs mt-0.5">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/30 z-10"
      >
        <ChevronDown size={22} />
      </motion.div>
    </div>
  );
};

// ─── Features Bento Grid ──────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    color: "#00C8FF",
    bg: "#EBF9FF",
    title: "AI Medical Report Analysis",
    desc: "Upload any lab report, MRI, or prescription. Our AI delivers instant plain-English insights and flags critical values in seconds.",
    wide: true,
    href: "/login"
  },
  {
    icon: MessageCircle,
    color: "#6366F1",
    bg: "#EEF2FF",
    title: "24/7 AI Health Chatbot",
    desc: "Ask any symptom, medication, or wellness question anytime. Intelligent triage that knows when to escalate to a real doctor.",
    wide: false,
    href: "/login"
  },
  {
    icon: Video,
    color: "#10B981",
    bg: "#ECFDF5",
    title: "Secure Video Consultations",
    desc: "Crystal-clear, end-to-end encrypted telehealth calls with specialists from the comfort of your home.",
    wide: false,
    href: "/login"
  },
  {
    icon: CalendarCheck,
    color: "#F59E0B",
    bg: "#FFFBEB",
    title: "Smart Appointment Booking",
    desc: "Real-time availability, specialty filtering, and intelligent scheduling that respects your time zone and preferences.",
    wide: false,
    href: "/login"
  },
  {
    icon: LayoutDashboard,
    color: "#EC4899",
    bg: "#FDF2F8",
    title: "Patient & Doctor Dashboards",
    desc: "Tailored command centres — patients track history & prescriptions, doctors manage queues & patient records.",
    wide: false,
    href: "/login"
  },
  {
    icon: CreditCard,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    title: "Seamless Secure Payments",
    desc: "Consultation fees handled with bank-grade security. Automatic receipts and insurance-ready invoices.",
    wide: true,
    tag: "PCI-DSS Level 1",
    href: "/login"
  },
];

const FeatureCard = ({ feat, i }) => {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    toast('Please login to enjoy our services', { icon: '👋', duration: 2000 });
    navigate(feat.href);
  };

  return (
    <motion.div
      onClick={handleClick}
      variants={scaleIn}
      custom={i}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`feature-card rounded-2xl p-7 flex flex-col gap-4 cursor-pointer
        ${feat.wide ? "sm:col-span-2" : ""}`}
    >
      {/* Icon */}
      <motion.div
        animate={{ rotate: hovered ? 12 : 0, scale: hovered ? 1.1 : 1 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ background: feat.bg }}
      >
        <feat.icon size={22} style={{ color: feat.color }} strokeWidth={1.8} />
      </motion.div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-[#0B1D3A] text-base">{feat.title}</h3>
          {feat.tag && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: feat.bg, color: feat.color }}
            >
              {feat.tag}
            </span>
          )}
        </div>
        <p className="text-[#556A8B] text-sm mt-2 leading-relaxed">{feat.desc}</p>
      </div>

      {/* Animated underline */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: hovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="h-0.5 w-full rounded-full origin-left"
        style={{ background: feat.color }}
      />
    </motion.div>
  );
};

const FeaturesSection = () => (
  <Section id="features" className="py-28 px-6 bg-[#F7FAFF]">
    <div className="max-w-6xl mx-auto">
      {/* Heading */}
      <div className="text-center mb-16">
        <motion.div variants={fadeUp} custom={0}>
          <Badge>
            <Activity size={11} />
            Platform Capabilities
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="font-display text-[#0B1D3A] mt-4 leading-tight"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Everything you need,<br />
          <span className="text-cyan-500 italic">intelligently connected.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-4 text-[#556A8B] max-w-xl mx-auto text-base leading-relaxed"
        >
          From AI-powered diagnostics to seamless doctor-patient communication — HealthVision
          is the only platform your healthcare needs.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((feat, i) => (
          <FeatureCard key={feat.title} feat={feat} i={i} />
        ))}
      </div>
    </div>
  </Section>
);

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    icon: Upload,
    color: "#00C8FF",
    title: "Create Your Account",
    desc: "Sign up in 60 seconds. Complete your health profile so we can personalise every experience for you.",
  },
  {
    num: "02",
    icon: Brain,
    color: "#6366F1",
    title: "Upload Reports or Find a Doctor",
    desc: "Drag & drop any medical file for instant AI analysis, or browse our verified specialist directory.",
  },
  {
    num: "03",
    icon: Video,
    color: "#10B981",
    title: "Get Consulted & Feel Better",
    desc: "Book a video call, receive prescriptions digitally, and track your recovery — all in one timeline.",
  },
];

const HowItWorksSection = () => {
  const navigate = useNavigate();
  return (
    <Section id="how-it-works" className="py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-20">
          <motion.div variants={fadeUp} custom={0}>
            <Badge>
              <CheckCircle2 size={11} />
              Simple by Design
            </Badge>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="font-display text-[#0B1D3A] mt-4 leading-tight"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Your journey to better health<br />
            <span className="italic text-[#0B1D3A]">in three steps.</span>
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-cyan-200 via-indigo-200 to-emerald-200" />

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                custom={i}
                className="flex flex-col items-center text-center"
              >
                {/* Step icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 8 }}
                  transition={{ type: "spring", stiffness: 280 }}
                  className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-lg"
                  style={{ background: `${step.color}18`, border: `1.5px solid ${step.color}30` }}
                >
                  <step.icon size={30} style={{ color: step.color }} strokeWidth={1.6} />
                  <span
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: step.color }}
                  >
                    {i + 1}
                  </span>
                </motion.div>
                <h3 className="font-semibold text-[#0B1D3A] text-lg mb-2">{step.title}</h3>
                <p className="text-[#556A8B] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Demo CTA */}
        <motion.div variants={fadeUp} custom={4} className="mt-16 text-center">
          <motion.button
            onClick={() => {
              toast('Please login to access the demo', { icon: '👋' });
              navigate('/login');
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-3 bg-[#0B1D3A] text-white font-medium px-8 py-4 rounded-full text-sm hover:bg-[#112347] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center">
              <Play size={12} fill="currentColor" className="text-[#0B1D3A] ml-0.5" />
            </div>
            Watch 2-min Demo
          </motion.button>
        </motion.div>
      </div>
    </Section>
  );
};

// ─── Social Proof / Stats ─────────────────────────────────────────────────────
const stats = [
  { value: "Coming Soon...", label: "Patients Helped", icon: Users },
  { value: "Coming Soon...", label: "Specialist Doctors", icon: Stethoscope },
  { value: "Coming Soon...", label: "Satisfaction Rate", icon: Star },
  { value: "24/7", label: "AI Support Available", icon: Clock },
];

const testimonials = [
  {
    name: "Aditya Pratap Singh",
    role: "Patient",
    text: "Uploaded my blood work and got a clear breakdown in minutes. It actually explained what each value meant instead of just listing numbers. Really helpful before my doctor visit.",
    stars: 5,
  },
  {
    name: "Dr. Udai Srivastava",
    role: "General Physician",
    text: "The appointment and video call flow is clean and reliable. Patients show up prepared, which makes consultations more productive. A solid tool for remote follow-ups.",
    stars: 5,
  },
  {
    name: "Akhil Pandey",
    role: "Patient",
    text: "Finding a specialist and booking a slot was way easier than I expected. Got everything confirmed the same evening. The video call quality was good too.",
    stars: 4,
  },
];

const SocialProofSection = () => (
  <Section className="py-28 px-6 bg-[#0B1D3A] overflow-hidden relative">
    {/* Background glow */}
    <div
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(0,200,255,0.3), transparent)",
      }}
    />

    <div className="max-w-6xl mx-auto relative z-10">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            variants={fadeUp}
            custom={i}
            className="text-center"
          >
            <motion.p
              className="font-display text-cyan-400 stat-glow leading-none"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            >
              {s.value}
            </motion.p>
            <p className="text-white/40 text-sm mt-2">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10 mb-20" />

      {/* Section heading */}
      <div className="text-center mb-12">
        <motion.h2
          variants={fadeUp}
          custom={0}
          className="font-display text-white"
          style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)" }}
        >
          Trusted by a lot of{" "}
          <span className="text-cyan-400 italic"> patients & doctors.</span>
        </motion.h2>
      </div>

      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6 }}
            className="glass-card rounded-2xl p-7 flex flex-col gap-4"
          >
            {/* Stars */}
            <div className="flex gap-1">
              {Array.from({ length: t.stars }).map((_, s) => (
                <Star
                  key={s}
                  size={14}
                  className="text-cyan-400 fill-cyan-400"
                />
              ))}
            </div>
            <p className="text-white/65 text-sm leading-relaxed flex-1">"{t.text}"</p>
            <div>
              <p className="text-white font-medium text-sm">{t.name}</p>
              <p className="text-white/35 text-xs">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </Section>
);

// ─── Final CTA Banner ─────────────────────────────────────────────────────────
const CTASection = () => {
  const navigate = useNavigate();
  return (
    <Section className="py-24 px-6 bg-[#F7FAFF]">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div variants={fadeUp} custom={0}>
          <Badge>
            <HeartPulse size={11} />
            Start Today — It's Free
          </Badge>
        </motion.div>
        <motion.h2
          variants={fadeUp}
          custom={1}
          className="font-display text-[#0B1D3A] mt-5 leading-tight"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.2rem)" }}
        >
          Take control of your health<br />
          <span className="italic text-cyan-500">before it takes control of you.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          custom={2}
          className="mt-5 text-[#556A8B] text-base leading-relaxed max-w-xl mx-auto"
        >
          Join over 10,000 patients who've already discovered smarter, faster, and more
          confident healthcare decisions with HealthVision.
        </motion.p>
        <motion.div variants={fadeUp} custom={3} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <motion.button
              whileHover={{ scale: 1.06, boxShadow: "0 0 40px rgba(0,200,255,0.35)" }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-[#0B1D3A] text-white font-semibold px-9 py-4 rounded-full text-base"
            >
              Create Free Account
              <ArrowRight size={18} strokeWidth={2.5} />
            </motion.button>
          </Link>
          <motion.button
            onClick={() => {
              toast('Browse our verified specialists and book an appointment!', { icon: '🩺', duration: 2000 });
              setTimeout(() => navigate('/doctors'), 800);
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 text-[#0B1D3A] border-2 border-[#0B1D3A]/15 hover:border-cyan-400/50 font-medium px-9 py-4 rounded-full text-base transition-colors"
          >
            <UserSearch size={18} />
            Browse Doctors
          </motion.button>
        </motion.div>
      </div>
    </Section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => {
  return (
    <footer className="bg-[#071220] text-white/20 py-4 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        {/* Row: Copyright & Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-xs tracking-wider">
            © {new Date().getFullYear()} HealthVision Inc. All rights reserved.
          </h2>

          <div className="flex items-center gap-3">
            {[
              { icon: <FaGithub size={18} />, href: "https://github.com/aditya2005-code/HealthVison" },
              { icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/rishi-tiwari023" },
              { icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/akhilpandey9/" },
              { icon: <FaLinkedin size={18} />, href: "https://www.linkedin.com/in/adityapratapsingh84" },
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/20 hover:border-cyan-400/40 hover:text-cyan-400 transition-all duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

// ─── Root Component ───────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <GlobalStyles />
      <Navbar />
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}