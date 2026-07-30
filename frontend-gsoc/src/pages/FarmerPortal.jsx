import { Outlet, NavLink } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Camera,
  CheckCircle,
  Gift,
  Sprout,
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Sparkles,
  User,
  TrendingUp,
  Calendar,
  DollarSign,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { farmerService } from "../services/farmerService";

export default function FarmerPortal() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [annScore, setAnnScore] = useState(null);

  // Real AnnScore = average across this farmer's analyzed crop cycles.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const cycles = await farmerService.getCropCycles();
        if (!active) return;
        const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
        const perCycle = cycles
          .map((c) => avg((c.phases || []).filter((p) => p.annScore != null).map((p) => p.annScore)))
          .filter((v) => v != null);
        const overall = avg(perCycle);
        setAnnScore(overall == null ? null : Math.round(overall * 10) / 10);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const navItems = [
    { to: "/farmer", icon: LayoutDashboard, label: t("farmer.nav.dashboard") },
    { to: "/farmer/fields", icon: MapPin, label: t("farmer.nav.myFields") },
    { to: "/farmer/upload-crop", icon: Camera, label: t("farmer.nav.cropAnalysis") },
    { to: "/farmer/insurance", icon: ShieldCheck, label: t("farmer.nav.cropInsurance") },
    { to: "/farmer/apply-loan", icon: FileText, label: t("farmer.nav.applyLoan") },
    { to: "/farmer/loan-status", icon: CheckCircle, label: t("farmer.nav.loanStatus") },
    { to: "/farmer/schemes", icon: Gift, label: t("farmer.nav.schemes") },
    { to: "/farmer/profile", icon: User, label: t("farmer.nav.profile") },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 overflow-x-hidden">
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-cyan-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/10 rounded-full blur-3xl" />
      </div>

      <div className="container-custom px-6 md:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Sprout className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t("farmer.portal")}
                  </h1>
                  <p className="text-sm text-slate-500">
                    {t("farmer.portalSubtitle")}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md">
                <Bell className="h-5 w-5 text-slate-600" />
              </button>
              <Link
                to="/farmer/profile"
                className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md"
              >
                <Settings className="h-5 w-5 text-slate-600" />
              </Link>
              <button className="p-2 rounded-xl bg-white/60 backdrop-blur-sm border border-slate-200/50 hover:bg-white/80 transition-all hover:shadow-md">
                <HelpCircle className="h-5 w-5 text-slate-600" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:w-64 flex-shrink-0"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-4 sticky top-24 border border-white/50">
              {/* User Profile */}
              <div className="flex items-center gap-3 px-3 py-3 mb-4 rounded-xl bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 border border-emerald-200/30">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {user?.name?.charAt(0) || "F"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {user?.name || "Farmer"}
                  </p>
                  <p className="text-xs text-slate-500">{t("farmer.farmerAccount")}</p>
                </div>
              </div>

              {/* Navigation */}
              <motion.nav
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-1"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.to} variants={itemVariants}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-50 to-cyan-50 text-emerald-700 font-medium shadow-sm border border-emerald-200/30"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`
                        }
                        end={item.to === "/farmer"}
                      >
                        {/* ✅ FIX: Use isActive directly, not as a function */}
                        {({ isActive }) => (
                          <>
                            <div
                              className={`relative ${isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"}`}
                            >
                              <Icon className="h-5 w-5" />
                              {isActive && (
                                <span className="absolute -right-1 -top-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                              )}
                            </div>
                            <span className="text-sm flex-1">{item.label}</span>
                            {isActive && (
                              <Sparkles className="h-3 w-3 text-emerald-500" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </motion.nav>

              {/* Bottom Section - Farmer Stats */}
              <div className="mt-6 pt-4 border-t border-slate-200/50">
                <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-emerald-600/5 to-cyan-600/5 border border-emerald-200/20">
                  <p className="text-xs font-medium text-slate-700">
                    {t("farmer.yourAnnScore")}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-2xl font-bold text-emerald-600">
                      {annScore ?? "—"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {annScore == null ? t("farmer.noAnalysisYet") : "/ 100"}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${annScore ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/50 min-h-[500px]">
              {/* Page Indicator */}
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-6 pb-4 border-b border-slate-200/50">
                <Sprout className="h-4 w-4" />
                <span>Farmer Portal</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-slate-600 font-medium">
                  {navItems.find((item) => window.location.pathname === item.to)
                    ?.label || "Dashboard"}
                </span>
              </div>

              <Outlet />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
