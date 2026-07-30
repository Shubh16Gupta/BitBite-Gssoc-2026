import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Sprout,
  Shield,
  Users,
  TrendingUp,
  Camera,
  Mic,
  FileText,
  ArrowRight,
  Star,
  Clock,
  Leaf,
  Phone,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Youtube,
  Sparkles,
  ChevronDown,
  CheckCircle,
  Zap,
  Award,
  Cloud,
  BarChart3,
  Building,
  Sun,
  Bell,
  Gauge,
  Check,
  X,
  Brain,
  Database,
  FileCheck,
  Globe,
  Headphones,
  MessageSquare,
  Plus,
  Minus,
  Droplets,
  Wind,
  CloudRain,
  Calendar,
  DollarSign,
  Crown,
  Rocket,
  CloudSun,
  LineChart,
  PieChart,
  Activity,
  Thermometer,
  Home as HomeIcon,
  Users as UsersIcon,
  LogIn,
  UserPlus,
  Heart,
  Target,
  Lightbulb,
  Trees,
  Flower2,
  Wheat,
  Apple,
  Smartphone, 
  
} from "lucide-react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import heroImage from "../assets/heroBanner.jpeg";

// ============================================
// DATA
// ============================================

const howItWorksSteps = [
  {
    icon: Mic,
    title: "Speak Naturally",
    description:
      "Farmer speaks in their own language. AnnData listens and understands.",
    gradient: "from-emerald-400 to-cyan-400",
    step: "01",
  },
  {
    icon: Brain,
    title: "AI Understands",
    description:
      "Advanced NLP converts speech into structured, actionable data instantly.",
    gradient: "from-blue-400 to-indigo-400",
    step: "02",
  },
  {
    icon: Database,
    title: "Fetches Data",
    description:
      "Automatically retrieves land records, schemes, crop details, and profile.",
    gradient: "from-purple-400 to-pink-400",
    step: "03",
  },
  {
    icon: BarChart3,
    title: "KrishiScore Generated",
    description:
      "Alternative credit score created using AI analysis of farm potential.",
    gradient: "from-orange-400 to-red-400",
    step: "04",
  },
  {
    icon: FileCheck,
    title: "Documents Created",
    description:
      "Sanction-ready loan files generated automatically. Zero paperwork.",
    gradient: "from-emerald-400 to-teal-400",
    step: "05",
  },
  {
    icon: Building,
    title: "Bank Approves",
    description: "Complete dossier with KrishiScore for instant bank decision.",
    gradient: "from-blue-400 to-cyan-400",
    step: "06",
  },
  {
    icon: Camera,
    title: "Upload Crop Photos",
    description: "Farmer continuously uploads crop images for monitoring.",
    gradient: "from-purple-400 to-pink-400",
    step: "07",
  },
  {
    icon: Gauge,
    title: "AI Monitors Health",
    description: "Computer vision analyzes crop health in real-time.",
    gradient: "from-emerald-400 to-cyan-400",
    step: "08",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Weather, market prices, schemes, and personalized suggestions.",
    gradient: "from-orange-400 to-amber-400",
    step: "09",
  },
  {
    icon: TrendingUp,
    title: "Builds Credit",
    description: "Loan repayment improves future credit opportunities.",
    gradient: "from-emerald-400 to-teal-400",
    step: "10",
  },
];

const features = [
  {
    icon: Mic,
    title: "Voice Assistant",
    gradient: "from-emerald-400 to-cyan-400",
  },
  {
    icon: Camera,
    title: "Crop Health Detection",
    gradient: "from-blue-400 to-indigo-400",
  },
  {
    icon: TrendingUp,
    title: "Loan Recommendation",
    gradient: "from-purple-400 to-pink-400",
  },
  {
    icon: BarChart3,
    title: "Alternative Credit Score",
    gradient: "from-orange-400 to-red-400",
  },
  {
    icon: FileText,
    title: "Document Generation",
    gradient: "from-emerald-400 to-teal-400",
  },
  {
    icon: Sun,
    title: "Weather Alerts",
    gradient: "from-yellow-400 to-orange-400",
  },
  {
    icon: Award,
    title: "Government Schemes",
    gradient: "from-blue-400 to-cyan-400",
  },
  {
    icon: Globe,
    title: "Live Market Prices",
    gradient: "from-purple-400 to-pink-400",
  },
];

const stats = [
  { value: "10+", label: "Farmers Addressed", icon: Users, delay: 0 },
  { value: "5x", label: "Faster Processing", icon: Clock, delay: 0.1 },
  { value: "95%", label: "Accuracy Rate", icon: TrendingUp, delay: 0.2 },
  { value: "2+", label: "Languages Supported", icon: Globe, delay: 0.3 },
  { value: "24x7", label: "AI Support", icon: Headphones, delay: 0.4 },
];

const testimonials = [
  {
    name: "Ramesh Kumar",
    village: "Punjab",
    quote:
      "AnnData understood my Punjabi instantly. My loan was approved in hours, not weeks.",
    rating: 5,
    image:
      "https://ui-avatars.com/api/?name=Ramesh+Kumar&background=0d9488&color=fff&size=80&bold=true",
  },
  {
    name: "Sita Devi",
    village: "Tamil Nadu",
    quote:
      "The crop health monitoring gave my bank confidence. Finally, fair credit for farmers.",
    rating: 5,
    image:
      "https://ui-avatars.com/api/?name=Sita+Devi&background=2563eb&color=fff&size=80&bold=true",
  },
  {
    name: "Mohan Singh",
    village: "Gujarat",
    quote:
      "No CIBIL score, no problem. AnnData showed my real farming potential.",
    rating: 5,
    image:
      "https://ui-avatars.com/api/?name=Mohan+Singh&background=f97316&color=fff&size=80&bold=true",
  },
];

const faqs = [
  {
    question: "How does AnnData's AI work?",
    answer:
      "AnnData uses advanced Natural Language Processing (NLP) to understand farmers in their native languages. Combined with computer vision for crop health analysis and machine learning for credit scoring, it creates a complete financial profile without paperwork.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. AnnData uses enterprise-grade encryption for all data. We comply with RBI guidelines and use India's Account Aggregator framework. Your data is never shared without your explicit consent.",
  },
  {
    question: "Can farmers without CIBIL score apply?",
    answer:
      "Absolutely! AnnData is designed specifically for farmers without traditional credit history. Our KrishiScore uses alternative data like land records, crop health, and farming practices to assess creditworthiness.",
  },
  {
    question: "How many languages are supported?",
    answer:
      "AnnData currently supports 30+ Indian languages including Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, and more. We're continuously adding new languages.",
  },
  {
    question: "How long does loan approval take?",
    answer:
      "With AnnData, loan approval typically takes hours instead of weeks. The AI generates complete documentation instantly, and banks can review and approve within the same day.",
  },
];

// ============================================
// ANIMATION VARIANTS
// ============================================

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease: [0.22, 1, 0.36, 1] },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function Home() {
  return (
    <div className="bg-white overflow-x-hidden">
      <Hero />
      <HowItWorks />
      <Features />
      <WhyFarmTrust />
      <DashboardPreview />
      <Stats />
      <AllInOneApp />
      <SmartInsights />
      <HigherYields />
      <TrackAnalyzeGrow />
      <EasyAccessToLoans />
      <Testimonials />
      <Team />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

// ============================================
// SECTION 1: HERO - Image Left, Text Right (No Border)
// ============================================

function Hero() {
  const heroRef = useRef(null);

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section ref={heroRef} className="relative w-full overflow-hidden bg-white">
      {/* Full-bleed hero banner. All headline/feature copy lives in the artwork
          itself, so no text is overlaid here. */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full pt-20"
      >
        <img
          src={heroImage}
          alt="AnnData — AI-powered crop intelligence and easy farm loans"
          className="w-full h-auto select-none"
          draggable="false"
        />

        {/* Soft fade into the next section */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
      </motion.div>

      {/* Actions (kept — the artwork's buttons aren't interactive) */}
      <div className="container-custom px-6 md:px-8 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8"
        >
          <Link
            to="/farmer/signup"
            className="group relative overflow-hidden rounded-full px-8 py-3.5 md:px-10 md:py-4 font-medium text-white text-sm md:text-base bg-gradient-to-r from-emerald-600 to-cyan-600 shadow-[0_15px_40px_rgba(16,185,129,0.35)] transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_25px_50px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
          >
            <span className="relative z-10 flex items-center gap-2 md:gap-3">
              Start Monitoring
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700 bg-gradient-to-r from-white/20 to-transparent" />
          </Link>

          <button
            onClick={scrollToHowItWorks}
            className="group rounded-full px-8 py-3.5 md:px-10 md:py-4 text-sm md:text-base font-medium text-slate-700 bg-white border border-slate-200 shadow-sm transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-lg flex items-center justify-center gap-2"
          >
            See How It Works
            <ChevronDown className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-y-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
// ============================================
// SECTION 2: HOW IT WORKS - Grid Flowchart Style
// ============================================

function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" ref={ref} className="py-20 bg-white relative">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200/50">
            <Sparkles className="h-4 w-4" />
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            The Complete{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Farmer Journey
            </span>
          </h2>
          <p className="mt-2 text-slate-600 text-base max-w-2xl mx-auto">
            From voice to loan approval in 10 simple steps
          </p>
        </motion.div>

        {/* Grid Flowchart - 5 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {howItWorksSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative"
              >
                <div className="relative p-5 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/70 shadow-[0_4px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] transition-all duration-400 hover:-translate-y-1 overflow-hidden h-full">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-6 transition-opacity duration-400`}
                  />

                  <div className="relative">
                    {/* Step Number */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {step.step}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-400`}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Arrow connector - only show on desktop between items */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="hidden xl:flex items-center justify-center absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                      <ChevronDown className="h-3 w-3 text-slate-400 rotate-[-90deg]" />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Mobile/Tablet Arrow Indicators */}
        <div className="flex xl:hidden justify-center mt-4 gap-2">
          <span className="text-xs text-slate-400">Scroll →</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>

        {/* Bottom Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-8"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200/50">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-slate-800">
              One intelligent platform managing the complete farmer journey
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 3: FEATURES
// ============================================

function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.05),transparent_60%),radial-gradient(circle_at_70%_80%,rgba(45,212,191,0.03),transparent_50%)]" />

      <div className="container-custom px-6 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200/50">
            <Zap className="h-4 w-4" />
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            Built for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Modern Agriculture
            </span>
          </h2>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group relative p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] transition-all duration-400 hover:-translate-y-1 hover:rotate-0.5 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-6 transition-opacity duration-400`}
                />

                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-md mb-3 group-hover:scale-110 group-hover:rotate-2 transition-all duration-400`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 4: WHY FARMTRUST
// ============================================

function WhyFarmTrust() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const traditionalSteps = [
    { label: "Visit bank branch", icon: X, red: true },
    { label: "Fill physical forms", icon: X, red: true },
    { label: "Wait for verification", icon: X, red: true },
    { label: "Manual document review", icon: X, red: true },
    { label: "Weeks of waiting", icon: X, red: true },
    { label: "Rejection risk", icon: X, red: true },
  ];

  const farmtrustSteps = [
    { label: "Speak in your language", icon: Check, green: true },
    { label: "AI understands & processes", icon: Check, green: true },
    { label: "Auto document generation", icon: Check, green: true },
    { label: "Instant KrishiScore", icon: Check, green: true },
    { label: "Approval in hours", icon: Check, green: true },
    { label: "Better credit opportunities", icon: Check, green: true },
  ];

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200/50">
            <TrendingUp className="h-4 w-4" />
            Why AnnData
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            Traditional vs{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              AnnData

            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Traditional */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-6 rounded-2xl bg-red-50/30 border border-red-200/50"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-red-100 rounded-full text-red-700 text-xs font-semibold">
              Traditional
            </div>
            <div className="mt-4 space-y-3">
              {traditionalSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-red-700/70"
                  >
                    <Icon className="h-4 w-4 text-red-500 flex-shrink-0" />
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* FarmTrust */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative p-6 rounded-2xl bg-emerald-50/30 border border-emerald-200/50"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-emerald-100 rounded-full text-emerald-700 text-xs font-semibold">
              AnnData
            </div>
            <div className="mt-4 space-y-3">
              {farmtrustSteps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-emerald-700/80"
                  >
                    <Icon className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 5: DASHBOARD PREVIEW
// ============================================

function DashboardPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-200/50">
            <Monitor className="h-4 w-4" />
            Live Platform
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            See It{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              In Action
            </span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Dashboard Frame */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-2xl">
            <div className="rounded-xl bg-slate-800/50 p-5 backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Sprout className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      AnnData Dashboard
                    </p>
                    <p className="text-xs text-slate-400">Live · Real-time</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Grid */}
              <div className="grid md:grid-cols-3 gap-3">
                {/* KrishiScore */}
                <motion.div
                  className="bg-slate-700/30 rounded-lg p-3 backdrop-blur-sm border border-slate-600/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                    KrishiScore
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">682</span>
                    <span className="text-emerald-400 text-xs font-medium">
                      +12
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "68%" } : {}}
                      transition={{ duration: 1.2, delay: 0.4 }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Good credit standing
                  </p>
                </motion.div>

                {/* Crop Health */}
                <motion.div
                  className="bg-slate-700/30 rounded-lg p-3 backdrop-blur-sm border border-slate-600/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                    Crop Health
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">92%</span>
                    <span className="text-emerald-400 text-xs font-medium">
                      Excellent
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "92%" } : {}}
                      transition={{ duration: 1.2, delay: 0.6 }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Last updated today
                  </p>
                </motion.div>

                {/* Loan Status */}
                <motion.div
                  className="bg-slate-700/30 rounded-lg p-3 backdrop-blur-sm border border-slate-600/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                    Loan Status
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">₹50K</span>
                    <span className="text-emerald-400 text-xs font-medium">
                      Approved
                    </span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-600 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={isInView ? { width: "75%" } : {}}
                      transition={{ duration: 1.2, delay: 0.8 }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    75% utilized
                  </p>
                </motion.div>
              </div>

              {/* Bottom Row */}
              <div className="mt-3 grid grid-cols-2 gap-3">
                <motion.div
                  className="bg-slate-700/30 rounded-lg p-3 backdrop-blur-sm border border-slate-600/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                    Weather
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-yellow-400" />
                    <div>
                      <p className="text-white font-semibold text-sm">28°C</p>
                      <p className="text-[10px] text-slate-400">Sunny · Good</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="bg-slate-700/30 rounded-lg p-3 backdrop-blur-sm border border-slate-600/30"
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-slate-400 text-[10px] uppercase tracking-wider">
                    Market Price
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Globe className="h-5 w-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-semibold text-sm">
                        ₹2,850/Qtl
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Wheat · Up 2.5%
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Floating Cards */}
          <motion.div
            className="absolute -top-3 -right-3 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white/20 hidden lg:block"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Loan Approved
                </p>
                <p className="text-[10px] text-slate-500">Today at 2:30 PM</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-3 -left-3 bg-white/90 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white/20 hidden lg:block"
            animate={{ y: [0, 8, 0] }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  New Scheme Available
                </p>
                <p className="text-[10px] text-slate-500">PM-Kisan update</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 6: STATISTICS
// ============================================

function Stats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-white relative overflow-hidden">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200/50">
            <BarChart3 className="h-4 w-4" />
            Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            Making a{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Difference
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, rotateX: 3 }}
                animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: stat.delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ rotateY: -2, scale: 1.03 }}
                className="group relative p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-white border border-slate-200/80 shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)] transition-all duration-400 text-center"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/4 to-cyan-500/4 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="relative">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-400">
                    <Icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-slate-900">
                    {stat.value}
                  </div>
                  <p className="mt-1 text-xs text-slate-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: ALL-IN-ONE APP
// ============================================

function AllInOneApp() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const appFeatures = [
    "Weekly crop monitoring",
    "AI analysis",
    "Better decisions",
    "Higher yields",
    "Easy financial access",
  ];

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            All-in-one{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              App for Farmers
            </span>
          </h2>
          <p className="mt-2 text-slate-600 text-lg">Smart. Simple. Powerful.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {appFeatures.map((item, index) => (
              <span key={index} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: SMART INSIGHTS
// ============================================

function SmartInsights() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-slate-50">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Smart Insights
            </span>{" "}
            from AI
          </h2>
          <p className="mt-2 text-slate-600 text-lg">Actionable intelligence in every update.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: HIGHER YIELDS
// ============================================

function HigherYields() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Higher Yields
            </span>{" "}
            Better Profits
          </h2>
          <p className="mt-2 text-slate-600 text-lg">AI-powered guidance for healthier crops.</p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: TRACK ANALYZE GROW
// ============================================

function TrackAnalyzeGrow() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const trackItems = [
    "Weekly crop monitoring",
    "AI analysis",
    "Better decisions",
    "Higher yields",
    "Easy financial access",
  ];

  return (
    <section ref={ref} className="py-20 bg-slate-50">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900">
            Track. Analyze.{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Grow. Prosper.
            </span>
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {trackItems.map((item, index) => (
              <span key={index} className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION: EASY ACCESS TO LOANS
// ============================================

function EasyAccessToLoans() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-cyan-100 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Easy Access to Loans
            </span>
          </h2>
          <p className="mt-2 text-slate-600 text-lg">Grow Without Worry</p>
          <p className="mt-1 text-slate-500">AI reports that help you get fair credit.</p>
        </motion.div>
      </div>
    </section>
  );
}
// ============================================
// SECTION 7: TESTIMONIALS
// ============================================

function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section ref={ref} className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.03),transparent_70%)]" />

      <div className="container-custom px-6 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200/50">
            <Star className="h-4 w-4 fill-amber-400" />
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            What{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Farmers Say
            </span>
          </h2>
        </motion.div>

        <div
          className="max-w-3xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.97 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative p-8 md:p-10 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
                <div className="absolute -top-5 left-8 text-5xl text-emerald-200 font-serif">
                  "
                </div>
                <div className="absolute -bottom-5 right-8 text-5xl text-emerald-200 font-serif rotate-180">
                  "
                </div>

                <div className="relative">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  <p className="text-lg md:text-xl text-slate-800 leading-relaxed font-medium">
                    "{currentTestimonial.quote}"
                  </p>

                  <div className="mt-6 flex items-center gap-3 pt-5 border-t border-slate-200/50">
                    <img
                      src={currentTestimonial.image}
                      alt={currentTestimonial.name}
                      className="w-12 h-12 rounded-full ring-2 ring-emerald-400/20"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-bold text-slate-900 text-base">
                        {currentTestimonial.name}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {currentTestimonial.village}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  index === currentIndex
                    ? "w-8 bg-emerald-600"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 8: FAQ
// ============================================

// ============================================
// SECTION: OUR TEAM
// ============================================

/**
 * Team members.
 *
 * To add a photo: upload it to Cloudinary, copy the delivered image URL
 * (https://res.cloudinary.com/<cloud>/image/upload/.../file.jpg) and paste it as
 * `photo`. Leave `photo` empty to show the initials avatar instead.
 * `role` is optional — fill it in if you want a title under the name.
 */
const TEAM_MEMBERS = [
  { name: "Adarsh Tiwari", role: "", photo: "https://res.cloudinary.com/dq8tp0hvm/image/upload/v1785399112/Pfp_vncrc3.png" },
  { name: "Shubh Gupta", role: "", photo: "https://res.cloudinary.com/dq8tp0hvm/image/upload/v1785399019/shubh_qe8crj.jpg" },
  { name: "Shivansh Sharma", role: "", photo: "https://res.cloudinary.com/dq8tp0hvm/image/upload/v1785399912/WhatsApp_Image_2026-07-30_at_9.54.32_AM_ygs8fe.jpg" },
  { name: "Aarav Sharma", role: "", photo: "https://res.cloudinary.com/dq8tp0hvm/image/upload/v1785400097/Screenshot_2026-07-30_at_1.58.11_PM_bgfdkn.png" },
  { name: "Aryan Arora", role: "", photo: "https://res.cloudinary.com/dq8tp0hvm/image/upload/v1785400629/Screenshot_2026-07-30_at_2.07.02_PM_jgjdxk.png" },
];

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function Team() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="team" ref={ref} className="py-24 bg-white relative overflow-hidden">
      {/* Soft background wash */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-100/40 rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-6 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200/50">
            <Users className="h-4 w-4" />
            Our Team
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            The People Behind{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              AnnData
            </span>
          </h2>
          <p className="mt-3 text-slate-600 text-base max-w-2xl mx-auto">
            Building AI-powered crop intelligence to help farmers grow better and access fair credit.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {TEAM_MEMBERS.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="group text-center"
            >
              <div className="relative mx-auto w-32 h-32 md:w-36 md:h-36">
                {/* Glow ring on hover */}
                <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />

                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg shadow-emerald-500/10 bg-gradient-to-br from-emerald-500 to-cyan-500 transition-transform duration-500 group-hover:-translate-y-1">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center">
                      <span className="text-3xl md:text-4xl font-bold text-white">
                        {initialsOf(member.name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="mt-4 font-semibold text-slate-900 text-base md:text-lg">
                {member.name}
              </h3>
              {member.role && (
                <p className="text-sm text-emerald-600 font-medium">{member.role}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section ref={ref} className="py-24 bg-white relative">
      <div className="container-custom px-6 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200/50">
            <MessageSquare className="h-4 w-4" />
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
            Frequently{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Asked Questions
            </span>
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">
                      {faq.question}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isOpen ? "bg-emerald-100" : ""}`}
                    >
                      {isOpen ? (
                        <Minus className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <Plus className="h-3 w-3 text-slate-500 group-hover:text-slate-700" />
                      )}
                    </div>
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 text-sm text-slate-600 leading-relaxed bg-slate-50/50 rounded-b-xl border-x border-b border-slate-200/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 9: CTA
// ============================================

function CTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(16,185,129,0.12),transparent_60%),radial-gradient(circle_at_80%_50%,rgba(45,212,191,0.08),transparent_50%)]" />
        <motion.div
          className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          animate={{
            x: [0, 60, -30, 0],
            y: [0, -40, 20, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{
            background:
              "radial-gradient(circle, rgba(16,185,129,0.15), transparent 70%)",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-[350px] h-[350px] rounded-full blur-3xl"
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 30, -15, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.1), transparent 70%)",
          }}
        />
      </div>

      <div className="container-custom px-6 md:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative p-10 md:p-14 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
              Ready to Transform <br />
              <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                Agriculture Finance?
              </span>
            </h2>
            <p className="mt-3 text-slate-300 text-base max-w-xl mx-auto">
              Join thousands of farmers accessing fair credit and sustainable
              farming incentives.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/farmer/signup"
                className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold text-base transition-all duration-500 hover:scale-105 shadow-[0_16px_40px_rgba(16,185,129,0.35)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <Link
                to="/about"
                className="px-8 py-3.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white font-semibold text-base transition-all duration-500 hover:scale-105 hover:bg-white/20 hover:border-white/30"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================
// SECTION 10: FOOTER
// ============================================

function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="container-custom px-6 md:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="h-6 w-6 text-emerald-400" />
              <span className="text-lg font-bold text-white">AnnData</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
              Credit that grows with the farmer. AI-powered agri-fintech for
              financial inclusion.
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-emerald-500/50 hover:bg-slate-700 transition-all"
              >
                <Twitter className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-emerald-500/50 hover:bg-slate-700 transition-all"
              >
                <Linkedin className="h-3.5 w-3.5" />
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center hover:border-emerald-500/50 hover:bg-slate-700 transition-all"
              >
                <Youtube className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/farmer/signup"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Register
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-emerald-400 transition-colors"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-slate-400 hover:text-slate-300 transition-colors cursor-default">
                Voice Intake
              </li>
              <li className="text-slate-400 hover:text-slate-300 transition-colors cursor-default">
                AI Analysis
              </li>
              <li className="text-slate-400 hover:text-slate-300 transition-colors cursor-default">
                Live Monitoring
              </li>
              <li className="text-slate-400 hover:text-slate-300 transition-colors cursor-default">
                Scheme Matching
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Contact</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>hello@anndata.in</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                <span>Pune, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>
            © 2026 AnnData. Built with ❤️ by Team 8Bit-Bite at GSSoc Code Fest 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// HELPER COMPONENTS
// ============================================

function Monitor({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

