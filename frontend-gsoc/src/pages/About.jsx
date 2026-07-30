import { 
  Sprout, 
  Award, 
  Users, 
  Heart, 
  Target, 
  Zap, 
  Sparkles,
  Shield,
  TrendingUp,
  Leaf,
  CheckCircle,
  ArrowRight,
  Building,
  Globe,
  Star,
  Rocket,
  Lightbulb,
  ChevronDown,
  Play,
  BarChart3,
  FileText,
  Mic,
  Camera
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Link } from 'react-router-dom'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const values = [
    {
      icon: Heart,
      title: 'Financial Inclusion',
      description: 'Empowering small farmers with fair access to institutional credit.',
      gradient: 'from-rose-400 to-pink-400',
      color: 'rose'
    },
    {
      icon: Target,
      title: 'Sustainable Farming',
      description: 'Rewarding green practices and promoting sustainable agriculture.',
      gradient: 'from-emerald-400 to-cyan-400',
      color: 'emerald'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Leveraging AI and technology to solve real-world farming challenges.',
      gradient: 'from-blue-400 to-indigo-400',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Community First',
      description: 'Building trust and transparency in rural financial ecosystems.',
      gradient: 'from-purple-400 to-pink-400',
      color: 'purple'
    }
  ]

  const stats = [
    { value: '40+', label: 'Small Farmers', icon: Users },
    { value: '2+', label: 'Languages Supported', icon: Globe },
    { value: '10+', label: 'Bank Partners', icon: Building },
    { value: '95%', label: 'Approval Rate', icon: TrendingUp }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ============================================ */}
      {/* HERO SECTION - About Page */}
      {/* ============================================ */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom px-6 md:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 text-sm font-medium mb-6"
            >
              <Sparkles className="h-4 w-4" />
              About AnnData
            </motion.div>

            {/* Main Heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight"
            >
              Transforming{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Agriculture Finance
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="mt-6 text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
            >
              AI-powered credit scoring and monitoring that turns a farmer's spoken words 
              into a sanction-ready file.
            </motion.p>

            {/* Stats Row */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50"
                  >
                    <Icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MISSION & PROBLEM SECTION */}
      {/* ============================================ */}
      <section ref={ref} className="py-20 bg-white">
        <div className="container-custom px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-emerald-50/50 to-white border border-emerald-200/50 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-500"
            >
              <div className="absolute -top-4 left-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h2>
                <p className="text-slate-600 leading-relaxed">
                  To democratize access to formal credit for India's 125+ million small farmers 
                  by replacing paperwork with intelligence, and distrust with verified data.
                </p>
                <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-medium">
                  <CheckCircle className="h-4 w-4" />
                  <span>Making finance fair for everyone</span>
                </div>
              </div>
            </motion.div>

            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 rounded-3xl bg-gradient-to-br from-rose-50/50 to-white border border-rose-200/50 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-500"
            >
              <div className="absolute -top-4 left-8 w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="mt-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">The Problem</h2>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold text-lg">•</span>
                    <span>86% of farmers are small & marginal</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold text-lg">•</span>
                    <span>Only 14-27% access formal credit</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold text-lg">•</span>
                    <span>28% still rely on predatory lenders</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-rose-500 font-bold text-lg">•</span>
                    <span>No credit footprint = invisible to banks</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HOW IT WORKS - Simplified */}
      {/* ============================================ */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200/50">
              <Play className="h-4 w-4" />
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
              One Platform,{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Two Jobs
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Onboard */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-white border border-emerald-200/50 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Onboard</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Farmer speaks in their language',
                  'AI fetches land records & crop data',
                  'KrishiScore - alternative credit score',
                  'Sanction-ready loan file generated'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Monitor */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              className="relative p-8 rounded-3xl bg-white border border-blue-200/50 shadow-[0_8px_32px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Monitor</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Monthly crop photo upload',
                  'AI vision model scores crop health',
                  'Live mandi price integration',
                  'Early warning + scheme matching'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600">
                    <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* VALUES SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-white">
        <div className="container-custom px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium border border-purple-200/50">
              <Award className="h-4 w-4" />
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mt-3 tracking-tight">
              What We{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Stand For
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              const colorMap = {
                rose: 'from-rose-100 to-rose-50 text-rose-600',
                emerald: 'from-emerald-100 to-emerald-50 text-emerald-600',
                blue: 'from-blue-100 to-blue-50 text-blue-600',
                purple: 'from-purple-100 to-purple-50 text-purple-600'
              }
              const bgColor = colorMap[value.color] || colorMap.emerald

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  viewport={{ once: true }}
                  className="group relative p-6 rounded-2xl bg-white border border-slate-200/50 shadow-[0_4px_16px_rgba(15,23,42,0.04)] hover:shadow-[0_20px_60px_rgba(15,23,42,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-6 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bgColor.split(' ')[0]} ${bgColor.split(' ')[1]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                      <Icon className={`h-7 w-7 ${bgColor.split(' ')[2]}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{value.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TEAM SECTION */}
      {/* ============================================ */}
      <section className="py-20 bg-slate-50">
        <div className="container-custom px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-full blur-2xl" />
              <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-3xl p-10 md:p-14 shadow-2xl shadow-emerald-500/30 max-w-3xl mx-auto">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Rocket className="h-8 w-8 text-white" />
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Built by 8Bit-Bite</h2>
                </div>
                <p className="text-emerald-100 text-lg">
                  Innovating at the intersection of agriculture, finance, and technology.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-emerald-100 text-sm font-medium">
                    SOCF 2.0 2026
                  </span>
                  <span className="px-4 py-1 bg-white/20 rounded-full text-emerald-100 text-sm font-medium">
                    Team 8Bit-Bite
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA SECTION */}
      {/* ============================================ */}
      <section className="py-16 bg-white">
        <div className="container-custom px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Ready to Join the{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Revolution?
              </span>
            </h2>
            <p className="mt-4 text-slate-600 text-lg">
              Be part of the change that's transforming agriculture finance in India.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/farmer/signup"
                className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-semibold transition-all duration-500 hover:scale-105 shadow-[0_16px_40px_rgba(16,185,129,0.35)] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Link>
              <Link
                to="/"
                className="px-8 py-3.5 rounded-full bg-white border border-slate-200 text-slate-700 font-semibold transition-all duration-500 hover:scale-105 hover:shadow-lg"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}