import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, Filter, ExternalLink, Bookmark, Share2, 
  MessageCircle, ThumbsUp, Users, 
  ArrowRight, ChevronRight,
  Sprout, Leaf, Shield, Building, Globe, 
  Award, Diamond, Sparkles, Star, BookOpen,
  Zap, CheckCircle, Clock, TrendingUp
} from 'lucide-react'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function Directory() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('infocus')

  const categories = [
    { name: 'Agriculture & Cooperation', icon: Sprout, count: 45, color: 'from-emerald-500 to-green-600' },
    { name: 'Animal Husbandry & Fishing', icon: Leaf, count: 28, color: 'from-blue-500 to-cyan-600' },
    { name: 'Art & Culture', icon: Award, count: 32, color: 'from-purple-500 to-pink-600' },
    { name: 'Chemicals & Fertilizers', icon: Shield, count: 18, color: 'from-orange-500 to-red-600' },
    { name: 'Coal & Mine', icon: Diamond, count: 12, color: 'from-gray-600 to-gray-800' },
    { name: 'Commerce & Industry', icon: Building, count: 56, color: 'from-blue-600 to-indigo-700' },
    { name: 'Communications & IT', icon: Globe, count: 34, color: 'from-cyan-500 to-blue-600' },
    { name: 'Defence', icon: Shield, count: 22, color: 'from-red-600 to-red-800' },
    { name: 'Education & Training', icon: Users, count: 48, color: 'from-yellow-500 to-orange-600' },
    { name: 'Employment & Labour', icon: Users, count: 30, color: 'from-teal-500 to-green-600' },
    { name: 'Energy & Power', icon: Sparkles, count: 25, color: 'from-yellow-400 to-orange-500' },
    { name: 'Environment & Resources', icon: Leaf, count: 38, color: 'from-emerald-500 to-green-600' }
  ]

  const featuredSchemes = [
    {
      id: 1,
      name: 'PM-Kisan Samman Nidhi',
      description: 'Income support of ₹6,000 per year to small and marginal farmers',
      category: 'Agriculture & Cooperation',
      icon: '💰',
      status: 'Active',
      link: '#',
      color: 'emerald'
    },
    {
      id: 2,
      name: 'Kisan Credit Card (KCC)',
      description: 'Short-term credit for crop production and working capital',
      category: 'Agriculture & Cooperation',
      icon: '💳',
      status: 'Active',
      link: '#',
      color: 'blue'
    },
    {
      id: 3,
      name: 'Pradhan Mantri Fasal Bima Yojana',
      description: 'Crop insurance against natural calamities and crop failure',
      category: 'Agriculture & Cooperation',
      icon: '🛡️',
      status: 'Active',
      link: '#',
      color: 'purple'
    },
    {
      id: 4,
      name: 'Pradhan Mantri Skilling and Employability Transformation (PM-SETU)',
      description: 'Skill development and employability transformation program',
      category: 'Employment & Labour',
      icon: '🎯',
      status: 'New',
      link: '#',
      color: 'orange'
    },
    {
      id: 5,
      name: 'Entrepreneurship Skill Development Programme (ESDP)',
      description: 'Skill development program for aspiring entrepreneurs',
      category: 'Education & Training',
      icon: '🚀',
      status: 'New',
      link: '#',
      color: 'purple'
    },
    {
      id: 6,
      name: 'Prime Minister Dhan-Dhaanya Krishi Yojana',
      description: 'Comprehensive agricultural development and farmer welfare scheme',
      category: 'Agriculture & Cooperation',
      icon: '🌾',
      status: 'New',
      link: '#',
      color: 'emerald'
    }
  ]

  const newAdditions = [
    { name: 'PM Vishwakarma', category: 'Art & Culture', date: '2026-07-20' },
    { name: 'Entrepreneurship Skill Development Programme (ESDP)', category: 'Education & Training', date: '2026-07-18' },
    { name: 'Pradhan Mantri Skilling and Employability Transformation (PM-SETU)', category: 'Employment & Labour', date: '2026-07-15' },
    { name: 'Prime Minister Dhan-Dhaanya Krishi Yojana', category: 'Agriculture & Cooperation', date: '2026-07-12' }
  ]

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ============================================ */}
      {/* HEADER - Premium Glass Design */}
      {/* ============================================ */}
      <section className="relative pt-32 pb-16 bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative container-custom px-6 md:px-8">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 backdrop-blur-sm border border-emerald-200/50 text-emerald-700 text-sm font-medium mb-6"
            >
              <BookOpen className="h-4 w-4" />
              Government Schemes Directory
            </motion.div>

            {/* Heading */}
            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight"
            >
              FarmTrust{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Directory
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="mt-4 text-lg text-slate-600 max-w-2xl leading-relaxed"
            >
              A one-point source to access government schemes, subsidies, and services for farmers at all levels and from all sectors
            </motion.p>

            {/* Search Bar - Premium */}
            <motion.div 
              variants={itemVariants}
              className="mt-6"
            >
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50 transition-all">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by keyword, scheme name, or category..."
                    className="w-full pl-12 pr-32 py-3.5 bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 px-5 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-emerald-500/30">
                    Search
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
            >
              {[
                { value: '125+', label: 'Active Schemes', icon: Sparkles },
                { value: '50+', label: 'Govt Partners', icon: Building },
                { value: '12', label: 'Sectors', icon: Globe },
                { value: '10M+', label: 'Farmers Benefited', icon: Users }
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 text-center hover:bg-white/80 transition-all hover:shadow-lg"
                  >
                    <Icon className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
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
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <section ref={ref} className="py-12 bg-white">
        <div className="container-custom px-6 md:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <div className="lg:w-72 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white rounded-2xl shadow-lg p-5 sticky top-24 border border-slate-200/50"
              >
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2 text-sm">
                  <span className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-cyan-500 rounded-full" />
                  Organization Categories
                </h3>
                <div className="space-y-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <button
                    onClick={() => setActiveCategory('all')}
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-sm ${
                      activeCategory === 'all' 
                        ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 font-medium border border-emerald-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-xs bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {categories.reduce((acc, cat) => acc + cat.count, 0)}
                    </span>
                  </button>
                  {filteredCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={index}
                        onClick={() => setActiveCategory(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-xl transition-all duration-200 flex items-center justify-between group text-sm ${
                          activeCategory === category.name 
                            ? 'bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 font-medium border border-emerald-200' 
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Tabs - Premium */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-2 mb-6 bg-white rounded-2xl shadow-lg p-1 border border-slate-200/50"
              >
                <button
                  onClick={() => setActiveTab('infocus')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'infocus'
                      ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Star className="h-4 w-4" />
                  In Focus
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'new'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  New Additions
                </button>
                <button
                  onClick={() => setActiveTab('sectors')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeTab === 'sectors'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  All Sectors
                </button>
              </motion.div>

              {/* In Focus Section */}
              {activeTab === 'infocus' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Featured Scheme Card */}
                  <div className="relative bg-gradient-to-r from-emerald-600 to-cyan-600 rounded-2xl p-6 text-white overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl" />
                    
                    <div className="relative">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3">
                        ⭐ Featured Scheme
                      </span>
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold mb-2">PM-Kisan Samman Nidhi</h2>
                          <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
                            Income support of ₹6,000 per year to small and marginal farmers. 
                            The scheme provides financial assistance to farmers to help them meet their agricultural and domestic needs.
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-4">
                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">💰 ₹6,000/year</span>
                            <span className="text-xs bg-white/20 px-3 py-1 rounded-full">🌾 Small & Marginal Farmers</span>
                            <span className="text-xs bg-emerald-400/30 px-3 py-1 rounded-full border border-emerald-400/30">✅ Active</span>
                          </div>
                          <button className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 bg-white text-emerald-700 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
                            Visit Site
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="hidden lg:block">
                          <div className="w-20 h-20 bg-white/10 rounded-2xl backdrop-blur-lg flex items-center justify-center border border-white/20 text-5xl">
                            🌾
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Featured Schemes Grid */}
                  <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {featuredSchemes.slice(0, 3).map((scheme, index) => (
                      <motion.div
                        key={scheme.id}
                        variants={itemVariants}
                        className="group bg-white rounded-xl shadow-lg p-5 border border-slate-200/50 hover:shadow-xl transition-all hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{scheme.icon}</div>
                          <span className={`text-xs px-2.5 py-1 rounded-full ${
                            scheme.status === 'New' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {scheme.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mb-1">{scheme.name}</h3>
                        <p className="text-xs text-slate-500 mb-3 line-clamp-2">{scheme.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{scheme.category}</span>
                          <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1">
                            View <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* New Additions Section */}
              {activeTab === 'new' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                      New Additions
                    </h3>
                    <div className="space-y-3">
                      {newAdditions.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:border-emerald-200 transition-all hover:shadow-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                              🆕
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">{item.name}</p>
                              <p className="text-xs text-slate-500">{item.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400">{item.date}</span>
                            <button className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors">
                              Explore
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="mt-4 text-center">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 mx-auto">
                        View More <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* All Sectors Section */}
              {activeTab === 'sectors' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-emerald-600" />
                      All Sectors
                    </h3>
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 md:grid-cols-3 gap-3"
                    >
                      {categories.map((category, index) => {
                        const Icon = category.icon
                        return (
                          <motion.div
                            key={index}
                            variants={itemVariants}
                            className="group p-4 bg-slate-50 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-cyan-50 transition-all cursor-pointer border border-transparent hover:border-emerald-200"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0`}>
                                <Icon className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800 group-hover:text-emerald-700">
                                  {category.name}
                                </p>
                                <p className="text-xs text-slate-400">{category.count} schemes</p>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                    <div className="mt-4 text-center">
                      <button className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 mx-auto">
                        View All Sectors <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* FEEDBACK SECTION */}
          {/* ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12 bg-white rounded-2xl shadow-lg p-8 text-center border border-slate-200/50"
          >
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-center gap-6 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
                  <MessageCircle className="h-7 w-7 text-blue-600" />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-2xl flex items-center justify-center">
                  <ThumbsUp className="h-7 w-7 text-emerald-600" />
                </div>
                <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center">
                  <Users className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                We welcome your participation in enhancing the directory further
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Invite your comments and suggestions for improvement
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                  <Share2 className="h-4 w-4" />
                  Suggest A Site
                </button>
                <button className="px-6 py-2.5 bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 rounded-xl font-medium transition-colors flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Share Feedback
                </button>
              </div>
            </div>
          </motion.div>

          {/* ============================================ */}
          {/* FOOTER LINKS */}
          {/* ============================================ */}
          <div className="mt-8 py-6 border-t border-slate-200">
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <button className="text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Share2 className="h-4 w-4" /> Connect With Us
              </button>
              <button className="text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Link className="h-4 w-4" /> Link To Us
              </button>
              <button className="text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1">
                <Bookmark className="h-4 w-4" /> Bookmark This Page
              </button>
            </div>
            <div className="flex flex-wrap gap-4 justify-center mt-4 text-xs text-slate-500">
              <a href="#" className="hover:text-emerald-600">About Us</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600">Help</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600">Sitemap</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600">Website Policies</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600">Feedback</a>
              <span className="text-slate-300">|</span>
              <a href="#" className="hover:text-emerald-600">Contact Us</a>
            </div>
            <div className="text-center mt-4 text-xs text-slate-400">
              © 2026 FarmTrust. Developed with ❤️ for Indian Farmers
            </div>
          </div>
        </div>
      </section>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
      `}</style>
    </div>
  )
}